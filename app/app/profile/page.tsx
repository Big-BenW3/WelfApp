// --- Profile page (/app/profile, private) ---
// Server: getSession() gate; listMyIssues(viewerId) only for the signed-in user.
import { AppNav } from "@/components/app-nav";
import { ProfileScreen } from "@/components/profile-screen";
import { getSession } from "@/lib/auth/session";
import { listMyIssues } from "@/lib/store";

export const metadata = {
  title: "Your profile",
  description: "Track your Wella issues and votes.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="app-page">
        <AppNav active="profile" isAdmin={false} />
        <main className="app-main">
          <div className="app-layout">
            <aside className="app-sidebar">
              <p className="eyebrow">Your space</p>
              <p className="muted" style={{ fontSize: "0.78rem" }}>
                Log in to manage your own issues and session. You can only ever see
                your own profile — there are no public student profiles.
              </p>
            </aside>
            <section>
              <ProfileScreen session={null} issues={[]} />
            </section>
          </div>
        </main>
      </div>
    );
  }

  // Privacy: only the logged-in student's own issues are loaded here.
  // No userId query param, no directory, no way to view another profile.
  const issues = await listMyIssues(session.userId);

  return (
    <div className="app-page">
      <AppNav active="profile" isAdmin={session.role === "admin"} />
      <main className="app-main">
        <div className="app-layout">
          <aside className="app-sidebar">
            <p className="eyebrow">Your space</p>
            <p className="muted" style={{ fontSize: "0.78rem" }}>
              Manage your display name, your issue trail, and your sign-in session.
            </p>
          </aside>
          <section>
            <ProfileScreen session={session} issues={issues} />
          </section>
        </div>
      </main>
    </div>
  );
}
