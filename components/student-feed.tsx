"use client";
// ─── StudentFeed (client island for /app) ───────────────────────────────────
// Owns: sort tabs → GET /api/issues?sort= · optimistic voting → POST vote ·
// create modal + toasts. Server page (app/app/page.tsx) only passes initialIssues.
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Plus, WifiOff } from "lucide-react";
import type { Issue, SortMode, VoteDirection } from "@/lib/types";
import { IssueCard } from "./issue-card";
import { CreateIssueModal } from "./create-issue-modal";

export function StudentFeed({
  initialIssues,
  initialCreate = false,
}: {
  initialIssues: Issue[];
  initialCreate?: boolean;
}) {
  const [issues, setIssues] = useState(initialIssues);
  const [sort, setSort] = useState<SortMode>("trending");
  const [modal, setModal] = useState(initialCreate);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: string }>({ msg: "", kind: "" });
  const [feedError, setFeedError] = useState("");

  useEffect(() => {
    setModal(initialCreate);
  }, [initialCreate]);
  const showToast = (msg: string, kind = "") => {
    setToast({ msg, kind });
    window.setTimeout(() => setToast({ msg: "", kind: "" }), 2800);
  };
  const refresh = async (nextSort: SortMode) => {
    setSort(nextSort);
    setLoading(true);
    setFeedError("");
    try {
      const response = await fetch("/api/issues?sort=" + nextSort);
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.issues) setIssues(payload.issues);
      else setFeedError("Could not refresh the queue. Showing what we have.");
    } catch {
      setFeedError("You seem to be offline. Showing cached issues.");
    } finally {
      setLoading(false);
    }
  };
  const vote = async (issueId: string, direction: VoteDirection | null) => {
    const current = issues.find((issue) => issue.id === issueId);
    if (!current) return;
    const snapshot = issues;
    const optimistic = issues.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            upvotes:
              direction === "up"
                ? issue.upvotes + (current.viewerVote === "up" ? -1 : 1)
                : current.viewerVote === "up"
                  ? issue.upvotes - 1
                  : issue.upvotes,
            downvotes:
              direction === "down"
                ? issue.downvotes + (current.viewerVote === "down" ? -1 : 1)
                : current.viewerVote === "down"
                  ? issue.downvotes - 1
                  : issue.downvotes,
            viewerVote: direction,
          }
        : issue,
    );
    setIssues(optimistic);
    setBusyId(issueId);
    try {
      const response = await fetch("/api/issues/" + issueId + "/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, isAnonymous: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setIssues(snapshot);
        showToast(payload.error ?? "Could not save your vote, try again.", "error");
      } else
        setIssues((currentIssues) =>
          currentIssues.map((issue) =>
            issue.id === issueId ? { ...issue, ...payload.counts, viewerVote: direction } : issue,
          ),
        );
    } catch {
      setIssues(snapshot);
      showToast("You seem to be offline. Vote kept locally, retry soon.", "error");
    } finally {
      setBusyId(null);
    }
  };
  return (
    <>
      <div className="feed-head">
        <div>
          <div className="eyebrow">Public signal</div>
          <h1 className="display">What needs moving?</h1>
          <p className="feed-subcopy">
            A live, student-led view of welfare concerns across campus.
          </p>
        </div>
        <Link className="button secondary small" href="/app/search">
          Search issues <ArrowRight size={14} />
        </Link>
      </div>
      <div className="filter-row">
        <div className="segmented" role="tablist" aria-label="Sort issues">
          {(["trending", "newest", "commented"] as SortMode[]).map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={sort === item}
              className={sort === item ? "active" : ""}
              onClick={() => refresh(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}{" "}
              {loading && sort === item ? (
                <span className="spinner dark" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
        <span className="muted" style={{ fontSize: "0.72rem" }}>
          {loading ? "Refreshing the queue..." : issues.length + " visible issues"}
        </span>
      </div>
      {feedError && (
        <div className="notice error" role="alert" style={{ marginBottom: 14 }}>
          <WifiOff size={15} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{feedError}</span>
        </div>
      )}
      {loading ? (
        <div className="issue-list" aria-label="Loading issues">
          <div className="skeleton-card skeleton" />
          <div className="skeleton-card skeleton" />
          <div className="skeleton-card skeleton" />
        </div>
      ) : issues.length ? (
        <div className="issue-list">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onVote={(direction) => vote(issue.id, direction)}
              busy={busyId === issue.id}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No issues here yet.</h2>
          <p>Be the first person to turn a quiet frustration into a visible next step.</p>
          <button className="button primary" onClick={() => setModal(true)}>
            Create an issue
          </button>
        </div>
      )}
      <button className="create-fab" onClick={() => setModal(true)}>
        <Plus size={17} /> Create issue
      </button>
      {modal && (
        <CreateIssueModal
          onClose={() => setModal(false)}
          onCreated={(issue) => {
            setModal(false);
            setIssues((current) => [issue as Issue, ...current]);
            showToast("Issue posted - now gathering signal.", "success");
          }}
        />
      )}
      {toast.msg && (
        <div className={"toast " + toast.kind} role="status">
          {toast.kind === "success" ? <CheckCircle2 size={16} /> : null}
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}
