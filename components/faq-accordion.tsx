"use client";
// ─── FaqAccordion (landing #faq) ────────────────────────────────────────────
// Single-open accordion: one answer visible at a time, arrow toggles,
// answers may carry a CTA link (linkLabel/linkHref) like the Synthesia inspo.
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export type FaqItem = { q: string; a: string; linkLabel?: string; linkHref?: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-acc" role="list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} role="listitem" className={isOpen ? "faq-item open" : "faq-item"}>
            <button type="button" className="faq-q" aria-expanded={isOpen} aria-controls={"faq-panel-" + i} id={"faq-button-" + i} onClick={() => setOpen(isOpen ? null : i)}>
              <span>{item.q}</span>
              <span className="faq-arrow" aria-hidden="true">{isOpen ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}</span>
            </button>
            <div id={"faq-panel-" + i} role="region" aria-labelledby={"faq-button-" + i} className="faq-a-wrap">
              <div className="faq-a-inner">
                <p className="faq-a">{item.a} {item.linkLabel && item.linkHref ? <Link href={item.linkHref} className="faq-link">{item.linkLabel}</Link> : null}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
