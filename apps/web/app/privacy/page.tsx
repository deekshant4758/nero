import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderLock,
  Heart,
  MessageSquare,
  ShieldCheck,
  X,
  ArrowUpRight,
} from "lucide-react";

export default function Privacy() {
  return (
    <div className="bg-white text-neutral-950 w-full min-h-screen">
      <Header />
      <main className="p-12">
        <div className="text-center flex mb-12 flex-col items-center gap-2">
          <Badge variant="secondary" className="text-xs leading-4 gap-1">
            <FileText className="size-3" />
            Legal
          </Badge>
          <h1 className="font-bold text-4xl leading-10 tracking-tight mt-2">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 text-xs leading-4">
            Last updated: March 2025
          </p>
          <p className="max-w-xl text-neutral-500 text-sm leading-5 mt-2">
            nero is built on a simple promise: your data never leaves your
            device.
          </p>
        </div>
        <div className="max-w-2xl flex mx-auto flex-col gap-8">
          <div className="rounded-xl bg-neutral-950 text-white flex p-6 items-start gap-4">
            <div className="size-10 shrink-0 rounded-lg bg-white/10 flex justify-center items-center">
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-base leading-6">
                nero collects zero data.
              </p>
              <p className="text-neutral-300 text-sm leading-5">
                No telemetry. No analytics. No accounts. No servers.
              </p>
            </div>
          </div>
          <section className="border-neutral-100 border-b flex pb-8 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                01
              </span>
              <h2 className="font-semibold text-base leading-6">
                What We Collect
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              Nothing. nero does not collect, transmit, or store any personal
              data on external servers. There is no sign-up, no account
              creation, no email required. The app runs entirely on your
              machine and has no awareness of who you are.
            </p>
          </section>
          <section className="border-neutral-100 border-b flex pb-8 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                02
              </span>
              <h2 className="font-semibold text-base leading-6">
                Local Data Storage
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              All screen-time data, app usage statistics, and preferences are
              stored locally on your device in the AppData folder. This data
              never leaves your computer and is not accessible to anyone but
              you. You can delete all stored data at any time from the app
              settings or by removing the data directory manually.
            </p>
            <div className="rounded-xl bg-neutral-100 border-neutral-200 border-1 border-solid flex mt-2 p-4 items-center gap-2">
              <FolderLock className="size-4 shrink-0 text-neutral-500" />
              <code className="text-neutral-700 text-xs leading-4">
                %APPDATA%\nero\data
              </code>
            </div>
          </section>
          <section className="border-neutral-100 border-b flex pb-8 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                03
              </span>
              <h2 className="font-semibold text-base leading-6">Telemetry</h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              nero ships with telemetry completely disabled. There are no
              crash reports sent to a server, no usage analytics, and no
              update pings without your explicit consent. If you choose to
              check for updates, the request happens only when you click the
              button — never in the background.
            </p>
            <div className="flex mt-2 flex-col gap-2">
              <div className="text-neutral-700 text-sm leading-5 flex items-center gap-2">
                <X className="size-4 text-neutral-500" />
                No crash reports
              </div>
              <div className="text-neutral-700 text-sm leading-5 flex items-center gap-2">
                <X className="size-4 text-neutral-500" />
                No usage analytics
              </div>
              <div className="text-neutral-700 text-sm leading-5 flex items-center gap-2">
                <X className="size-4 text-neutral-500" />
                No background update pings
              </div>
            </div>
          </section>
          <section className="border-neutral-100 border-b flex pb-8 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                04
              </span>
              <h2 className="font-semibold text-base leading-6">
                Third-party Services
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              None. nero does not integrate with any third-party analytics
              providers, advertising networks, or cloud services. There are no
              SDKs embedded in the application that phone home. The binary you
              download is the binary that runs on your machine — nothing more.
            </p>
          </section>
          <section className="border-neutral-100 border-b flex pb-8 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                05
              </span>
              <h2 className="font-semibold text-base leading-6">
                Open Source Verification
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              nero is fully open source under the MIT license. You can audit
              every line of code on GitHub, build the app yourself from
              source, and verify these privacy claims independently. Trust is
              earned through transparency — not promises.
            </p>
            <a className="inline-flex font-medium text-neutral-950 text-sm leading-5 mt-2 items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View source on GitHub
              <ArrowUpRight className="size-3.5" />
            </a>
          </section>
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                06
              </span>
              <h2 className="font-semibold text-base leading-6">Contact</h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              Questions about this policy or how nero handles your data? Open
              an issue on the GitHub repository — all discussions happen in
              the open.
            </p>
            <a className="inline-flex font-medium text-neutral-950 text-sm leading-5 mt-2 items-center gap-2">
              <MessageSquare className="size-4" />
              Open a GitHub Issue
              <ArrowUpRight className="size-3.5" />
            </a>
          </section>
          <div className="text-neutral-500 text-xs leading-4 flex pt-4 justify-center items-center gap-2">
            <Heart className="size-3" />
            <span>Built with privacy in mind · MIT licensed</span>
          </div>
        </div>
      </main>
    </div>
  );
}
