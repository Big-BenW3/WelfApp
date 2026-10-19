import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="site-shell">
      <div className="container finale" style={{ paddingTop: 90 }}>
        <div className="finale-card">
          <div className="finale-dots" aria-hidden="true" />
          <div className="finale-glow" aria-hidden="true" />
          <p className="finale-kicker">404 · Not in the queue</p>
          <h1 className="display finale-title">That page moved off the record.</h1>
          <p className="finale-sub">The link may be out of date, or the issue was removed from the public queue. Start from what is actually moving.</p>
          <div className="finale-actions">
            <Link className="button primary finale-primary" href="/"><Home size={15} /> Back to Wella</Link>
            <Link className="button secondary" href="/app">Open the feed <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
