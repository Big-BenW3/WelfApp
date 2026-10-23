// --- Feed page (/app) ---
// Server: trending issues via listIssues(); ?create=1 auto-opens the modal.
import { listIssues } from "@/lib/store";
import { AppNav } from "@/components/app-nav";
import { StudentFeed } from "@/components/student-feed";

export const metadata = { title: "Wella feed", description: "See what students are raising and what is moving."};

export default async function AppPage({ searchParams }: { searchParams: Promise<{ create?: string }> }) {
  const params = await searchParams;
  const issues = await listIssues({ sort: "trending" });
  return <div className="app-page"><AppNav active="feed" /><main className="app-main"><div className="app-layout"><aside className="app-sidebar"><p className="eyebrow">Public signal</p><p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>Vote on what matters. Keep your own vote private if you need to.</p></aside><section><StudentFeed initialIssues={issues} initialCreate={params.create === "1"} /></section></div></main></div>;
}
