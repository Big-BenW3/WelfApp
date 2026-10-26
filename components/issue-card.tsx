// ─── IssueCard (feed + search + profile rows) ───────────────────────────────
// Pure presentational card: category tag, status badge, excerpt, meta line.
// Pass onVote to make it votable (feed); omit for read-only lists (search/profile).
import Link from "next/link";
import { ArrowDown, ArrowUp, MessageCircle } from "lucide-react";
import { formatRelativeTime, statusClass, type Issue, type VoteDirection } from "@/lib/types";

export function IssueCard({
  issue,
  onVote,
  busy,
}: {
  issue: Issue;
  onVote?: (direction: VoteDirection | null) => void;
  busy?: boolean;
}) {
  const score = issue.upvotes - issue.downvotes;
  return (
    <article className="issue-card">
      <div className="issue-card-top">
        <div>
          <span className="category-tag">{issue.category}</span>
          <h3>
            <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
          </h3>
        </div>
        <span className={`status-badge ${statusClass(issue.status)}`}>{issue.status}</span>
      </div>
      <p>{issue.excerpt}</p>
      <div className="issue-meta">
        <span>{formatRelativeTime(issue.createdAt)}</span>
        <span className="divider" />
        <span>{issue.author ? `by ${issue.author.displayName}` : "Anonymous"}</span>
        <span className="divider" />
        <span>
          <MessageCircle
            size={12}
            style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }}
          />
          {issue.commentCount}
        </span>
      </div>
      {onVote && (
        <div className="vote-row" aria-label="Vote on issue">
          <button
            className={`vote-button ${issue.viewerVote === "up" ? "active" : ""}`}
            disabled={busy}
            aria-label={issue.viewerVote === "up" ? "Removed upvote" : "Upvote this issue"}
            onClick={() => onVote(issue.viewerVote === "up" ? null : "up")}
          >
            <ArrowUp size={14} /> {issue.upvotes}
          </button>
          <button
            className={`vote-button down ${issue.viewerVote === "down" ? "active" : ""}`}
            disabled={busy}
            aria-label={issue.viewerVote === "down" ? "Removed downvote" : "Downvote this issue"}
            onClick={() => onVote(issue.viewerVote === "down" ? null : "down")}
          >
            <ArrowDown size={14} /> {issue.downvotes}
          </button>
          <span className="muted" style={{ marginLeft: 5, fontSize: "0.69rem" }}>
            {score > 0 ? `+${score} signal` : `${score} signal`}
          </span>
        </div>
      )}
    </article>
  );
}
