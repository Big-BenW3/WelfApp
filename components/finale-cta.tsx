"use client";
// ─── FinaleCta (landing bottom) ─────────────────────────────────────────────
// DocsAlot-style centered panel: dotted grid + glow, mono kicker, dual actions
// (/register primary, /app secondary) + micro trust row. Styles: .finale-*.
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinaleCta() {
  return (
    <section className="finale" aria-labelledby="cta-heading">
      <div className="container">
        <div className="finale-card reveal">
          <div className="finale-dots" aria-hidden="true" />
          <div className="finale-glow" aria-hidden="true" />
          <p className="finale-kicker">Free to join &middot; Anonymous by default</p>
          <h2 id="cta-heading" className="display finale-title">
            Your hostel is already talking.
            <br />
            Make sure the union hears the right version.
          </h2>
          <p className="finale-sub">
            Wella turns scattered welfare complaints into a visible, accountable queue
            the student community can move together.
          </p>
          <div className="finale-actions">
            <Link className="button primary finale-primary" href="/register">
              Raise what needs fixing <ArrowRight size={15} />
            </Link>
            <Link className="button secondary" href="/app">
              Open the public feed
            </Link>
          </div>
          <p className="finale-micro">2-min setup &middot; no real name needed &middot; SUG-monitored queue</p>
        </div>
      </div>
    </section>
  );
}
