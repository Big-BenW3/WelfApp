import { describe, it, expect, beforeAll, afterAll } from "vitest";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
const hasLiveDb = Boolean(url && url.startsWith("postgres") && !url.includes("localhost:5432"));

if (!url) throw new Error("DATABASE_URL required for repository tests");
if (!hasLiveDb) {
  describe.skip("lib/db/repository - real DB integration", () => {
    it("skips without a reachable database", () => {});
  });
} else {
  const sql = postgres(url, { prepare: false });

  let testUserId: string;
  let testIssueId: string;
  let createdReportIds: string[] = [];

  describe("lib/db/repository - real DB integration", () => {
    beforeAll(async () => {
      const rows = await sql<{ id: string }[]>`
        insert into users (email, password_hash, display_name, role)
        values ('test-repo@wella.local', 'hash', 'Test User', 'student')
        on conflict (email) do update set display_name = excluded.display_name
        returning id
      `;
      testUserId = rows[0].id;
    });

    afterAll(async () => {
      if (createdReportIds.length) {
        await sql`delete from reports where id = any(${createdReportIds})`;
      }
      await sql`delete from votes where user_id = ${testUserId}`;
      await sql`delete from comments where author_id = ${testUserId}`;
      await sql`delete from issues where author_id = ${testUserId}`;
      await sql`delete from users where id = ${testUserId}`;
      await sql.end();
    });

    it("findUserByEmail finds existing user", async () => {
      const { findUserByEmail } = await import("./repository");
      const user = await findUserByEmail("test-repo@wella.local");
      expect(user).not.toBeNull();
      expect(user?.email).toBe("test-repo@wella.local");
    });

    it("findUserByEmail returns null for unknown email", async () => {
      const { findUserByEmail } = await import("./repository");
      expect(await findUserByEmail("nope@x.local")).toBeNull();
    });

    it("createIssueInDb creates an issue and returns its id", async () => {
      const { createIssueInDb } = await import("./repository");
      const issue = await createIssueInDb(
        {
          title: "Test issue for repository test",
          description: "This is a test description with enough characters to pass validation.",
          category: "Hostel",
          isAnonymous: false,
          imageUrl: undefined,
        },
        { id: testUserId, displayName: "Test User" },
      );
      expect(issue).not.toBeNull();
      testIssueId = issue!.id;
    });

    it("listIssuesFromDb returns created issue", async () => {
      const { listIssuesFromDb } = await import("./repository");
      const issues = await listIssuesFromDb({});
      expect(issues).toBeTruthy();
      const found = issues!.find((i: { id: string }) => i.id === testIssueId);
      expect(found).toBeDefined();
      expect(found?.title).toBe("Test issue for repository test");
      expect(found?.category).toBe("Hostel");
    });

    it("listIssuesFromDb filters by category", async () => {
      const { listIssuesFromDb } = await import("./repository");
      const issues = await listIssuesFromDb({ category: "Academic" });
      expect(issues).toBeTruthy();
      for (const issue of issues!) {
        expect(issue.category).toBe("Academic");
      }
    });

    it("listIssuesFromDb searches by query", async () => {
      const { listIssuesFromDb } = await import("./repository");
      const issues = await listIssuesFromDb({ query: "Test issue" });
      expect(issues).toBeTruthy();
      const found = issues!.find((i: { id: string }) => i.id === testIssueId);
      expect(found).toBeDefined();
    });

    it("listIssuesFromDb returns empty for non-matching query", async () => {
      const { listIssuesFromDb } = await import("./repository");
      const issues = await listIssuesFromDb({ query: "zzz_nonexistent_xyz" });
      expect(issues).toBeTruthy();
      expect(issues!.length).toBe(0);
    });

    it("findIssueFromDb returns issue with thread", async () => {
      const { findIssueFromDb } = await import("./repository");
      const issue = await findIssueFromDb(testIssueId);
      expect(issue).not.toBeNull();
      expect(issue?.id).toBe(testIssueId);
      expect(issue?.comments).toEqual([]);
    });

    it("findIssueFromDb returns null for unknown id", async () => {
      const { findIssueFromDb } = await import("./repository");
      expect(await findIssueFromDb("00000000-0000-0000-0000-000000000000")).toBeNull();
    });

    it("addCommentInDb adds a comment to an issue", async () => {
      const { addCommentInDb } = await import("./repository");
      const comment = await addCommentInDb(
        testIssueId,
        "This is a test comment body with enough length.",
        { id: testUserId, displayName: "Test User" },
        false,
      );
      expect(comment).not.toBeNull();
      expect(comment?.body).toBe("This is a test comment body with enough length.");
      expect(comment?.author?.displayName).toBe("Test User");
    });

    it("addCommentInDb hides author for anonymous comment", async () => {
      const { addCommentInDb } = await import("./repository");
      const comment = await addCommentInDb(
        testIssueId,
        "Anonymous test comment body.",
        { id: testUserId, displayName: "Test User" },
        true,
      );
      expect(comment).not.toBeNull();
      expect(comment?.author).toBeNull();
      expect(comment?.isAnonymous).toBe(true);
    });

    it("voteInDb records a vote and returns counts", async () => {
      const { voteInDb } = await import("./repository");
      const result = await voteInDb(testIssueId, testUserId, "up", true);
      expect(result).not.toBeNull();
      expect(result?.upvotes).toBeGreaterThanOrEqual(1);
    });

    it("voteInDb changes vote from up to down", async () => {
      const { voteInDb } = await import("./repository");
      await voteInDb(testIssueId, testUserId, "down", true);
      const result = await voteInDb(testIssueId, testUserId, "down", true);
      expect(result?.downvotes).toBeGreaterThanOrEqual(1);
    });

    it("voteInDb removes vote when direction is null", async () => {
      const { voteInDb } = await import("./repository");
      await voteInDb(testIssueId, testUserId, null, true);
      const result = await voteInDb(testIssueId, testUserId, null, true);
      expect(result?.upvotes).toBe(0);
      expect(result?.downvotes).toBe(0);
    });

    it("addReportToDb persists a report", async () => {
      const { addReportToDb } = await import("./repository");
      const report = await addReportToDb(
        testIssueId,
        testUserId,
        "This is a test report reason that is long enough.",
      );
      expect(report).not.toBeNull();
      expect(report?.reason).toBe("This is a test report reason that is long enough.");
      createdReportIds.push(String(report?.id));
    });

    it("addReportToDb returns null for nonexistent issue", async () => {
      const { addReportToDb } = await import("./repository");
      expect(
        await addReportToDb(
          "00000000-0000-0000-0000-000000000000",
          testUserId,
          "Test report reason here.",
        ),
      ).toBeNull();
    });

    it("listMyIssuesFromDb returns only the user's issues", async () => {
      const { listMyIssuesFromDb } = await import("./repository");
      const issues = await listMyIssuesFromDb(testUserId);
      expect(issues).toBeTruthy();
      for (const issue of issues!) {
        expect(issue.author?.id).toBe(testUserId);
      }
    });

    it("updateIssueStatusInDb changes issue status", async () => {
      const { updateIssueStatusInDb } = await import("./repository");
      const result = await updateIssueStatusInDb(
        testIssueId,
        "Resolved",
        testUserId,
        "Test resolution note.",
      );
      expect(result).not.toBeNull();
      expect(result?.version).toBeGreaterThanOrEqual(2);
    });
  });
}
