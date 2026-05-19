import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  HardDrive,
  Heart,
  Info,
  MemoryStick,
  MonitorCog,
  ShieldAlert,
  CircleCheck,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Docs() {
  return (
    <div className="bg-white text-neutral-950 w-full min-h-screen">
      <Header />
      <div className="max-w-[1140px] text-center mx-auto px-8 pt-12 pb-8">
        <div className="uppercase text-neutral-500 text-xs leading-4 tracking-widest mb-3">
          Documentation
        </div>
        <h1 className="font-bold text-4xl leading-10 tracking-tight mb-3">
          Installation Guide
        </h1>
        <p className="max-w-xl text-neutral-500 text-base leading-6 mx-auto">
          Get nero up and running on your machine in under a minute.
        </p>
      </div>
      <div className="max-w-[1140px] flex mx-auto px-8 pb-12 gap-12">
        <aside className="shrink-0 w-56">
          <div className="sticky top-24">
            <div className="font-semibold uppercase text-neutral-500 text-xs leading-4 tracking-widest mb-4">
              On this page
            </div>
            <nav className="flex flex-col gap-1">
              <a className="font-medium text-neutral-950 text-sm leading-5 border-neutral-950 border-l-2 border-solid pl-3 py-1">
                System Requirements
              </a>
              <a className="border-transparent text-neutral-500 text-sm leading-5 border-l-2 border-solid pl-3 py-1">
                Download
              </a>
              <a className="border-transparent text-neutral-500 text-sm leading-5 border-l-2 border-solid pl-3 py-1">
                Install on Windows
              </a>
              <a className="border-transparent text-neutral-500 text-sm leading-5 border-l-2 border-solid pl-3 py-1">
                Verify Installation
              </a>
              <a className="border-transparent text-neutral-500 text-sm leading-5 border-l-2 border-solid pl-3 py-1">
                Auto-start Setup
              </a>
              <a className="border-transparent text-neutral-500 text-sm leading-5 border-l-2 border-solid pl-3 py-1">
                Uninstall
              </a>
            </nav>
            <div className="rounded-xl bg-neutral-50 border-neutral-200 border-1 border-solid mt-8 p-4">
              <div className="flex mb-2 items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="font-semibold text-xs leading-4">
                  Open source
                </span>
              </div>
              <p className="text-neutral-500 text-xs leading-4 mb-3">
                Browse source, file issues, or contribute on GitHub.
              </p>
              <a className="inline-flex font-medium text-xs leading-4 items-center gap-1">
                View repository
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex flex-col flex-1 gap-8">
          <section>
            <div className="flex mb-3 items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                01
              </span>
              <h2 className="font-bold text-lg leading-7">
                System Requirements
              </h2>
            </div>
            <Card className="shadow-none rounded-xl bg-neutral-50 border-neutral-200 border-0 border-solid p-6 gap-4">
              <CardContent className="p-0 gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-neutral-500 flex items-center gap-2">
                      <MonitorCog className="size-4" />
                      <span className="text-xs leading-4">
                        Operating System
                      </span>
                    </div>
                    <span className="font-semibold text-neutral-950 text-sm leading-5">
                      Windows 10/11 (64-bit)
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-neutral-500 flex items-center gap-2">
                      <MemoryStick className="size-4" />
                      <span className="text-xs leading-4">Memory (RAM)</span>
                    </div>
                    <span className="font-semibold text-neutral-950 text-sm leading-5">
                      50 MB minimum
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-neutral-500 flex items-center gap-2">
                      <HardDrive className="size-4" />
                      <span className="text-xs leading-4">Disk Space</span>
                    </div>
                    <span className="font-semibold text-neutral-950 text-sm leading-5">
                      Under 20 MB
                    </span>
                  </div>
                </div>
                <div className="border-neutral-200 border-t-1 border-r-0 border-b-0 border-l-0 border-solid flex pt-2 items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="font-normal bg-white text-neutral-700 border-neutral-200 border-1 border-solid"
                  >
                    <Info className="size-3" />
                    {`Mac & Linux coming soon`}
                  </Badge>
                  <span className="text-neutral-500 text-xs leading-4">
                    Track progress on GitHub.
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
          <section>
            <div className="flex mb-3 items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                02
              </span>
              <h2 className="font-bold text-lg leading-7">Download</h2>
            </div>
            <Card className="shadow-none rounded-xl bg-neutral-50 border-neutral-200 border-0 border-solid p-6 gap-4">
              <CardContent className="p-0 gap-4">
                <p className="text-neutral-700 text-sm leading-5">
                  Grab the latest installer directly from the official GitHub
                  releases page. All builds are signed and reproducible.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button className="h-9">
                    <Download className="size-4" />
                    Download for Windows
                  </Button>
                  <Badge
                    variant="secondary"
                    className="font-mono bg-white text-xs leading-4 border-neutral-200 border-1 border-solid"
                  >
                    v1.0.0
                  </Badge>
                  <a className="inline-flex text-neutral-700 text-sm leading-5 items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    View on GitHub releases
                    <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
