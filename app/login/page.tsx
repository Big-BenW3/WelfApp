// --- Login page (/login, logged-out) ---
// Split layout: dark visual panel + AuthForm mode=login. noindex.
import Link from "next/link";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Log in", description: "Log in to Wella with email and password.", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <main className="auth-page"><section className="auth-visual"><Brand light /><div className="auth-visual-copy"><div className="eyebrow" style={{ color: "#b8c8d8" }}>Student welfare, made visible.</div><h1 className="display">See what’s moving.</h1><p>Vote, comment, and keep your own welfare trail in one place.</p></div><img src="/illustrations/project-feedback.svg" alt="People discussing feedback" /></section><section className="auth-form-wrap"><div><Link className="muted" href="/" style={{ fontSize: "0.8rem" }}>← Back to home</Link><AuthForm mode="login" /></div></section></main>;
}
