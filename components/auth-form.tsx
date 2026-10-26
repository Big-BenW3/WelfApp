"use client";
// ─── AuthForm (shared by /login + /register) ────────────────────────────────
// mode="register" adds displayName (pseudonyms OK). Field-level errors mirror
// lib/validation.ts; submit POSTs to /api/auth/* then hard-redirects to /app.
import Link from "next/link";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const next: typeof fieldErrors = {};
    if (!email.includes("@")) next.email = "Enter a valid email address.";
    if (password.length < (register ? 10 : 1))
      next.password = register ? "Use at least 10 characters." : "Enter your password.";
    if (register && displayName.trim().length < 2)
      next.displayName = "Give a display name (a pseudonym is fine).";
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/" + (register ? "register" : "login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(register ? { email, password, displayName } : { email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          payload.error ?? "Could not complete that request. Check your details and try again.",
        );
        setBusy(false);
        return;
      }
      window.location.href = "/app";
    } catch {
      setError("You seem to be offline. Reconnect and try again.");
      setBusy(false);
    }
  };
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="eyebrow">{register ? "Create your account" : "Welcome back"}</div>
      <h1 className="display">
        {register ? "Make the signal visible." : "Pick up where you left off."}
      </h1>
      <p>
        {register
          ? "Use a display name - it can be pseudonymous."
          : "Log in to vote, comment, and follow your issues."}
      </p>
      <div className="form-stack">
        {register && (
          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we show you?"
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.displayName)}
            />
            {fieldErrors.displayName && (
              <span className="field-error">
                <AlertCircle size={13} /> {fieldErrors.displayName}
              </span>
            )}
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && (
            <span className="field-error">
              <AlertCircle size={13} /> {fieldErrors.email}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={register ? "At least 10 characters" : "Your password"}
            autoComplete={register ? "new-password" : "current-password"}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password && (
            <span className="field-error">
              <AlertCircle size={13} /> {fieldErrors.password}
            </span>
          )}
        </div>
        {error && (
          <div className="notice error" role="alert">
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}
        <button className="button primary" disabled={busy} type="submit" aria-busy={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" /> Working...
            </>
          ) : register ? (
            "Create account"
          ) : (
            "Log in"
          )}
        </button>
        <span className="muted" style={{ fontSize: "0.72rem", textAlign: "center" }}>
          {register
            ? "Free forever for students · post anonymously"
            : "Your votes stay private by default"}
        </span>
      </div>
      <div className="form-footer">
        <span>{register ? "Already have an account?" : "New to Wella?"}</span>
        <Link href={register ? "/login" : "/register"}>
          {register ? "Log in" : "Create an account"}
        </Link>
      </div>
    </form>
  );
}
