import type { Metadata } from "next";
import {
  Apple,
  ArrowUpRight,
  Bell,
  Clock,
  Coffee,
  Download,
  Feather,
  FileText,
  Heart,
  History,
  Lock,
  Package,
  ShieldCheck,
  Tag,
  WifiOff,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Downloads | ${siteConfig.name}`,
  description: "Download nero for Windows and track upcoming releases for macOS and Linux.",
};

export default function DownloadsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <section className="flex flex-col items-center text-center">
            <Badge variant="secondary" className="gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-normal text-neutral-600">
              <Download className="size-3" />
              Downloads
            </Badge>

            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Get nero on your device
            </h1>

            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-neutral-600 sm:text-lg">
              Free, open-source, and built for privacy. Download the latest stable release for your platform.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
              <Badge variant="outline" className="gap-1.5 rounded-full border-neutral-200 bg-white px-3 py-1 font-normal text-neutral-600">
                <Tag className="size-3" />
                v1.0.0
              </Badge>
              <span>Released March 12, 2025</span>
              <span>MIT licensed</span>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="rounded-3xl border border-neutral-200 p-6 shadow-none">
              <CardHeader className="gap-3 p-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950">
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 5.5L10 4.5V11H3V5.5ZM11 4.35L21 3V11H11V4.35ZM3 12H10V18.5L3 17.5V12ZM11 12H21V20L11 18.65V12Z" />
                    </svg>
                  </div>
                  <Badge className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">Available</Badge>
                </div>
                <CardTitle className="text-xl leading-7">Windows</CardTitle>
                <CardDescription className="text-xs leading-4 text-neutral-500">Windows 10 / 11 · 64-bit</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <div className="rounded-2xl bg-neutral-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">File</span>
                    <span className="font-mono text-neutral-950">nero-setup.exe</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">Size</span>
                    <span>18.4 MB</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">Arch</span>
                    <span>x64</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2 p-0 pt-4">
                <Button asChild className="w-full gap-2 bg-neutral-950 text-neutral-50 hover:bg-neutral-900">
                  <a href={`${siteConfig.repoUrl}/releases/latest`}>
                    <Download className="size-4" />
                    Download for Windows
                  </a>
                </Button>
                <Button asChild size="sm" variant="ghost" className="w-full gap-1.5 text-xs text-neutral-500">
                  <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer">
                    <ArrowUpRight className="size-3.5" />
                    View on GitHub
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="rounded-3xl border border-neutral-200 p-6 shadow-none">
              <CardHeader className="gap-3 p-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950">
                    <Apple className="size-5" />
                  </div>
                  <Badge variant="secondary" className="gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-normal text-neutral-600">
                    <Clock className="size-3" />
                    Coming soon
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-7">macOS</CardTitle>
                <CardDescription className="text-xs leading-4 text-neutral-500">macOS 12+ · Universal binary</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <div className="rounded-2xl bg-neutral-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">File</span>
                    <span className="font-mono text-neutral-500">nero.dmg</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">Status</span>
                    <span>In development</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">ETA</span>
                    <span>Q2 2025</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2 p-0 pt-4">
                <Button disabled className="w-full gap-2" variant="outline">
                  <Lock className="size-4" />
                  Coming soon
                </Button>
                <Button asChild size="sm" variant="ghost" className="w-full gap-1.5 text-xs text-neutral-500">
                  <a href={siteConfig.supportHref}>
                    <Bell className="size-3.5" />
                    Notify me on release
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="rounded-3xl border border-neutral-200 p-6 shadow-none">
              <CardHeader className="gap-3 p-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950">
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.595.058.4.116.778.04 1.05-.247.795-.286 1.346-.07 1.745.217.4.687.58 1.227.728.974.279 2.273.16 3.342.738 1.142.619 2.31.918 3.24.836.66-.054 1.215-.296 1.578-.704.354-.397.555-.911.555-1.46 0-.149-.014-.297-.038-.443.21-.072.398-.185.555-.314.434-.353.642-.798.658-1.244.022-.448-.143-.917-.452-1.395a.42.42 0 00-.122-.13c.36-.527.628-1.094.821-1.69.32-.985.4-2.001.4-2.974 0-1.013-.158-1.985-.45-2.84-.297-.86-.726-1.624-1.273-2.234-.547-.61-1.2-1.067-1.917-1.353-.717-.286-1.495-.4-2.276-.4-.46 0-.92.04-1.367.12V3.523c0-.815-.244-1.622-.706-2.323C13.857.504 13.21 0 12.504 0z" />
                    </svg>
                  </div>
                  <Badge variant="secondary" className="gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-normal text-neutral-600">
                    <Clock className="size-3" />
                    Coming soon
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-7">Linux</CardTitle>
                <CardDescription className="text-xs leading-4 text-neutral-500">Ubuntu · Fedora · Arch · AppImage</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-4">
                <div className="rounded-2xl bg-neutral-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">File</span>
                    <span className="font-mono text-neutral-500">nero.AppImage</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">Status</span>
                    <span>Planned</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-neutral-500">ETA</span>
                    <span>Q3 2025</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2 p-0 pt-4">
                <Button disabled className="w-full gap-2" variant="outline">
                  <Lock className="size-4" />
                  Coming soon
                </Button>
                <Button asChild size="sm" variant="ghost" className="w-full gap-1.5 text-xs text-neutral-500">
                  <a href={siteConfig.supportHref}>
                    <Bell className="size-3.5" />
                    Notify me on release
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SupportPill icon={ShieldCheck} title="Signed & verified" copy="Every build is signed and reproducible." />
            <SupportPill icon={Feather} title="Under 20 MB" copy="Tiny binary, light on resources." />
            <SupportPill icon={WifiOff} title="100% offline" copy="No accounts, no telemetry, no servers." />
          </section>

          <Card className="rounded-3xl border border-neutral-200 p-6 shadow-none">
            <CardHeader className="p-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg leading-7">Other downloads</CardTitle>
                  <CardDescription className="text-xs leading-4 text-neutral-500">
                    Portable builds, checksums, and previous versions.
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="ghost" className="w-fit gap-1.5 text-xs text-neutral-500">
                  <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer">
                    All releases
                    <ArrowUpRight className="size-3" />
                  </a>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200">
                <DownloadRow
                  icon={Package}
                  title="Windows portable (zip)"
                  detail="nero-portable-v1.0.0.zip · 17.8 MB"
                />
                <DownloadRow
                  icon={FileText}
                  title="SHA-256 checksums"
                  detail="checksums.txt · 1 KB"
                />
                <DownloadRow
                  icon={History}
                  title="Previous releases"
                  detail="v0.9.0-beta, v0.8.0-beta and earlier"
                  actionLabel="View on GitHub"
                  actionHref={`${siteConfig.repoUrl}/releases`}
                />
              </div>
            </CardContent>
          </Card>

          <section id="support" className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <Heart className="mt-1 size-5 shrink-0 text-neutral-500" />
                <div>
                  <p className="font-medium text-neutral-950">
                    Enjoying nero? Support development on Ko-fi.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Free forever. Donations help cover hosting and Mac/Linux builds.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="gap-2 border-neutral-200 bg-white hover:bg-neutral-50">
                <a href={siteConfig.supportHref}>
                  <Coffee className="size-4" />
                  Donate on Ko-fi
                </a>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SupportPill({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof ShieldCheck;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
        <Icon className="size-4 text-neutral-900" />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-5 text-neutral-950">{title}</p>
        <p className="text-xs leading-4 text-neutral-500">{copy}</p>
      </div>
    </div>
  );
}

function DownloadRow({
  icon: Icon,
  title,
  detail,
  actionLabel = "Download",
  actionHref = `${siteConfig.repoUrl}/releases/latest`,
}: {
  icon: typeof Package;
  title: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const isExternal = actionHref.startsWith("http");

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 text-neutral-500" />
        <div>
          <p className="text-sm font-medium leading-5 text-neutral-950">{title}</p>
          <p className="text-xs leading-4 text-neutral-500">{detail}</p>
        </div>
      </div>
      <Button asChild size="sm" variant="ghost" className="w-fit gap-1.5 text-xs text-neutral-500">
        <a href={actionHref} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
          <Download className="size-3.5" />
          {actionLabel}
        </a>
      </Button>
    </div>
  );
}