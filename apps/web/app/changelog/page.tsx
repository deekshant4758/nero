import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { GitCommit, Rss } from "lucide-react";

const releases = [
  {
    version: "v1.0.0",
    date: "May 2026",
    title: "Initial public site release",
    body: "Introduced the website, docs shell, and legal pages for the project while keeping the app local-first and privacy-focused.",
    added: ["Homepage and product messaging", "Privacy, terms, and docs routes", "Responsive layout cleanup"],
  },
  {
    version: "v0.9.0",
    date: "Earlier",
    title: "Project scaffolding",
    body: "Established the public-facing web structure that will evolve alongside the desktop product.",
    added: ["Initial page structure", "Shared UI components", "Base design system"],
  },
];

export default function Changelog() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-normal">
              Release notes
            </Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Changelog</h1>
            <p className="mt-4 text-base leading-7 text-neutral-600">
              Every release, fix, and visible improvement gets documented here.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="ghost" className="gap-2">
                <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer">
                  View on GitHub
                </a>
              </Button>
              <Button variant="ghost" className="gap-2" disabled>
                <Rss className="size-4" />
                RSS coming soon
              </Button>
            </div>
          </div>

          <div className="relative pl-0 sm:pl-8">
            <div className="absolute left-2 top-2 bottom-2 hidden w-px bg-neutral-200 sm:block" />
            <div className="space-y-8">
              {releases.map((release, index) => (
                <div key={release.version} className="relative">
                  <div className="absolute -left-6 top-6 hidden h-3 w-3 rounded-full border-2 border-neutral-900 bg-white sm:block" />
                  <Card className="rounded-2xl bg-neutral-50 p-6 shadow-none">
                    <CardHeader className="gap-3 p-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-950">
                          {release.version}
                        </span>
                        {index === 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Latest
                          </span>
                        ) : null}
                        <span className="text-xs text-neutral-500">{release.date}</span>
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight">{release.title}</h2>
                      <p className="text-sm leading-6 text-neutral-600">{release.body}</p>
                    </CardHeader>
                    <CardContent className="p-0 pt-5">
                      <div className="flex flex-col gap-3">
                        <span className="w-fit rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Added
                        </span>
                        <ul className="space-y-2 text-sm leading-6 text-neutral-700">
                          {release.added.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <GitCommit className="size-3.5" />
            <span>For full commit history, see the repository on GitHub.</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
