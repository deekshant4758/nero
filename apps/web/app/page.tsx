import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Feather,
  HardDrive,
  Lock,
  Monitor,
  Code,
  WifiOff,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white text-neutral-950 w-full min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="flex px-8 pt-20 pb-16 flex-col items-center">
        <Badge
          variant="outline"
          className="font-normal rounded-full text-neutral-500 text-xs leading-4 px-3 py-1 border-neutral-200"
        >
          Free & open source • MIT licensed
        </Badge>
        
        <h1 className="max-w-3xl leading-tight font-bold text-center text-5xl mt-6 tracking-tight">
          Beautiful insights. Your data never leaves your PC.
        </h1>
        
        <p className="max-w-2xl leading-relaxed text-center text-neutral-600 text-base mt-6">
          nero is a free and open-source, lightweight screen-time analytics app for desktop. Zero cloud sync — your usage data stays on your machine.
        </p>
        
        <div className="flex mt-8 items-center gap-3">
          <Button className="bg-neutral-950 text-neutral-50 hover:bg-neutral-900">
            Download for free
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-neutral-200 hover:bg-neutral-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Star on GitHub
          </Button>
        </div>
        
        <div className="flex mt-6 items-center gap-6 text-neutral-600">
          <div className="text-xs flex items-center gap-2">
            <Lock className="size-4" />
            100% private
          </div>
          <div className="text-xs flex items-center gap-2">
            <Feather className="size-4" />
            Under 20MB
          </div>
          <div className="text-xs flex items-center gap-2">
            <Monitor className="size-4" />
            Windows only • Mac & Linux coming soon
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 pb-16">
        <div className="grid grid-cols-3 gap-4 max-w-7xl mx-auto">
          <Card className="shadow-none rounded-xl p-6 border-neutral-200">
            <CardHeader className="p-0 gap-3">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <WifiOff className="size-5 text-neutral-900" />
              </div>
              <CardTitle className="font-semibold text-base leading-6">
                Offline-first
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-neutral-600 text-sm leading-5">
                Works fully offline. No internet required, no background syncing, no surprises.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none rounded-xl p-6 border-neutral-200">
            <CardHeader className="p-0 gap-3">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <HardDrive className="size-5 text-neutral-900" />
              </div>
              <CardTitle className="font-semibold text-base leading-6">
                Local data ownership
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-neutral-600 text-sm leading-5">
                Your data lives on your disk in a portable format. Export, backup, or delete anytime.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none rounded-xl p-6 border-neutral-200">
            <CardHeader className="p-0 gap-3">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <Monitor className="size-5 text-neutral-900" />
              </div>
              <CardTitle className="font-semibold text-base leading-6">
                Cross-platform
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-neutral-600 text-sm leading-5">
                Windows today. Mac and Linux builds are next on the roadmap — same features everywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none rounded-xl p-6 border-neutral-200">
            <CardHeader className="p-0 gap-3">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <Feather className="size-5 text-neutral-900" />
              </div>
              <CardTitle className="font-semibold text-base leading-6">
                Lightweight
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-neutral-600 text-sm leading-5">
                Under 20MB on disk. Sips less than 1% CPU and a tiny memory footprint while running.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none rounded-xl p-6 border-neutral-200">
            <CardHeader className="p-0 gap-3">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <Code className="size-5 text-neutral-900" />
              </div>
              <CardTitle className="font-semibold text-base leading-6">
                Open source
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-neutral-600 text-sm leading-5">
                MIT licensed. Read the code, audit the binaries, file an issue, or send a PR.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none rounded-xl p-6 border-neutral-200">
            <CardHeader className="p-0 gap-3">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <Lock className="size-5 text-neutral-900" />
              </div>
              <CardTitle className="font-semibold text-base leading-6">
                Privacy focused
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-neutral-600 text-sm leading-5">
                No accounts, no telemetry, no third-party scripts. Just you and your data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="px-8 pb-16 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">A dashboard you&apos;ll actually want to open.</h2>
            <p className="text-neutral-600">
              Daily, weekly and monthly breakdowns. Hourly heatmaps. Per app trends. Check and compare all at a glance.
            </p>
          </div>

          {/* Dashboard Stats Preview */}
          <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-8 rounded bg-neutral-950 flex items-center justify-center">
                <BarChart3 className="size-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-950">Screen Time</h3>
                <p className="text-xs text-neutral-500">Today</p>
              </div>
              <Badge variant="outline" className="ml-auto bg-teal-50 text-teal-700 border-teal-200">
                + Today
              </Badge>
              <Button size="sm" variant="outline" className="border-neutral-200">1 month</Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div>
                <p className="text-xs text-neutral-500 mb-2">All Screen Time</p>
                <p className="text-2xl font-bold">7h 42m</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2">Productive</p>
                <p className="text-2xl font-bold text-teal-600">1h 56m</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2">Distracting</p>
                <p className="text-2xl font-bold text-amber-600">34</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2">Paused</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="mb-8">
              <p className="text-xs text-neutral-500 mb-4">Hour&apos;s activity</p>
              <div className="flex items-end gap-1 h-24">
                {[4, 2, 8, 5, 9, 3, 7, 4, 8, 5, 6, 3, 9, 4].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-neutral-300 rounded-sm"
                    style={{ height: `${(height / 10) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-neutral-500 mt-2">
                <span>0</span>
                <span>6</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-sm">
                    7h 42m
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Today</p>
                    <p className="text-xs text-neutral-500">Last 7 days: 54h</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Work</span>
                    <span className="text-neutral-500">34%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Entertainment</span>
                    <span className="text-neutral-500">54%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Other</span>
                    <span className="text-neutral-500">12%</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-3">Top apps</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Chrome</span>
                    <span className="text-neutral-500">25 • 1h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Figma</span>
                    <span className="text-neutral-500">15 • 40m</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Discord</span>
                    <span className="text-neutral-500">8 • 30m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="px-8 pb-16">
        <div className="max-w-7xl mx-auto bg-amber-50 rounded-xl p-8 border border-amber-200 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <Zap className="size-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-neutral-950 mb-1">If you like my work, consider supporting nero on Ko-fi!</p>
              <p className="text-sm text-neutral-600">
                100% of proceeds go towards improving and maintaining the app for everyone.
              </p>
            </div>
          </div>
          <Button className="bg-amber-500 text-white hover:bg-amber-600 flex-shrink-0">
            Support on Ko-fi
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
