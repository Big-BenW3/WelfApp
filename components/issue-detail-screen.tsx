"use client";
// ─── IssueDetailScreen (client island for /issues/[id]) ─────────────────────
// Owns: voting, comment composer (anonymous toggle), inline report form.
// Server page passes initialIssue; official reply + status rail are read-only.
import { useState } from "react";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Flag, MessageCircle } from "lucide-react";
import type { Issue, VoteDirection } from "@/lib/types";
import { formatRelativeTime, statusClass } from "@/lib/types";

export function IssueDetailScreen({ initialIssue }: { initialIssue: Issue }) {
  const [issue, setIssue] = useState(initialIssue);
  const [comment, setComment] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(true);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [busyComment, setBusyComment] = useState(false);
  const [busyVote, setBusyVote] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [toast, setToast] = useState("");
  const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(""), 2800); };
  const vote = async (direction: VoteDirection | null) => {
    setBusyVote(true); setError("");
    try {
      const response = await fetch("/api/issues/" + issue.id + "/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ direction, isAnonymous: true }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) setError(payload.error ?? "Could not save your vote, try again.");
      else setIssue((current) => ({ ...current, ...payload.counts, viewerVote: direction }));
    } catch { setError("You seem to be offline. Reconnect and retry your vote."); }
    finally { setBusyVote(false); }
  };
  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault(); setCommentError(""); setError("");
    if (comment.trim().length < 3) { setCommentError("Write a little more so it is useful to others."); return; }
    setBusyComment(true);
    try {
      const response = await fetch("/api/issues/" + issue.id + "/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: comment, isAnonymous: commentAnonymous }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setCommentError(payload.error ?? "Could not save your comment. Try again."); }
      else { setIssue((current) => ({ ...current, comments: [...(current.comments ?? []), payload.comment], commentCount: current.commentCount + 1 })); setComment(""); flash(commentAnonymous ? "Posted anonymously" : "Comment added"); }
    } catch { setCommentError("You seem to be offline. Your draft is kept — retry when reconnected."); }
    finally { setBusyComment(false); }
  };
  const sendReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reportReason.trim().length < 4) { setError("Tell us briefly what needs attention."); return; }
    try {
      const response = await fetch("/api/issues/" + issue.id + "/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: reportReason }) });
      const payload = await response.json().catch(() => ({}));
      flash(response.ok ? payload.message : (payload.error ?? "Could not send the report."));
    } catch { flash("You seem to be offline. Try reporting again soon."); }
    setReporting(false); setReportReason("");
  };
  return (
    <>
      <div className="detail-grid"><div>
        <article className="panel"><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}><span className="category-tag">{issue.category}</span><span className={"status-badge " + statusClass(issue.status)}>{issue.status}</span></div><h1 className="detail-title display">{issue.title}</h1><div className="issue-meta"><span>{formatRelativeTime(issue.createdAt)}</span><span className="divider" /><span>{issue.author ? "by " + issue.author.displayName : "Posted anonymously"}</span></div><p className="detail-copy">{issue.description}</p>{issue.imageUrl && <div className="detail-image"><img src={issue.imageUrl} alt="Issue evidence" /></div>}<div className="vote-row"><button className={issue.viewerVote === "up" ? "vote-button active" : "vote-button"} disabled={busyVote} onClick={() => vote(issue.viewerVote === "up" ? null : "up")}><ArrowUp size={14} /> {issue.upvotes}</button><button className={issue.viewerVote === "down" ? "vote-button down active" : "vote-button down"} disabled={busyVote} onClick={() => vote(issue.viewerVote === "down" ? null : "down")}><ArrowDown size={14} /> {issue.downvotes}</button><button className="button ghost small" onClick={() => setReporting((v) => !v)}><Flag size={14} /> Report</button></div>{error && <div className="notice error" role="alert" style={{ marginTop: 12 }}><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} /><span>{error}</span></div>}{reporting && <form onSubmit={sendReport} className="form-stack" style={{ marginTop: 14 }}><div className="field"><label htmlFor="report-reason">What needs attention?</label><textarea id="report-reason" value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="e.g. abusive language, spam, wrong category..." maxLength={500} /></div><div style={{ display: "flex", gap: 8 }}><button className="button primary small" type="submit">Send report</button><button className="button secondary small" type="button" onClick={() => setReporting(false)}>Cancel</button></div></form>}</article>
        {issue.officialReply && <article className="panel"><div className="eyebrow">Official reply</div><div className="reply" style={{ marginTop: 13 }}><strong>SUG Welfare Office</strong><p>{issue.officialReply.body}</p></div></article>}
        <article className="panel"><div><div className="eyebrow">Join the thread</div><h2 style={{ margin: "4px 0 0", fontSize: "1.15rem" }}><MessageCircle size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />{issue.commentCount} comments</h2></div>
          <form onSubmit={submitComment} className="form-stack" noValidate><div className="field"><label htmlFor="comment">Add context or support</label><textarea id="comment" value={comment} onChange={(e) => { setComment(e.target.value); setCommentError(""); }} placeholder="Keep it useful and respectful." maxLength={1200} aria-invalid={Boolean(commentError)} />{commentError ? <span className="field-error"><AlertCircle size={13} /> {commentError}</span> : <span className="muted" style={{ fontSize: "0.7rem" }}>Be specific — what did you see, where, when?</span>}</div><div className="toggle-row"><div><strong style={{ display: "block", fontSize: "0.82rem" }}>Reply anonymously</strong><span className="muted" style={{ fontSize: "0.72rem" }}>Other students only see Anonymous.</span></div><button type="button" className={commentAnonymous ? "toggle on" : "toggle"} onClick={() => setCommentAnonymous((value) => !value)} aria-label="Toggle anonymous reply" aria-pressed={commentAnonymous} /></div><button className="button primary small" type="submit" disabled={busyComment}>{busyComment ? <><span className="spinner" aria-hidden="true" /> Posting...</> : "Post comment"}</button></form>
          <div className="comment-list">{issue.comments?.length ? issue.comments.map((item) => <div className="comment" key={item.id}><div className="comment-head"><span><strong style={{ color: "var(--ink)" }}>{item.author ? item.author.displayName : "Anonymous"}</strong></span><span>{formatRelativeTime(item.createdAt)}</span></div><p>{item.body}</p></div>) : <div className="empty-state" style={{ marginTop: 14 }}><h2>No comments yet.</h2><p>Start the thread — add the first useful detail or show support.</p></div>}</div>
        </article>
      </div><aside><article className="panel"><div className="eyebrow">What happens next</div><p className="muted" style={{ fontSize: "0.8rem" }}>The welfare office moves this through clear statuses and replies publicly on updates.</p><div style={{ display: "grid", gap: 8, marginTop: 18 }}>{["Under Review", "Seen", "In Progress", "Resolved"].map((status) => <div key={status} className={"status-badge " + statusClass(status as Issue["status"])} style={{ width: "100%", justifyContent: "space-between" }}><span>{status}</span><span>{status === issue.status ? "Current" : ""}</span></div>)}</div></article><article className="panel"><div className="eyebrow">Privacy note</div><p className="muted" style={{ fontSize: "0.8rem", marginBottom: 0 }}>Reply anonymously. Other students only see Anonymous, no public profiles. Moderators see authors privately for abuse handling.</p></article></aside></div>
      {toast && <div className="toast success" role="status"><CheckCircle2 size={16} /><span>{toast}</span></div>}
    </>
  );
}
