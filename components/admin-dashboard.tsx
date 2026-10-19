"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import type { AdminSummary, Issue, IssueStatus } from "@/lib/types";
import { statusClass } from "@/lib/types";

const statuses: IssueStatus[] = ["Under Review", "Seen", "In Progress", "Resolved", "Rejected", "Duplicate"];

export function AdminDashboard({ initialSummary }: { initialSummary: AdminSummary }) {
  const [summary, setSummary] = useState(initialSummary);
  const [toast, setToast] = useState("");
  const updateStatus = async (issue: Issue, status: IssueStatus) => {
    const response = await fetch(`/api/admin/issues/${issue.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setToast(payload.error ?? "This issue changed. Refresh and try again."); window.setTimeout(() => setToast(""), 3200); return; }
    setSummary((current) => ({ ...current, trending: current.trending.map((item) => item.id === issue.id ? { ...item, status } : item) }));
    setToast("Status updated"); window.setTimeout(() => setToast(""), 2200);
  };
  return <><div className="feed-head"><div><div className="eyebrow">Welfare office</div><h1 className="display">Keep the queue moving.</h1><p className="feed-subcopy">Review demand, make the next action visible, and close the loop in public.</p></div><span className="status-badge in-progress"><ShieldCheck size={13} style={{ marginRight: 5 }} /> Role-gated workspace</span></div><div className="admin-grid"><div className="admin-stat"><span>Open issues</span><b>{summary.openIssues}</b><small className="muted">needs a next step</small></div><div className="admin-stat"><span>Resolved this week</span><b>{summary.resolvedThisWeek}</b><small className="muted">visible follow-through</small></div><div className="admin-stat"><span>Top category</span><b style={{ fontSize: "1.5rem", marginTop: 14 }}>{summary.topCategory}</b><small className="muted">by active issue volume</small></div></div><div className="panel" style={{ marginTop: 18 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12 }}><div><div className="eyebrow">Priority queue</div><h2 style={{ margin: "5px 0 0", fontSize: "1.25rem" }}>Trending issues</h2></div><span className="muted" style={{ fontSize: "0.74rem" }}>Update status inline</span></div><div className="admin-table"><div className="admin-row header"><span>Issue</span><span>Category</span><span>Status</span><span>Action</span></div>{summary.trending.map((issue) => <div className="admin-row" key={issue.id}><div><h3>{issue.title}</h3><p>{issue.upvotes - issue.downvotes} signal · {issue.commentCount} comments</p></div><span className="category-tag">{issue.category}</span><span className={`status-badge ${statusClass(issue.status)}`}>{issue.status}</span><select aria-label={`Change status for ${issue.title}`} value={issue.status} onChange={(event) => updateStatus(issue, event.target.value as IssueStatus)} style={{ minHeight: 34, border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", fontSize: "0.7rem" }}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>)}</div></div><div className="panel" style={{ marginTop: 14 }}><div className="eyebrow">Operating notes</div><div className="feature-list" style={{ marginTop: 17 }}><div className="feature-row"><span><Clock3 size={15} /></span><div><h3>First response is visible</h3><p>Post an official reply to make the next action clear to everyone following the issue.</p></div></div><div className="feature-row"><span><CheckCircle2 size={15} /></span><div><h3>Close the loop publicly</h3><p>Resolved issues stay in the record so students can see what changed.</p></div></div><div className="feature-row"><span><ArrowRight size={15} /></span><div><h3>Stale updates are safe</h3><p>If another admin changes an issue first, the API returns a refresh message instead of overwriting it.</p></div></div></div></div>{toast && <div className="toast" role="status">{toast}</div>}</>;
}
