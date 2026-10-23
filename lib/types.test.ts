import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  STATUSES,
  initialsFor,
  statusClass,
  formatRelativeTime,
  type Category,
  type IssueStatus,
} from "./types";

describe("lib/types — constants", () => {
  it("defines exactly 5 categories", () => {
    expect(CATEGORIES).toEqual(["Hostel", "Academic", "Sports", "Health", "SUG"]);
  });
  it("defines exactly 6 statuses", () => {
    expect(STATUSES).toEqual([
      "Under Review",
      "Seen",
      "In Progress",
      "Resolved",
      "Rejected",
      "Duplicate",
    ]);
  });
});

describe("lib/types — initialsFor", () => {
  it("extracts initials from full name", () => {
    expect(initialsFor("John Doe")).toBe("JD");
    expect(initialsFor("Alice Bob Charlie")).toBe("AB");
    expect(initialsFor("Solo")).toBe("S");
    expect(initialsFor("")).toBe("W");
    expect(initialsFor("   ")).toBe("W");
  });
});

describe("lib/types — statusClass", () => {
  it("converts status to CSS class", () => {
    expect(statusClass("Under Review")).toBe("under-review");
    expect(statusClass("In Progress")).toBe("in-progress");
    expect(statusClass("Resolved")).toBe("resolved");
  });
});

describe("lib/types — formatRelativeTime", () => {
  it("formats recent timestamps", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("just now");
  });
  it("formats minutes ago", () => {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatRelativeTime(tenMinsAgo)).toBe("10m ago");
  });
  it("formats hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
  });
  it("formats days ago", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveDaysAgo)).toBe("5d ago");
  });
  it("falls back to date format for old timestamps", () => {
    const longAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(longAgo);
    // Intl.DateTimeFormat("en") returns "Mon DD" format (e.g. "Sep 10")
    expect(result).toMatch(/\w{3} \d{1,2}/);
  });
});