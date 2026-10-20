// ─── AppNav (authenticated chrome) ──────────────────────────────────────────
// Desktop topbar + mobile bottom nav. `active` highlights the current section;
// `isAdmin` reveals the Welfare-office link. Create button deep-links ?create=1.
import Link from "next/link";
import { FilePlus2, House, Search, Settings2, ShieldCheck } from "lucide-react";
import { Brand } from "./brand";

export function AppNav({ active = "feed", isAdmin = false }: { active?: "feed" | "search" | "profile" | "admin"; isAdmin?: boolean }) {
  const links = [
    { key: "feed", href: "/app", label: "Home", icon: House },
    { key: "search", href: "/app/search", label: "Search", icon: Search },
    { key: "profile", href: "/app/profile", label: "Profile", icon: Settings2 },
    ...(isAdmin ? [{ key: "admin", href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ] as const;
  return <>
    <header className="app-topbar"><div className="container navbar"><Brand /><nav className="nav-links" aria-label="App navigation">{links.map(({ key, href, label }) => <Link key={key} href={href} className={key === active ? "" : "muted"}>{label}</Link>)}</nav><Link className="button primary small" href="/app?create=1"><FilePlus2 size={15} /> Create issue</Link></div></header>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{links.map(({ key, href, label, icon: Icon }) => <Link key={key} href={href} className={key === active ? "active" : ""}><Icon size={17} /><span>{label}</span></Link>)}</nav>
  </>;
}
