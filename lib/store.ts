// ─── Store (page + API entry points) ────────────────────────────────────────
// Thin wrappers over lib/db/repository.ts. Always require DATABASE_URL —
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
import type {
  Category,
  Issue,
  IssueStatus,
  SortMode,
  VoteDirection,
} from "./types";

function requireDatabase() {
  if (!hasDatabase()) {
    throw new Error(
      "DATABASE_URL is not set. Wella needs a Neon/Postgres database — demo mode was removed.",
    );
  }
}

export async function listIssues(options: {
  query?: string;
  category?: Category;
  sort?: SortMode;
} = {}) {
  requireDatabase();
  const issues = await listIssuesFromDb(options);
  if (!issues) throw new Error("Could not load issues from the database.");
  return issues;
}

// Privacy: students can only list their own issues here. There is no
// public user directory and no route to browse another student's profile.
export async function listMyIssues(authorId: string) {
  requireDatabase();
  const issues = await listMyIssuesFromDb(authorId);
  if (!issues) throw new Error("Could not load your issues.");
  return issues;
}

export async function getIssue(id: string) {
  requireDatabase();
  return findIssueFromDb(id, false);
}

export async function getIssueForAdmin(id: string) {
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
  requireDatabase();
  return createIssueInDb(input, author);
}

export async function voteIssue(
  id: string,
  userId: string,
  direction: VoteDirection | null,
  isAnonymous: boolean,
) {
  requireDatabase();
  return voteInDb(id, userId, direction, isAnonymous);
}

export async function addComment(
  id: string,
  body: string,
  author: { id: string; displayName: string },
  isAnonymous = false,
) {
  requireDatabase();
  return addCommentInDb(id, body, author, isAnonymous);
}

export async function updateIssueStatus(
  id: string,
  status: IssueStatus,
  adminId: string,
  note?: string,
) {
  requireDatabase();
  return updateIssueStatusInDb(id, status, adminId, note);
}

export async function getAdminSummary() {
  requireDatabase();
  const summary = await getAdminSummaryFromDb();
  if (!summary) throw new Error("Could not load the admin summary.");
  return summary;
}

