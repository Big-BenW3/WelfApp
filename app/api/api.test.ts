import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { store, session, repository } = vi.hoisted(() => ({
  store: {
    listIssues: vi.fn(),
    listMyIssues: vi.fn(),
    getIssue: vi.fn(),
    getIssueForAdmin: vi.fn(),
    createIssue: vi.fn(),
    voteIssue: vi.fn(),
    addComment: vi.fn(),
    updateIssueStatus: vi.fn(),
    getAdminSummary: vi.fn(),
  },
  session: {
    requireSession: vi.fn(),
  },
  repository: {
    addReportToDb: vi.fn(),
  },
}));

vi.mock("@/lib/store", () => store);
vi.mock("@/lib/db/repository", () => repository);
vi.mock("@/lib/auth/session", () => ({
  requireSession: session.requireSession,
}));

// ─── Shared mocks ────────────────────────────────────────────────────────────
// The store and session layers are mocked so these tests exercise the route
// handlers themselves: auth gating, payload validation, status codes and
// error envelopes. Real-DB behaviour is covered by lib/db/repository.test.ts.

import { GET as issuesGet, POST as issuesPost } from "./issues/route";
import { GET as issueGet } from "./issues/[id]/route";
import { POST as votePost } from "./issues/[id]/vote/route";
import { POST as commentPost } from "./issues/[id]/comments/route";
import { POST as reportPost } from "./issues/[id]/report/route";
import { GET as adminSummaryGet } from "./admin/summary/route";
import { PATCH as adminStatusPatch } from "./admin/issues/[id]/status/route";

const STUDENT = {
  ok: true as const,
  session: { userId: "11111111-1111-1111-1111-111111111111", displayName: "Student One", initials: "SO", role: "student" },
};
const ADMIN = {
  ok: true as const,
  session: { userId: "22222222-2222-2222-2222-222222222222", displayName: "Admin One", initials: "AO", role: "admin" },
};

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }));
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.requireSession.mockResolvedValue(STUDENT);
  });

  describe("unauthorized access", () => {
    it("POST /api/issues returns 401 without a session", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 401, message: "Please log in to continue." });
      const res = await issuesPost(jsonRequest("http://x/api/issues", { title: "Valid title here", description: "A valid description long enough to pass.", category: "Hostel" }));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Please log in to continue." });
      expect(store.createIssue).not.toHaveBeenCalled();
    });

    it("POST /api/issues/[id]/vote returns 401 without a session", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 401, message: "Please log in to continue." });
      const res = await votePost(jsonRequest("http://x/api/issues/1/vote", { direction: "up" }), ctx("1"));
      expect(res.status).toBe(401);
      expect(store.voteIssue).not.toHaveBeenCalled();
    });

    it("POST /api/issues/[id]/comments returns 401 without a session", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 401, message: "Please log in to continue." });
      const res = await commentPost(jsonRequest("http://x/api/issues/1/comments", { body: "hello there" }), ctx("1"));
      expect(res.status).toBe(401);
      expect(store.addComment).not.toHaveBeenCalled();
    });

    it("POST /api/issues/[id]/report returns 401 without a session", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 401, message: "Please log in to continue." });
      const res = await reportPost(jsonRequest("http://x/api/issues/1/report", { reason: "this needs attention" }), ctx("1"));
      expect(res.status).toBe(401);
    });

    it("GET /api/admin/summary returns 401 without a session", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 401, message: "Please log in to continue." });
      const res = await adminSummaryGet();
      expect(res.status).toBe(401);
      expect(store.getAdminSummary).not.toHaveBeenCalled();
    });

    it("GET /api/admin/summary returns 403 for a student", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 403, message: "You do not have access to this workspace." });
      const res = await adminSummaryGet();
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "You do not have access to this workspace." });
    });

    it("PATCH /api/admin/issues/[id]/status returns 403 for a student", async () => {
      session.requireSession.mockResolvedValue({ ok: false as const, status: 403, message: "You do not have access to this workspace." });
      const res = await adminStatusPatch(jsonRequest("http://x/api/admin/issues/1/status", { status: "Resolved" }), ctx("1"));
      expect(res.status).toBe(403);
      expect(store.updateIssueStatus).not.toHaveBeenCalled();
    });
  });

  describe("invalid payloads", () => {
    it("POST /api/issues rejects a too-short title", async () => {
      const res = await issuesPost(jsonRequest("http://x/api/issues", { title: "short", description: "A valid description long enough to pass validation.", category: "Hostel" }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBeTruthy();
      expect(store.createIssue).not.toHaveBeenCalled();
    });

    it("POST /api/issues rejects an unknown category", async () => {
      const res = await issuesPost(jsonRequest("http://x/api/issues", { title: "A perfectly fine title", description: "A valid description long enough to pass validation.", category: "Nonsense" }));
      expect(res.status).toBe(400);
      expect(store.createIssue).not.toHaveBeenCalled();
    });

    it("POST /api/issues rejects a malformed JSON body", async () => {
      const req = new NextRequest("http://x/api/issues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      });
      const res = await issuesPost(req);
      expect(res.status).toBe(400);
      expect(store.createIssue).not.toHaveBeenCalled();
    });

    it("POST /api/issues/[id]/vote rejects an unknown direction", async () => {
      const res = await votePost(jsonRequest("http://x/api/issues/1/vote", { direction: "sideways" }), ctx("1"));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Choose an upvote, downvote, or remove your vote.");
      expect(store.voteIssue).not.toHaveBeenCalled();
    });

    it("POST /api/issues/[id]/comments rejects a too-short body", async () => {
      const res = await commentPost(jsonRequest("http://x/api/issues/1/comments", { body: "x" }), ctx("1"));
      expect(res.status).toBe(400);
      expect(store.addComment).not.toHaveBeenCalled();
    });

    it("POST /api/issues/[id]/report rejects a too-short reason", async () => {
      const res = await reportPost(jsonRequest("http://x/api/issues/1/report", { reason: "bad" }), ctx("1"));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Tell us briefly what needs attention.");
    });

    it("PATCH /api/admin/issues/[id]/status rejects an unknown status", async () => {
      session.requireSession.mockResolvedValue(ADMIN);
      const res = await adminStatusPatch(jsonRequest("http://x/api/admin/issues/1/status", { status: "Vaporised" }), ctx("1"));
      expect(res.status).toBe(400);
      expect(store.updateIssueStatus).not.toHaveBeenCalled();
    });
  });

  describe("missing records", () => {
    it("GET /api/issues/[id] returns 404 for an unknown issue", async () => {
      store.getIssue.mockResolvedValue(null);
      const res = await issueGet(new Request("http://x/api/issues/nope"), ctx("nope"));
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Issue not found." });
    });

    it("POST /api/issues returns 500 when the store fails", async () => {
      store.createIssue.mockResolvedValue(null);
      const res = await issuesPost(jsonRequest("http://x/api/issues", {
        title: "A perfectly fine title",
        description: "A valid description long enough to pass validation.",
        category: "Hostel",
      }));
      expect(res.status).toBe(500);
      expect((await res.json()).error).toBe("Could not create the issue right now.");
    });

    it("POST /api/issues/[id]/vote returns 404 for an unknown issue", async () => {
      store.voteIssue.mockResolvedValue(null);
      const res = await votePost(jsonRequest("http://x/api/issues/1/vote", { direction: "up" }), ctx("1"));
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Issue not found." });
    });

    it("POST /api/issues/[id]/comments returns 404 for an unknown issue", async () => {
      store.addComment.mockResolvedValue(null);
      const res = await commentPost(jsonRequest("http://x/api/issues/1/comments", { body: "a valid comment body" }), ctx("1"));
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Issue not found." });
    });

    it("POST /api/issues/[id]/report returns 404 for an unknown issue", async () => {
      const repo = await import("@/lib/db/repository");
      const spy = vi.spyOn(repo, "addReportToDb").mockResolvedValue(null);
      const res = await reportPost(jsonRequest("http://x/api/issues/1/report", { reason: "this needs attention now" }), ctx("1"));
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Issue not found." });
      spy.mockRestore();
    });

    it("PATCH /api/admin/issues/[id]/status returns 409 for a missing issue", async () => {
      session.requireSession.mockResolvedValue(ADMIN);
      store.updateIssueStatus.mockResolvedValue(null);
      const res = await adminStatusPatch(jsonRequest("http://x/api/admin/issues/1/status", { status: "Resolved" }), ctx("1"));
      expect(res.status).toBe(409);
      expect((await res.json()).error).toContain("no longer exists");
    });
  });

  describe("success paths", () => {
    it("GET /api/issues returns the public feed without a session", async () => {
      store.listIssues.mockResolvedValue([{ id: "1", title: "Hello" }]);
      const res = await issuesGet(new NextRequest("http://x/api/issues?q=hello&category=Hostel&sort=newest"));
      expect(res.status).toBe(200);
      const payload = await res.json();
      expect(payload.issues).toHaveLength(1);
      expect(store.listIssues).toHaveBeenCalledWith({ query: "hello", category: "Hostel", sort: "newest" });
    });

    it("GET /api/issues ignores an unknown category and falls back to trending", async () => {
      store.listIssues.mockResolvedValue([]);
      const res = await issuesGet(new NextRequest("http://x/api/issues?category=Nonsense&sort=bogus"));
      expect(res.status).toBe(200);
      expect(store.listIssues).toHaveBeenCalledWith({ query: undefined, category: undefined, sort: "trending" });
    });

    it("POST /api/issues creates an issue for a signed-in student", async () => {
      store.createIssue.mockResolvedValue({ id: "issue-1", title: "A perfectly fine title" });
      const res = await issuesPost(jsonRequest("http://x/api/issues", {
        title: "A perfectly fine title",
        description: "A valid description long enough to pass validation.",
        category: "Hostel",
        isAnonymous: false,
      }));
      expect(res.status).toBe(201);
      expect(store.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({ title: "A perfectly fine title", category: "Hostel" }),
        { id: STUDENT.session.userId, displayName: "Student One" },
      );
    });

    it("POST /api/issues/[id]/vote records a vote and returns counts", async () => {
      store.voteIssue.mockResolvedValue({ upvotes: 3, downvotes: 0 });
      const res = await votePost(jsonRequest("http://x/api/issues/1/vote", { direction: "up", isAnonymous: true }), ctx("1"));
      expect(res.status).toBe(200);
      expect((await res.json()).counts).toEqual({ upvotes: 3, downvotes: 0 });
      expect(store.voteIssue).toHaveBeenCalledWith("1", STUDENT.session.userId, "up", true);
    });

    it("POST /api/issues/[id]/vote accepts null to clear a vote", async () => {
      store.voteIssue.mockResolvedValue({ upvotes: 0, downvotes: 0 });
      const res = await votePost(jsonRequest("http://x/api/issues/1/vote", { direction: null }), ctx("1"));
      expect(res.status).toBe(200);
      expect(store.voteIssue).toHaveBeenCalledWith("1", STUDENT.session.userId, null, true);
    });

    it("POST /api/issues/[id]/comments creates a comment", async () => {
      store.addComment.mockResolvedValue({ id: "c1", body: "a valid comment body" });
      const res = await commentPost(jsonRequest("http://x/api/issues/1/comments", { body: "a valid comment body", isAnonymous: true }), ctx("1"));
      expect(res.status).toBe(201);
      expect(store.addComment).toHaveBeenCalledWith(
        "1",
        "a valid comment body",
        { id: STUDENT.session.userId, displayName: "Student One" },
        true,
      );
    });

    it("PATCH /api/admin/issues/[id]/status lets an admin update the status", async () => {
      session.requireSession.mockResolvedValue(ADMIN);
      store.updateIssueStatus.mockResolvedValue({ id: "1", version: 2 });
      const res = await adminStatusPatch(jsonRequest("http://x/api/admin/issues/1/status", { status: "Resolved", note: "Handled." }), ctx("1"));
      expect(res.status).toBe(200);
      expect(store.updateIssueStatus).toHaveBeenCalledWith("1", "Resolved", ADMIN.session.userId, "Handled.");
    });

    it("GET /api/admin/summary returns the summary for an admin", async () => {
      session.requireSession.mockResolvedValue(ADMIN);
      store.getAdminSummary.mockResolvedValue({ openIssues: 2, resolvedThisWeek: 1, topCategory: "Hostel", trending: [] });
      const res = await adminSummaryGet();
      expect(res.status).toBe(200);
      expect((await res.json()).summary.openIssues).toBe(2);
    });
  });
});
