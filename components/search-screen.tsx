"use client";
// ─── SearchScreen (client island for /app/search) ───────────────────────────
// Debounced (300ms) query + category tabs → GET /api/issues?q=&category=.
// Shows skeletons while loading, helpful empty state with "clear filters".
import { useEffect, useState } from "react";
import { Search, SearchX, WifiOff } from "lucide-react";
import { CATEGORIES, type Category, type Issue } from "@/lib/types";
import { IssueCard } from "./issue-card";

export function SearchScreen({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true); setSearchError("");
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        const response = await fetch("/api/issues?" + params);
        const payload = await response.json().catch(() => ({}));
        if (response.ok) setIssues(payload.issues ?? []);
        else setSearchError("Search hiccuped. Showing the last good results.");
      } catch { setSearchError("You seem to be offline. Showing the last good results."); }
      finally { setLoading(false); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, category]);
  const hasFilter = query !== "" || category !== "";
  return (
    <>
      <div className="feed-head"><div><div className="eyebrow">Search the queue</div><h1 className="display">Find the thread.</h1><p className="feed-subcopy">Search by title or keyword, then narrow by the area of campus life it affects.</p></div></div>
      <div className="field" style={{ marginBottom: 13 }}><label className="visually-hidden" htmlFor="search">Search issues</label><div style={{ position: "relative" }}><Search size={17} color="#62758a" style={{ position: "absolute", left: 14, top: 16 }} /><input className="search-input" id="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try water, counselling, or library" style={{ paddingLeft: 42 }} aria-busy={loading} /></div></div>
      <div className="segmented" role="tablist" aria-label="Filter by category" style={{ width: "fit-content", maxWidth: "100%", overflowX: "auto", marginBottom: 20 }}><button role="tab" aria-selected={!category} className={!category ? "active" : ""} onClick={() => setCategory("")}>All</button>{CATEGORIES.map((item) => <button role="tab" aria-selected={category === item} key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {searchError && <div className="notice error" role="alert" style={{ marginBottom: 14 }}><WifiOff size={15} style={{ flexShrink: 0, marginTop: 2 }} /><span>{searchError}</span></div>}
      {loading ? <div className="issue-list" aria-label="Searching issues"><div className="skeleton-card skeleton" /><div className="skeleton-card skeleton" /><div className="skeleton-card skeleton" /></div> : issues.length ? <div className="issue-list">{issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}</div> : <div className="empty-state"><SearchX size={22} color="#62758a" style={{ margin: "0 auto 10px" }} /><h2>{hasFilter ? "No matching issues." : "Nothing in the queue yet."}</h2><p>{hasFilter ? "Try another keyword or clear the category filter — someone may have phrased it differently." : "Be the first to raise something worth tracking."}</p>{hasFilter && <button className="button secondary" onClick={() => { setQuery(""); setCategory(""); }}>Clear filters</button>}</div>}
    </>
  );
}
