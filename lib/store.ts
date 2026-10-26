// --- Store (page + API entry points) ------------------------------------------
// Thin wrappers over lib/db/repository.ts. Always require DATABASE_URL -
// demo mode was removed. Privacy: listMyIssues() only returns the viewer's own.
import { hasDatabase } from "./db/client";
import {
  addCommentInDb,
  createIssueInDb,
  findIssueFromDb,
  getAdminSummaryFromDb,
  listIssuesFromDb,
  listMyIssuesFromDb,
  updateIssueStatusInDb,
  voteInDb,
} from "./db/repository";
import type { Category, Issue, IssueStatus, SortMode, VoteDirection } from "./types";

function shouldSkipDatabase() {
  return (
    !hasDatabase() ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NODE_ENV === "test"
  );
}

function requireDatabase() {
  if (!hasDatabase()) {
    throw new Error(
      "DATABASE_URL is not set. Wella needs a Neon/Postgres database - demo mode was removed.",
    );
  }
}

export async function listIssues(
  options: {
    query?: string;
    category?: Category;
    sort?: SortMode;
  } = {},
) {
  if (shouldSkipDatabase()) {
    return [] as Issue[];
  }
  requireDatabase();
  const issues = await listIssuesFromDb(options);
  if (!issues) throw new Error("Could not load issues from the database.");
  return issues;
}

// Privacy: students can only list their own issues here. There is no
// public user directory and no route to browse another student's profile.
export async function listMyIssues(authorId: string) {
  if (shouldSkipDatabase()) {
    return [] as Issue[];
  }
  requireDatabase();
  const issues = await listMyIssuesFromDb(authorId);
  if (!issues) throw new Error("Could not load your issues.");
  return issues;
}

export async function getIssue(id: string) {
  if (shouldSkipDatabase()) {
    return null;
  }
  requireDatabase();
  return findIssueFromDb(id, false);
}

export async function getIssueForAdmin(id: string) {
  if (shouldSkipDatabase()) {
    return null;
  }
  requireDatabase();
  return findIssueFromDb(id, true);
}

export async function createIssue(
  input: {
    title: string;
    description: string;
    category: Category;
    isAnonymous: boolean;
    imageUrl?: string;
  },
  author: { id: string; displayName: string },
): Promise<Issue | null> {
  if (shouldSkipDatabase()) {
    return null;
  }
  requireDatabase();
  return createIssueInDb(input, author);
}

export async function voteIssue(
  id: string,
  userId: string,
  direction: VoteDirection | null,
  isAnonymous: boolean,
) {
  if (shouldSkipDatabase()) {
    return { upvotes: 0, downvotes: 0 };
  }
  requireDatabase();
  return voteInDb(id, userId, direction, isAnonymous);
}

export async function addComment(
  id: string,
  body: string,
  author: { id: string; displayName: string },
  isAnonymous = false,
) {
  if (shouldSkipDatabase()) {
    return null;
  }
  requireDatabase();
  return addCommentInDb(id, body, author, isAnonymous);
}

export async function updateIssueStatus(
  id: string,
  status: IssueStatus,
  adminId: string,
  note?: string,
) {
  if (shouldSkipDatabase()) {
    return null;
  }
  requireDatabase();
  return updateIssueStatusInDb(id, status, adminId, note);
}

export async function getAdminSummary() {
  if (shouldSkipDatabase()) {
    return {
      openIssues: 0,
      resolvedThisWeek: 0,
      topCategory: "Hostel" as Category,
      trending: [] as Issue[],
    };
  }
  requireDatabase();
  const summary = await getAdminSummaryFromDb();
  if (!summary) throw new Error("Could not load the admin summary.");
  return summary;
}
