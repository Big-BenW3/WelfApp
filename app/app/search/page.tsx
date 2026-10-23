// --- Search page (/app/search) ---
// Server: preloads trending; SearchScreen island debounces filters client-side.
import { AppNav } from "@/components/app-nav";
import { SearchScreen } from "@/components/search-screen";
import { listIssues } from "@/lib/store";

export const metadata = {
  title: "Search issues",
  description: "Search and filter the Wella welfare issue queue.",
};

export default async function SearchPage() {
  const issues = await listIssues({ sort: "trending" });
  return (
    <div className="app-page">
      <AppNav active="search" />
      <main className="app-main">
        <div className="app-layout">
          <aside className="app-sidebar">
            <p className="eyebrow">Explore</p>
            <p className="muted" style={{ fontSize: "0.78rem" }}>
              Search public issues by keyword or area, then open a thread to read the full context.
            </p>
          </aside>
          <section>
            <SearchScreen initialIssues={issues} />
          </section>
        </div>
      </main>
    </div>
  );
}
