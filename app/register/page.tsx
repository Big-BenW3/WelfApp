// --- Register page (/register, logged-out) ---
// Same split layout; AuthForm mode=register adds pseudonym-friendly displayName.
import Link from "next/link";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Create an account",
  description: "Create a Wella account with email and password.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Brand light />
        <div className="auth-visual-copy">
          <div className="eyebrow" style={{ color: "#b8c8d8" }}>
            Your concern can move something.
          </div>
          <h1 className="display">Make the signal visible.</h1>
          <p>Start with a display name. Use a pseudonym if that helps you speak freely.</p>
        </div>
        <img src="/illustrations/design-community.svg" alt="A community working together" />
      </section>
      <section className="auth-form-wrap">
        <div>
          <Link className="muted" href="/" style={{ fontSize: "0.8rem" }}>
            ← Back to home
          </Link>
          <AuthForm mode="register" />
        </div>
      </section>
    </main>
  );
}
