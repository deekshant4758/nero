import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download, Heart, Rss, GitCommit } from "lucide-react";

export default function Changelog() {
  return (
    <div className="bg-white text-neutral-950 w-full min-h-screen">
      <Header />
      <div className="max-w-2xl text-center mx-auto px-8 pt-16 pb-8">
        <Badge
          variant="secondary"
          className="font-normal rounded-full text-xs leading-4 mb-6 px-3 py-1"
        >
          Release notes
        </Badge>
        <h1 className="font-bold text-5xl leading-12 tracking-tight">
          Changelog
        </h1>
        <p className="text-neutral-500 text-base leading-6 mt-4">
          Every release, every fix, every improvement — documented here.
        </p>
        <div className="flex mt-6 justify-center items-center gap-2">
          <Button variant="ghost" className="gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </Button>
          <Button variant="ghost" className="gap-2">
            <Rss className="size-4" />
            Subscribe to RSS
          </Button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-8 pb-16">
        <div className="relative pl-8">
          <div className="bg-neutral-200 absolute left-2 inset-y-2 w-px" />
          <div className="relative mb-8">
            <div className="size-3 rounded-full bg-white border-neutral-950 border-2 border-solid absolute -left-6.5 top-6" />
            <Card className="shadow-none rounded-xl bg-neutral-50 p-6 gap-4">
              <CardHeader className="p-0 gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium rounded-full bg-neutral-100 text-neutral-950 text-xs leading-4 px-2.5 py-0.5">
                    v1.0.0
                  </span>
                  <span className="font-medium rounded-full bg-emerald-100 text-emerald-700 text-xs leading-4 px-2.5 py-0.5">
                    Latest
                  </span>
                  <span className="text-neutral-500 text-xs leading-4">
                    March 12, 2025
                  </span>
                </div>
                <h3 className="font-semibold text-xl leading-7 tracking-tight">
                  Stable release — nero is officially 1.0
                </h3>
                <p className="text-neutral-500 text-sm leading-5">
                  After months of beta testing, nero hits 1.0 with a polished
                  UI, offline tracking and a complete dashboard experience.
                </p>
              </CardHeader>
              <CardContent className="p-0 gap-4">
                <div className="flex gap-3">
                  <span className="shrink-0 font-medium rounded-md bg-emerald-100 text-emerald-700 text-xs leading-4 px-2 py-0.5 h-fit">
                    Added
                  </span>
                  <ul className="space-y-1.5 text-neutral-700 text-sm leading-5">
                    <li>• Initial public release for Windows 10 and 11</li>
                    <li>
                      • 100% offline screen time tracking with local storage
                    </li>
                    <li>
                      • Brand new dashboard UI with daily, weekly and monthly
                      views
                    </li>
                    <li>
                      • Automatic app categorization (Productive, Social,
                      Entertainment, Other)
                    </li>
                    <li>
                      • Focus goals with streaks and per-app time limits
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <span className="shrink-0 font-medium rounded-md bg-blue-100 text-blue-700 text-xs leading-4 px-2 py-0.5 h-fit">
                    Improved
                  </span>
                  <ul className="space-y-1.5 text-neutral-700 text-sm leading-5">
                    <li>
                      • Reduced startup time by 60% compared to the last beta
                    </li>
                    <li>
                      • Lower memory footprint when running in the system tray
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="relative mb-8">
            <div className="size-3 rounded-full bg-white border-neutral-300 border-2 border-solid absolute -left-6.5 top-6" />
            <Card className="shadow-none rounded-xl bg-neutral-50 p-6 gap-4">
              <CardHeader className="p-0 gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium rounded-full bg-neutral-100 text-neutral-950 text-xs leading-4 px-2.5 py-0.5">
                    v0.9.0-beta
                  </span>
                  <span className="text-neutral-500 text-xs leading-4">
                    February 24, 2025
                  </span>
                </div>
                <h3 className="font-semibold text-xl leading-7 tracking-tight">
                  Charts, charts, charts
                </h3>
                <p className="text-neutral-500 text-sm leading-5">
                  A visual overhaul of the dashboard with brand new charts and
                  several stability fixes for long-running sessions.
                </p>
              </CardHeader>
              <CardContent className="p-0 gap-4">
                <div className="flex gap-3">
                  <span className="shrink-0 font-medium rounded-md bg-emerald-100 text-emerald-700 text-xs leading-4 px-2 py-0.5 h-fit">
                    Added
                  </span>
                  <ul className="space-y-1.5 text-neutral-700 text-sm leading-5">
                    <li>
                      • Hourly activity bar chart with productive vs. other
                      split
                    </li>
                    <li>• Donut category chart with interactive legend</li>
                    <li>
                      • Export your data as CSV or JSON from the settings
                      panel
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="text-neutral-500 text-xs leading-4 flex mt-12 justify-center items-center gap-2">
          <GitCommit className="size-3.5" />
          <span>Looking for older releases? Check the full history on</span>
          <a className="underline-offset-2 underline font-medium text-neutral-950">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
