import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getSession } from "@/lib/auth/session";
import { getAdminSummary } from "@/lib/store";

export const metadata = {
  title: "Admin dashboard",
  description: "Review, prioritize, and resolve student welfare issues.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getSession();
  // Students can never access the admin workspace — not via nav, not via URL.
  // Admin logins are intentionally not offered yet; only role=admin sessions pass.
  const isAdmin = session?.role === "admin";
  return (
    <div className="app-page">
      <AppNav active="admin" isAdmin={isAdmin} />
      <main className="app-main">
        {!isAdmin ? (
          <div
            className="empty-state"
            style={{ maxWidth: 620, margin: "60px auto" }}
          >
            <div className="eyebrow">Restricted workspace</div>
            <h2>This area is for welfare staff only.</h2>
            <p>
              Student accounts can&apos;t open the admin dashboard. Admin
              sign-in isn&apos;t available yet — it will be added separately.
            </p>
            <Link className="button primary" href="/app">
              Back to the student feed
            </Link>
          </div>
        ) : (
          <AdminDashboard initialSummary={await getAdminSummary()} />
        )}
      </main>
    </div>
  );
}

