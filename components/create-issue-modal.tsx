"use client";
// ─── CreateIssueModal (opened from feed FAB / nav) ──────────────────────────
// Validates title/description, allows optional image upload from the device,
// and posts only clean metadata so empty fields never trigger enum errors.
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ImageUp, X } from "lucide-react";
import { CATEGORIES } from "@/lib/types";

type FormState = {
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  imageUrl: string;
  imageType: string;
  imageSize: number | null;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "Hostel",
  isAnonymous: false,
  imageUrl: "",
  imageType: "",
  imageSize: null,
};

export function CreateIssueModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (issue: unknown) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<{ title?: string; description?: string; imageUrl?: string }>(
    {},
  );
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = (key: keyof FormState, value: string | boolean | number | null) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key === "imageUrl" ? "imageUrl" : "title"]: undefined,
    }));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, imageUrl: "", imageType: "", imageSize: null }));
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrors((current) => ({ ...current, imageUrl: "Choose a JPG, PNG, or WebP image." }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | ArrayBuffer | null;
      if (typeof result !== "string") {
        setErrors((current) => ({
          ...current,
          imageUrl: "This image could not be read. Try another file.",
        }));
        return;
      }

      setForm((current) => ({
        ...current,
        imageUrl: result,
        imageType: file.type,
        imageSize: file.size,
      }));
      setErrors((current) => ({ ...current, imageUrl: undefined }));
    };
    reader.onerror = () => {
      setErrors((current) => ({
        ...current,
        imageUrl: "This image could not be read. Try another file.",
      }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    const next: typeof errors = {};
    if (form.title.trim().length < 8)
      next.title =
        "Give it a little more detail (8+ characters). " + form.title.trim().length + "/8.";
    if (form.description.trim().length < 24)
      next.description =
        "Add at least a sentence so people can act on it. " +
        form.description.trim().length +
        "/24.";
    if (
      form.imageUrl &&
      !/^data:image\/(jpeg|png|webp);base64,/.test(form.imageUrl.trim()) &&
      !/^https?:\/\/.+\..+/.test(form.imageUrl.trim())
    ) {
      next.imageUrl = "That image does not look valid. Upload a file or paste a full link.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl || undefined,
        imageType: form.imageType || undefined,
        imageSize: form.imageSize ?? undefined,
      };

      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(result.error ?? "Could not post the issue. Try again in a moment.");
        setBusy(false);
        return;
      }
      onCreated(result.issue);
    } catch {
      setSubmitError("You seem to be offline. Your draft is kept - reconnect and retry.");
      setBusy(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-heading">
        <div className="modal-head">
          <div>
            <div className="eyebrow">New issue</div>
            <h2 id="create-heading">Raise what needs fixing.</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form className="form-stack" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="What needs attention?"
              maxLength={120}
              aria-invalid={Boolean(errors.title)}
              aria-describedby="ct-err"
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {errors.title ? (
                <span className="field-error" id="ct-err">
                  <AlertCircle size={13} /> {errors.title}
                </span>
              ) : (
                <span />
              )}
              <span className="muted" style={{ fontSize: "0.7rem" }}>
                {form.title.trim().length}/120
              </span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">What is happening?</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Add enough context for someone else to understand the issue."
              maxLength={5000}
              aria-invalid={Boolean(errors.description)}
              aria-describedby="cd-err"
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {errors.description ? (
                <span className="field-error" id="cd-err">
                  <AlertCircle size={13} /> {errors.description}
                </span>
              ) : (
                <span />
              )}
              <span className="muted" style={{ fontSize: "0.7rem" }}>
                {form.description.trim().length}/24 min
              </span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="image-upload">
              Photo <span className="muted">(optional)</span>
            </label>
            <div
              className="upload-box"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                hidden
              />
              <ImageUp size={18} />
              <span>{form.imageUrl ? "Change image" : "Upload a photo from your device"}</span>
            </div>
            {form.imageUrl && (
              <div className="inline-preview">
                <img src={form.imageUrl} alt="Issue preview" />
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      imageUrl: "",
                      imageType: "",
                      imageSize: null,
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            )}
            {errors.imageUrl && (
              <span className="field-error">
                <AlertCircle size={13} /> {errors.imageUrl}
              </span>
            )}
          </div>

          <div className="toggle-row">
            <div>
              <strong style={{ display: "block", fontSize: "0.82rem" }}>Post anonymously</strong>
              <span className="muted" style={{ fontSize: "0.72rem" }}>
                Your name will be hidden from other students.
              </span>
            </div>
            <button
              type="button"
              className={form.isAnonymous ? "toggle on" : "toggle"}
              onClick={() => update("isAnonymous", !form.isAnonymous)}
              aria-label="Toggle anonymous post"
              aria-pressed={form.isAnonymous}
            />
          </div>

          {submitError && (
            <div className="notice error" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{submitError}</span>
            </div>
          )}
          <button className="button primary" disabled={busy} type="submit" aria-busy={busy}>
            {busy ? (
              <>
                <span className="spinner" aria-hidden="true" /> Posting...
              </>
            ) : (
              "Post issue"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
