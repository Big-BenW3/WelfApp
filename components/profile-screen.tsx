"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import type { Issue } from "@/lib/types";
import { IssueCard } from "./issue-card";

export function ProfileScreen({
  session,
  issues,
}: {
  session: { displayName: string; initials: string; role: string } | null;
  issues: Issue[];
}) {
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };
  if (!session)
    return (
      <div className="empty-state">
        <h2>Your profile starts with a login.</h2>
        <p>Log in to keep track of your own issues and votes.</p>
        <Link className="button primary" href="/login">
          Log in
        </Link>
      </div>
    );
  // Privacy: this screen only ever receives the viewer's own issues
  // (see app/app/profile/page.tsx -> listMyIssues). There is no way to
  // look up another student, and anonymous posts stay anonymous here too.
  return (
    <>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <span className="avatar" style={{ width: 46, height: 46 }}>
            {session.initials}
          </span>
          <div>
            <div className="eyebrow">Your profile</div>
            <h1 style={{ margin: "4px 0 2px", fontSize: "1.35rem" }}>
              {session.displayName}
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.78rem" }}>
              Only you can see this page. Other students can&apos;t open your
              profile, and there&apos;s no student directory.
            </p>
          </div>
        </div>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 21 }}
        >
          <button className="button ghost small" onClick={logout}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
      <div className="issue-list">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
        {!issues.length && (
          <div className="empty-state">
            <h2>No issues from you yet.</h2>
            <p>Raise your first issue — you can post it anonymously.</p>
            <Link className="button secondary" href="/app">
              Browse the feed
            </Link>
          </div>
        )}
        <div className="notice success">
          Your own anonymous votes are visible to you only. Public issue cards
          show aggregate counts.
        </div>
      </div>
    </>
  );
}
