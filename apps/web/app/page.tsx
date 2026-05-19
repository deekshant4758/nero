import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import {
  BarChart3,
  Code,
  Download,
  Feather,
  HardDrive,
  Lock,
  Monitor,
  WifiOff,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: WifiOff,
    title: "Offline-first",
    copy: "Works fully offline. No internet required, no background syncing, no surprises.",
  },
  {
    icon: HardDrive,
    title: "Local data ownership",
    copy: "Your data lives on your disk in a portable format. Export, backup, or delete anytime.",
  },
  {
    icon: Monitor,
    title: "Desktop focused",
    copy: "Designed for desktop workflows with local-first analytics and a distraction-free UI.",
  },
  {
    icon: Feather,
    title: "Lightweight",
    copy: "Small footprint, fast startup, and no heavy background cloud processes.",
  },
  {
    icon: Code,
    title: "Open source",
    copy: "MIT licensed. Audit the source, suggest improvements, or contribute directly.",
  },
  {
    icon: Lock,
    title: "Privacy focused",
    copy: "No accounts, no telemetry, and no third-party analytics scripts watching your visitors.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />

      <main className="flex-1">
        <section className="px-4 pt-16 pb-14 sm:px-6 lg:px-8 lg:pt-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
            <Badge
              variant="outline"
              className="rounded-full border-neutral-200 px-3 py-1 text-xs font-normal text-neutral-500"
            >
              Free & open source • MIT licensed
            </Badge>

            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Beautiful insights. Your data never leaves your PC.
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-neutral-600 sm:text-lg">
              nero is a free and open-source, lightweight screen-time analytics app for desktop.
              Zero cloud sync. Your usage data stays on your machine.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild className="bg-neutral-950 text-neutral-50 hover:bg-neutral-900">
                <a href={siteConfig.downloadHref}>
                  <Download className="size-4" />
                  Download for free
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2 border-neutral-200 hover:bg-neutral-50">
                <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Star on GitHub
                </a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-600 sm:text-sm">
              <div className="flex items-center gap-2">
                <Lock className="size-4" />
                100% private
              </div>
              <div className="flex items-center gap-2">
                <Feather className="size-4" />
                Lightweight
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="size-4" />
                Windows now, more platforms later
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="rounded-2xl border-neutral-200 p-6 shadow-none">
                <CardHeader className="gap-3 p-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                    <feature.icon className="size-5 text-neutral-900" />
                  </div>
                  <CardTitle className="text-base font-semibold leading-6">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <p className="text-sm leading-6 text-neutral-600">{feature.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A dashboard you&apos;ll actually want to open.
              </h2>
              <p className="mt-3 text-base leading-7 text-neutral-600">
                Daily, weekly, and monthly breakdowns. Hourly heatmaps. Per-app trends. Local-only
                analytics with no cloud account required.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
              <div className="flex flex-col gap-8 xl:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="mb-8 flex flex-wrap items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-950">
                      <BarChart3 className="size-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-950">Screen Time</h3>
                      <p className="text-xs text-neutral-500">Today</p>
                    </div>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 xl:ml-auto">
                      Tracking active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatPreview label="Total screen time" value="7h 42m" tone="text-neutral-950" />
                    <StatPreview label="Productive" value="4h 18m" tone="text-teal-600" />
                    <StatPreview label="Distracting" value="2h 06m" tone="text-amber-600" />
                    <StatPreview label="Pickups" value="142" tone="text-neutral-950" />
                  </div>

                  <div className="mt-8">
                    <p className="mb-4 text-xs text-neutral-500">Hourly activity</p>
                    <div className="flex h-28 items-end gap-1 sm:h-32">
                      {[26, 48, 54, 57, 48, 48, 57, 57, 53, 44, 42, 34, 24].map((height, index) => (
                        <div key={index} className="flex flex-1 items-end gap-0.5">
                          <div
                            className="w-full rounded-t-[4px] bg-neutral-950"
                            style={{ height: `${Math.max(20, height - 10)}%` }}
                          />
                          <div
                            className="w-full rounded-t-[4px] bg-neutral-300"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-5 text-xs text-neutral-500">
                      <span>8a</span>
                      <span className="text-center">11a</span>
                      <span className="text-center">2p</span>
                      <span className="text-center">5p</span>
                      <span className="text-right">8p</span>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:max-w-sm">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                    <p className="text-sm font-semibold text-neutral-950">Top apps</p>
                    <div className="mt-5 space-y-4">
                      <MiniAppRow name="Chrome" value="1h 48m" width="78%" />
                      <MiniAppRow name="VS Code" value="2h 14m" width="92%" />
                      <MiniAppRow name="Slack" value="58m" width="43%" />
                      <MiniAppRow name="Spotify" value="32m" width="26%" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="support" className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <Zap className="mt-1 size-6 shrink-0 text-amber-600" />
              <div>
                <p className="mb-1 font-semibold text-neutral-950">
                  If you like the project, consider supporting nero on Ko-fi.
                </p>
                <p className="text-sm leading-6 text-neutral-600">
                  Community support helps keep development moving while the core app stays free and open.
                </p>
              </div>
            </div>
            <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
              <a href={siteConfig.supportHref}>Support on Ko-fi</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatPreview({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-neutral-500">{label}</p>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function MiniAppRow({
  name,
  value,
  width,
}: {
  name: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-900">{name}</span>
        <span className="text-neutral-500">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100">
        <div className="h-2 rounded-full bg-neutral-900" style={{ width }} />
      </div>
    </div>
  );
}
