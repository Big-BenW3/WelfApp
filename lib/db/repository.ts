import { getDatabase } from "./client";
import {
  initialsFor,
  type AdminSummary,
  type Category,
  type Comment,
  type Issue,
  type IssueStatus,
  type SortMode,
  type VoteDirection,
} from "../types";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: string;
};

// Privacy rule: students must never see each other's private identity.
// - Issue/comment authors are snapshots only; anonymous posts return author=null.
// - Anonymous comments keep author_id internally for moderation, but public
//   projections always strip it. Admin paths opt in via includePrivate.
function publicUser(id: string | null, displayName: string | null) {
  if (!id || !displayName) return null;
  return { id, displayName, initials: initialsFor(displayName) };
}

function toComment(
  row: Record<string, unknown>,
  includePrivate: boolean,
): Comment {
  const isAnonymous = Boolean(row.is_anonymous);
  const author =
    isAnonymous && !includePrivate
      ? null
      : (publicUser(
          row.author_id ? String(row.author_id) : null,
          row.author_name_snapshot ? String(row.author_name_snapshot) : null,
        ) ?? { id: "deleted", displayName: "Deleted user", initials: "DU" });
  return {
    id: String(row.id),
    body: String(row.body),
    author,
    createdAt: new Date(String(row.created_at)).toISOString(),
    isAnonymous,
  };
}

function rowToIssue(row: Record<string, unknown>, comments: Comment[] = []): Issue {
  const status = String(row.status) as IssueStatus;
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    excerpt: String(row.description).slice(0, 130),
    category: String(row.category) as Category,
    status,
    upvotes: Number(row.upvotes ?? 0),
    downvotes: Number(row.downvotes ?? 0),
    commentCount: Number(row.comment_count ?? comments.length ?? 0),
    createdAt: new Date(String(row.created_at)).toISOString(),
    author: row.is_anonymous ? null : publicUser(row.author_id ? String(row.author_id) : null, row.author_name_snapshot ? String(row.author_name_snapshot) : null),
    isAnonymous: Boolean(row.is_anonymous),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    officialReply: row.official_reply ? { body: String(row.official_reply), createdAt: new Date(String(row.official_reply_at ?? row.updated_at)).toISOString() } : undefined,
    comments,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<UserRecord[]>`select id, email, password_hash as "passwordHash", display_name as "displayName", role from users where email = ${email} and deleted_at is null limit 1`;
  return rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string, displayName: string) {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<UserRecord[]>`insert into users (email, password_hash, display_name) values (${email}, ${passwordHash}, ${displayName}) returning id, email, password_hash as "passwordHash", display_name as "displayName", role`;
  return rows[0] ?? null;
}

export async function listIssuesFromDb(options: { query?: string; category?: Category; sort?: SortMode }) {
  const sql = getDatabase();
  if (!sql) return null;
  const query = options.query?.trim() || "";
  const category = options.category;
  const sort = options.sort === "newest" ? sql`i.created_at desc` : options.sort === "commented" ? sql`comment_count desc, i.created_at desc` : sql`(upvotes - downvotes) desc, i.created_at desc`;
  const rows = await sql<Record<string, unknown>[]>`
    select i.id, i.title, i.description, i.category, i.status, i.is_anonymous, i.author_id, i.author_name_snapshot, i.image_url, i.official_reply, i.official_reply_at, i.created_at, i.updated_at,
      coalesce(sum(case when v.direction = 'up' then 1 else 0 end), 0)::int as upvotes,
      coalesce(sum(case when v.direction = 'down' then 1 else 0 end), 0)::int as downvotes,
      count(distinct c.id)::int as comment_count
    from issues i
    left join votes v on v.issue_id = i.id
    left join comments c on c.issue_id = i.id and c.is_hidden = false
    where (${query} = '' or i.title ilike ${`%${query}%`} or i.description ilike ${`%${query}%`})
      and (${category ?? null}::text is null or i.category = ${category ?? null})
    group by i.id
    order by ${sort}
    limit 40
  `;
  return rows.map((row) => rowToIssue(row));
}

export async function findIssueFromDb(id: string, includePrivate = false) {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<Record<string, unknown>[]>`
    select i.id, i.title, i.description, i.category, i.status, i.is_anonymous, i.author_id, i.author_name_snapshot, i.image_url, i.official_reply, i.official_reply_at, i.created_at, i.updated_at,
      coalesce(sum(case when v.direction = 'up' then 1 else 0 end), 0)::int as upvotes,
      coalesce(sum(case when v.direction = 'down' then 1 else 0 end), 0)::int as downvotes,
      count(distinct c.id)::int as comment_count
    from issues i
    left join votes v on v.issue_id = i.id
    left join comments c on c.issue_id = i.id and c.is_hidden = false
    where i.id = ${id}
    group by i.id
    limit 1
  `;
  if (!rows[0]) return null;
  const commentsRows = await sql<Record<string, unknown>[]>`select c.id, c.body, c.created_at, c.is_anonymous, c.author_id, c.author_name_snapshot from comments c where c.issue_id = ${id} and c.is_hidden = false order by c.created_at asc`;
  const comments = commentsRows.map((comment) => toComment(comment, includePrivate));
  return rowToIssue(rows[0], comments);
}

export async function createIssueInDb(input: { title: string; description: string; category: Category; isAnonymous: boolean; imageUrl?: string }, author: { id: string; displayName: string }) {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<Record<string, unknown>[]>`insert into issues (title, description, category, is_anonymous, author_id, author_name_snapshot, image_url) values (${input.title}, ${input.description}, ${input.category}, ${input.isAnonymous}, ${author.id}, ${author.displayName}, ${input.imageUrl || null}) returning id`;
  return rows[0]?.id ? findIssueFromDb(String(rows[0].id)) : null;
}

export async function voteInDb(issueId: string, userId: string, direction: VoteDirection | null, isAnonymous: boolean) {
  const sql = getDatabase();
  if (!sql) return null;
  if (!direction) await sql`delete from votes where issue_id = ${issueId} and user_id = ${userId}`;
  else await sql`insert into votes (issue_id, user_id, direction, is_anonymous) values (${issueId}, ${userId}, ${direction}, ${isAnonymous}) on conflict (issue_id, user_id) do update set direction = excluded.direction, is_anonymous = excluded.is_anonymous`;
  const rows = await sql<{ upvotes: number; downvotes: number }[]>`select count(*) filter (where direction = 'up')::int as upvotes, count(*) filter (where direction = 'down')::int as downvotes from votes where issue_id = ${issueId}`;
  return rows[0] ?? { upvotes: 0, downvotes: 0 };
}

export async function addCommentInDb(
  issueId: string,
  body: string,
  author: { id: string; displayName: string },
  isAnonymous = false,
) {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<Record<string, unknown>[]>`insert into comments (issue_id, author_id, author_name_snapshot, body, is_anonymous) values (${issueId}, ${author.id}, ${author.displayName}, ${body}, ${isAnonymous}) returning id, body, created_at, is_anonymous`;
  const row = rows[0];
  if (!row) return null;
  // Public response hides the author when the student chose anonymity.
  // The author_id stays in the row for admin moderation only.
  return toComment(
    {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      is_anonymous: row.is_anonymous,
      author_id: isAnonymous ? null : author.id,
      author_name_snapshot: isAnonymous ? null : author.displayName,
    },
    false,
  );
}

export async function updateIssueStatusInDb(id: string, status: IssueStatus, adminId: string, note?: string) {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<Record<string, unknown>[]>`update issues set status = ${status}, official_reply = coalesce(${note ?? null}, official_reply), official_reply_at = case when ${note ?? null} is not null then now() else official_reply_at end, version = version + 1, updated_at = now() where id = ${id} returning id, version`;
  if (!rows[0]) return null;
  await sql`insert into admin_actions (admin_id, issue_id, action, note) values (${adminId}, ${id}, ${`status:${status}`}, ${note ?? null})`;
  return rows[0];
}

export async function getAdminSummaryFromDb(): Promise<AdminSummary | null> {
  const issues = await listIssuesFromDb({ sort: "trending" });
  if (!issues) return null;
  const topCategory = issues.reduce<Record<string, number>>((acc, issue) => ({ ...acc, [issue.category]: (acc[issue.category] ?? 0) + 1 }), {});
  const category = (Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Hostel") as Category;
  return { openIssues: issues.filter((issue) => !["Resolved", "Rejected", "Duplicate"].includes(issue.status)).length, resolvedThisWeek: issues.filter((issue) => issue.status === "Resolved").length, topCategory: category, trending: issues.slice(0, 3) };
}

export async function listMyIssuesFromDb(authorId: string) {
  const sql = getDatabase();
  if (!sql) return null;
  const rows = await sql<Record<string, unknown>[]>`
    select i.id, i.title, i.description, i.category, i.status, i.is_anonymous, i.author_id, i.author_name_snapshot, i.image_url, i.official_reply, i.official_reply_at, i.created_at, i.updated_at,
      coalesce(sum(case when v.direction = 'up' then 1 else 0 end), 0)::int as upvotes,
      coalesce(sum(case when v.direction = 'down' then 1 else 0 end), 0)::int as downvotes,
      count(distinct c.id)::int as comment_count
    from issues i
    left join votes v on v.issue_id = i.id
    left join comments c on c.issue_id = i.id and c.is_hidden = false
    where i.author_id = ${authorId}
    group by i.id
    order by i.created_at desc
    limit 40
  `;
  return rows.map((row) => rowToIssue(row));
}
