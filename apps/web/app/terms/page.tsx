import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpRight,
  Download,
  FileText,
  Heart,
  Info,
  Scale,
} from "lucide-react";

export default function Terms() {
  return (
    <div className="bg-white text-neutral-950 w-full min-h-screen">
      <Header />
      <div className="max-w-3xl text-center flex mx-auto px-8 pt-16 pb-8 flex-col gap-4">
        <div className="text-neutral-500 text-xs leading-4 flex justify-center items-center gap-2">
          <FileText className="size-3" />
          <span>Legal</span>
        </div>
        <h1 className="font-bold text-4xl leading-10 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-neutral-500 text-xs leading-4">
          Last updated: March 2025
        </p>
        <p className="text-neutral-500 text-sm leading-5">
          Simple, fair terms for a free and open-source tool.
        </p>
      </div>
      <div className="max-w-2xl flex mx-auto px-8 pb-16 flex-col gap-8">
        <Card className="shadow-none rounded-xl bg-neutral-100 border-black/1 border-0 border-solid p-6 gap-2">
          <CardContent className="flex p-0 items-start gap-4">
            <div className="size-8 shrink-0 rounded-lg bg-white flex justify-center items-center">
              <Info className="size-4 text-neutral-950" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm leading-5">
                A quick note before you read
              </p>
              <p className="text-neutral-500 text-sm leading-5">
                nero is free software. These terms exist to protect both you
                and the developer. No legalese — just common sense.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                01
              </span>
              <h2 className="font-semibold text-base leading-6">
                Acceptance
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              By downloading, installing, or using nero, you agree to be bound
              by these Terms of Service. If you do not agree with any part of
              these terms, please do not use the software. Your continued use
              of nero constitutes acceptance of these terms in their entirety.
            </p>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                02
              </span>
              <h2 className="font-semibold text-base leading-6">License</h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              nero is released under the MIT License. You are free to use,
              copy, modify, merge, publish, distribute, sublicense, and sell
              copies of the software, provided the original copyright notice
              and this permission notice are included in all copies or
              substantial portions of the software.
            </p>
            <div className="rounded-lg bg-neutral-100 text-neutral-500 text-xs leading-4 flex mt-2 px-3 py-2 items-center gap-2 w-fit">
              <Scale className="size-3" />
              <span>MIT License · Free forever</span>
            </div>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                03
              </span>
              <h2 className="font-semibold text-base leading-6">
                No Warranty
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              nero is provided &quot;as is&quot;, without warranty of any kind,
              express or implied, including but not limited to the warranties
              of merchantability, fitness for a particular purpose, and
              noninfringement. We make no guarantees regarding uptime,
              accuracy of tracking, or the software&apos;s fitness for any
              specific purpose.
            </p>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                04
              </span>
              <h2 className="font-semibold text-base leading-6">
                Limitation of Liability
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              In no event shall the developer or contributors be liable for
              any claim, damages, or other liability — whether in an action of
              contract, tort, or otherwise — arising from, out of, or in
              connection with the software or the use or other dealings in the
              software. This includes, but is not limited to, data loss,
              hardware damage, or any incidental or consequential damages.
            </p>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                05
              </span>
              <h2 className="font-semibold text-base leading-6">
                User Responsibilities
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              You are responsible for how you use nero. Do not use the
              software to illegally monitor others without their explicit
              consent. nero is designed for personal screen-time tracking on
              your own devices. Any misuse for surveillance, stalking, or
              unauthorized monitoring is strictly prohibited and may violate
              local laws.
            </p>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                06
              </span>
              <h2 className="font-semibold text-base leading-6">
                Modifications
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              These terms may be updated from time to time. Any changes will
              be posted on the project&apos;s GitHub repository with a revised
              &quot;Last updated&quot; date. Your continued use of nero after
              such changes constitutes your acceptance of the new terms. We
              encourage you to review the terms periodically.
            </p>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                07
              </span>
              <h2 className="font-semibold text-base leading-6">
                Open Source
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              The full source code for nero is publicly available on GitHub.
              Contributions are welcome under the terms of the MIT License. By
              contributing, you agree that your contributions will be licensed
              under the same MIT License that covers the project. We
              appreciate bug reports, feature requests, and pull requests from
              the community.
            </p>
          </section>
          <div className="bg-neutral-200 h-px" />
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-500 text-xs leading-4">
                08
              </span>
              <h2 className="font-semibold text-base leading-6">Contact</h2>
            </div>
            <p className="leading-relaxed text-neutral-700 text-sm leading-5">
              For questions, concerns, or to report issues regarding these
              terms or the software itself, please open an issue on our GitHub
              repository. This is the primary and preferred channel for all
              communication regarding nero.
            </p>
            <Button variant="outline" className="mt-2 gap-2 w-fit">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Open GitHub Issues
              <ArrowUpRight className="size-4" />
            </Button>
          </section>
        </div>
        <Card className="shadow-none rounded-xl border-neutral-200 border-1 border-solid p-6 gap-2">
          <CardContent className="text-center flex p-0 flex-col items-center gap-2">
            <div className="size-8 rounded-lg bg-neutral-100 flex justify-center items-center">
              <Heart className="size-4 text-neutral-950" />
            </div>
            <p className="font-semibold text-sm leading-5 mt-2">
              Thanks for reading this far
            </p>
            <p className="text-neutral-500 text-xs leading-4">
              nero is made with care by a small team of open-source
              contributors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
