// --- Issue page (/issues/[id]) ---
// Server: loads issue via getIssue(id), notFound() when missing.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { IssueDetailScreen } from "@/components/issue-detail-screen";
import { getIssue } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const issue = await getIssue(id);
  if (!issue) return { title: "Issue not found", robots: { index: false, follow: false } };
  return { title: issue.title, description: issue.excerpt, openGraph: { type: "article", title: issue.title, description: issue.excerpt, images: ["/og-image.svg"] } };
}

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await getIssue(id);
  if (!issue) notFound();
  return <div className="app-page"><AppNav active="feed" /><main className="app-main"><IssueDetailScreen initialIssue={issue} /></main></div>;
}
