import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { FileText, FolderLock, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "What we collect",
    body: "Nothing. nero does not transmit usage data to third-party servers, ask for accounts, or require sign-in to function.",
  },
  {
    title: "Local data storage",
    body: "All activity data and preferences stay on your device. You remain in control of export, backup, and deletion.",
  },
  {
    title: "Telemetry",
    body: "Telemetry is disabled by default. No background analytics or silent cloud sync runs behind the scenes.",
  },
  {
    title: "Third-party services",
    body: "The product is designed around local-first behavior rather than account systems, ad networks, or tracking SDKs.",
  },
];

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="gap-1 text-xs">
              <FileText className="size-3" />
              Legal
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="text-sm text-neutral-500">Last updated: May 2026</p>
            <p className="max-w-2xl text-base leading-7 text-neutral-600">
              nero is built on a simple promise: your data stays on your device unless you explicitly export it.
            </p>
          </div>

          <Card className="mb-8 rounded-2xl border-neutral-200 bg-neutral-950 text-white shadow-none">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="font-semibold">nero collects zero cloud data.</p>
                <p className="mt-1 text-sm leading-6 text-neutral-300">
                  No telemetry, no accounts, no remote storage, and no advertising network integrations.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <section key={section.title} className="border-b border-neutral-200 pb-6 last:border-none">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <p className="text-sm leading-7 text-neutral-700">{section.body}</p>
                {section.title === "Local data storage" ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <FolderLock className="size-4 shrink-0 text-neutral-500" />
                    <code>%APPDATA%\nero\data</code>
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <p className="mt-8 text-sm leading-7 text-neutral-600">
            Questions about this policy? Open an issue on{" "}
            <a className="font-medium text-neutral-950 underline underline-offset-4" href={`${siteConfig.repoUrl}/issues`} target="_blank" rel="noreferrer">
              GitHub
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
