"use client";
import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { CATEGORIES } from "@/lib/types";

export function CreateIssueModal({ onClose, onCreated }: { onClose: () => void; onCreated: (issue: unknown) => void }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Hostel", isAnonymous: false, imageUrl: "", imageType: "" });
  const [errors, setErrors] = useState<{ title?: string; description?: string; imageUrl?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: string, value: string | boolean) => { setForm((current) => ({ ...current, [key]: value })); setErrors((c) => ({ ...c, [key]: undefined })); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitError("");
    const next: typeof errors = {};
    if (form.title.trim().length < 8) next.title = "Give it a little more detail (8+ characters). " + form.title.trim().length + "/8.";
    if (form.description.trim().length < 24) next.description = "Add at least a sentence so people can act on it. " + form.description.trim().length + "/24.";
    if (form.imageUrl && !/^https?:\/\/.+\..+/.test(form.imageUrl.trim())) next.imageUrl = "That URL does not look valid. Leave it blank or paste a full link.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const response = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setSubmitError(payload.error ?? "Could not post the issue. Try again in a moment."); setBusy(false); return; }
      onCreated(payload.issue);
    } catch { setSubmitError("You seem to be offline. Your draft is kept — reconnect and retry."); setBusy(false); }
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-heading">
        <div className="modal-head"><div><div className="eyebrow">New issue</div><h2 id="create-heading">Raise what needs fixing.</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
        <form className="form-stack" onSubmit={submit} noValidate>
          <div className="field"><label htmlFor="title">Title</label><input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="What needs attention?" maxLength={120} aria-invalid={Boolean(errors.title)} aria-describedby="ct-err" /><div style={{ display: "flex", justifyContent: "space-between" }}>{errors.title ? <span className="field-error" id="ct-err"><AlertCircle size={13} /> {errors.title}</span> : <span /> }<span className="muted" style={{ fontSize: "0.7rem" }}>{form.title.trim().length}/120</span></div></div>
          <div className="field"><label htmlFor="description">What is happening?</label><textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Add enough context for someone else to understand the issue." maxLength={5000} aria-invalid={Boolean(errors.description)} aria-describedby="cd-err" /><div style={{ display: "flex", justifyContent: "space-between" }}>{errors.description ? <span className="field-error" id="cd-err"><AlertCircle size={13} /> {errors.description}</span> : <span /> }<span className="muted" style={{ fontSize: "0.7rem" }}>{form.description.trim().length}/24 min</span></div></div>
          <div className="field"><label htmlFor="category">Category</label><select id="category" value={form.category} onChange={(e) => update("category", e.target.value)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="field"><label htmlFor="imageUrl">Photo URL <span className="muted">(optional)</span></label><input id="imageUrl" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." inputMode="url" aria-invalid={Boolean(errors.imageUrl)} />{errors.imageUrl && <span className="field-error"><AlertCircle size={13} /> {errors.imageUrl}</span>}</div>
          <div className="toggle-row"><div><strong style={{ display: "block", fontSize: "0.82rem" }}>Post anonymously</strong><span className="muted" style={{ fontSize: "0.72rem" }}>Your name will be hidden from other students.</span></div><button type="button" className={form.isAnonymous ? "toggle on" : "toggle"} onClick={() => update("isAnonymous", !form.isAnonymous)} aria-label="Toggle anonymous post" aria-pressed={form.isAnonymous} /></div>
          {submitError && <div className="notice error" role="alert"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} /><span>{submitError}</span></div>}
          <button className="button primary" disabled={busy} type="submit" aria-busy={busy}>{busy ? <><span className="spinner" aria-hidden="true" /> Posting...</> : "Post issue"}</button>
        </form>
      </section>
    </div>
  );
}
