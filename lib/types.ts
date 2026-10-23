// ─── Wella shared domain model ──────────────────────────────────────────────
// Start here if you are new: categories, statuses, and the public shapes
// every page and API route passes around. Privacy helpers live at the bottom.
export const CATEGORIES = ["Hostel", "Academic", "Sports", "Health", "SUG"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = [
  "Under Review",
  "Seen",
  "In Progress",
  "Resolved",
  "Rejected",
  "Duplicate",
] as const;
export type IssueStatus = (typeof STATUSES)[number];
export type VoteDirection = "up" | "down";
export type SortMode = "trending" | "newest" | "commented";

export type PublicUser = {
  id: string;
  displayName: string;
  initials: string;
};

export type Comment = {
  id: string;
  body: string;
  author: PublicUser | null;
  createdAt: string;
  isAnonymous?: boolean;
  isHidden?: boolean;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  category: Category;
  status: IssueStatus;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  author: PublicUser | null;
  isAnonymous: boolean;
  imageUrl?: string;
  officialReply?: { body: string; createdAt: string };
  comments?: Comment[];
  viewerVote?: VoteDirection | null;
};

export type AdminSummary = {
  openIssues: number;
  resolvedThisWeek: number;
  topCategory: Category;
  trending: Issue[];
};

export function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "W"
  );
}

export function statusClass(status: IssueStatus) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export function formatRelativeTime(iso: string) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(iso));
}
