import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  createIssueSchema,
  voteSchema,
  commentSchema,
  reportSchema,
  adminStatusSchema,
  parseJson,
} from "./validation";

describe("validation — emailSchema", () => {
  it("accepts valid emails", () => {
    expect(emailSchema.parse("user@example.com")).toBe("user@example.com");
    expect(emailSchema.parse("  User@Example.COM  ")).toBe("user@example.com");
  });
  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("").success).toBe(false);
  });
  it("rejects emails over 240 chars", () => {
    const long = "a".repeat(235) + "@b.com"; // 241 chars total
    expect(emailSchema.safeParse(long).success).toBe(false);
  });
});

describe("validation — passwordSchema", () => {
  it("accepts passwords >= 10 chars", () => {
    expect(passwordSchema.parse("password123")).toBe("password123");
  });
  it("rejects passwords < 10 chars", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
  });
  it("rejects passwords > 128 chars", () => {
    const long = "a".repeat(129);
    expect(passwordSchema.safeParse(long).success).toBe(false);
  });
});

describe("validation — registerSchema", () => {
  const base = { email: "alice@campus.edu", password: "StrongPass123", displayName: "Alice" };
  it("accepts valid registration", () => {
    expect(registerSchema.parse(base).displayName).toBe("Alice");
  });
  it("rejects short display names", () => {
    expect(registerSchema.safeParse({ ...base, displayName: "A" }).success).toBe(false);
  });
  it("rejects long display names", () => {
    expect(registerSchema.safeParse({ ...base, displayName: "a".repeat(61) }).success).toBe(false);
  });
  it("trims and lowercases email", () => {
    const result = registerSchema.parse({ ...base, email: "  BOB@Campus.EDU  " });
    expect(result.email).toBe("bob@campus.edu");
  });
  it("sanitizes display name control characters", () => {
    const result = registerSchema.parse({ ...base, displayName: "A\u0000B\u001fC" });
    expect(result.displayName).toBe("ABC");
  });
});

describe("validation — loginSchema", () => {
  it("accepts valid login", () => {
    expect(loginSchema.parse({ email: "a@b.com", password: "password123" })).toBeDefined();
  });
  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("validation — createIssueSchema", () => {
  const base = {
    title: "Water pressure in dorms",
    description: "The water pressure has been low for a week, especially on upper floors.",
    category: "Hostel",
  };
  it("accepts valid issue", () => {
    expect(createIssueSchema.parse(base)).toBeDefined();
  });
  it("rejects title < 8 chars", () => {
    expect(createIssueSchema.safeParse({ ...base, title: "short" }).success).toBe(false);
  });
  it("rejects title > 120 chars", () => {
    expect(createIssueSchema.safeParse({ ...base, title: "a".repeat(121) }).success).toBe(false);
  });
  it("rejects description < 24 chars", () => {
    expect(createIssueSchema.safeParse({ ...base, description: "too short" }).success).toBe(false);
  });
  it("rejects invalid category", () => {
    expect(createIssueSchema.safeParse({ ...base, category: "Illegal" }).success).toBe(false);
  });
  it("requires imageType and imageSize when imageUrl is provided", () => {
    expect(createIssueSchema.safeParse({ ...base, imageUrl: "https://example.com/photo.jpg" }).success).toBe(false);
  });
  it("accepts imageUrl without type/size when empty", () => {
    expect(createIssueSchema.parse({ ...base, imageUrl: "" })).toBeDefined();
  });
  it("rejects non-URL imageUrl", () => {
    expect(createIssueSchema.safeParse({ ...base, imageUrl: "not-a-url", imageType: "image/jpeg", imageSize: 1000 }).success).toBe(false);
  });
  it("imageUrl max 2000 chars", () => {
    const longUrl = "https://example.com/" + "a".repeat(1990);
    expect(createIssueSchema.safeParse({ ...base, imageUrl: longUrl, imageType: "image/jpeg", imageSize: 1000 }).success).toBe(false);
  });
});

describe("validation — voteSchema", () => {
  it("accepts up, down, and null directions", () => {
    expect(voteSchema.parse({ direction: "up" }).direction).toBe("up");
    expect(voteSchema.parse({ direction: "down" }).direction).toBe("down");
    expect(voteSchema.parse({ direction: null }).direction).toBe(null);
  });
  it("rejects invalid direction", () => {
    expect(voteSchema.safeParse({ direction: "sideways" }).success).toBe(false);
  });
  it("defaults isAnonymous to true", () => {
    expect(voteSchema.parse({ direction: "up" }).isAnonymous).toBe(true);
  });
});

describe("validation — commentSchema", () => {
  it("accepts valid comments", () => {
    expect(commentSchema.parse({ body: "This is a useful comment." })).toBeDefined();
  });
  it("rejects body < 2 chars", () => {
    expect(commentSchema.safeParse({ body: "x" }).success).toBe(false);
  });
  it("rejects body > 1200 chars", () => {
    expect(commentSchema.safeParse({ body: "a".repeat(1201) }).success).toBe(false);
  });
  it("sanitizes control characters", () => {
    const result = commentSchema.parse({ body: "A\u0000B" });
    expect(result.body).toBe("AB");
  });
});

describe("validation — reportSchema", () => {
  it("accepts valid reports", () => {
    expect(reportSchema.parse({ reason: "Abusive language in comment" })).toBeDefined();
  });
  it("rejects reason < 8 chars", () => {
    expect(reportSchema.safeParse({ reason: "spam" }).success).toBe(false);
  });
  it("rejects reason > 300 chars", () => {
    expect(reportSchema.safeParse({ reason: "a".repeat(301) }).success).toBe(false);
  });
});

describe("validation — adminStatusSchema", () => {
  const validStatuses = ["Under Review", "Seen", "In Progress", "Resolved", "Rejected", "Duplicate"];
  it("accepts all valid statuses", () => {
    for (const status of validStatuses) {
      expect(adminStatusSchema.parse({ status }).status).toBe(status);
    }
  });
  it("rejects invalid status", () => {
    expect(adminStatusSchema.safeParse({ status: "Archived" }).success).toBe(false);
  });
  it("trims note and limits to 1000 chars", () => {
    const result = adminStatusSchema.parse({ status: "Resolved", note: "  Fixed  " });
    expect(result.note).toBe("Fixed");
  });
  it("rejects note > 1000 chars", () => {
    expect(adminStatusSchema.safeParse({ status: "Resolved", note: "a".repeat(1001) }).success).toBe(false);
  });
});

describe("validation — parseJson", () => {
  it("returns ok with data on success", () => {
    const result = parseJson(emailSchema, "test@test.com");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("test@test.com");
  });
  it("returns ok:false with error message on failure", () => {
    const result = parseJson(emailSchema, "not-an-email");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});