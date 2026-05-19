import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { Download, HardDrive, Info, MemoryStick, MonitorCog } from "lucide-react";

export default function Docs() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Documentation</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Installation Guide</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Get nero up and running locally in a minute, with local-first defaults and no cloud setup.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">On this page</div>
              <nav className="flex flex-col gap-1">
                <a href="#requirements" className="border-l-2 border-neutral-950 py-1 pl-3 text-sm font-medium text-neutral-950">
                  System Requirements
                </a>
                <a href="#download" className="border-l-2 border-transparent py-1 pl-3 text-sm text-neutral-500">
                  Download
                </a>
                <a href="#install" className="border-l-2 border-transparent py-1 pl-3 text-sm text-neutral-500">
                  Install
                </a>
              </nav>
            </aside>

            <div className="space-y-8">
              <section id="requirements">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500">01</span>
                  <h2 className="text-lg font-bold">System Requirements</h2>
                </div>
                <Card className="rounded-2xl border-0 bg-neutral-50 p-6 shadow-none">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Requirement icon={MonitorCog} label="Operating System" value="Windows 10/11 (64-bit)" />
                      <Requirement icon={MemoryStick} label="Memory (RAM)" value="Lightweight footprint" />
                      <Requirement icon={HardDrive} label="Disk Space" value="Small local install" />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
                      <Badge variant="secondary" className="border border-neutral-200 bg-white text-neutral-700">
                        <Info className="mr-1 size-3" />
                        Mac & Linux coming later
                      </Badge>
                      <span className="text-xs text-neutral-500">Track progress on the roadmap and changelog.</span>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="download">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500">02</span>
                  <h2 className="text-lg font-bold">Download</h2>
                </div>
                <Card className="rounded-2xl border-0 bg-neutral-50 p-6 shadow-none">
                  <CardContent className="p-0">
                    <p className="text-sm leading-6 text-neutral-700">
                      Download the latest release from the project repository once installers are published.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button asChild>
                        <a href={siteConfig.downloadHref}>
                          <Download className="size-4" />
                          Download for Windows
                        </a>
                      </Button>
                      <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer" className="text-sm text-neutral-700 underline underline-offset-4">
                        View repository
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="install">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500">03</span>
                  <h2 className="text-lg font-bold">Install</h2>
                </div>
                <Card className="rounded-2xl border border-neutral-200 p-6 shadow-none">
                  <CardContent className="p-0">
                    <ol className="space-y-3 text-sm leading-6 text-neutral-700">
                      <li>1. Download the latest Windows installer.</li>
                      <li>2. Launch the installer and follow the prompts.</li>
                      <li>3. Open nero and confirm it can access your local data folder.</li>
                    </ol>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Requirement({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MonitorCog;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-neutral-500">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold text-neutral-950">{value}</span>
    </div>
  );
}
