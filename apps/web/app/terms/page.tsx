import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";

const terms = [
  "nero is provided under the MIT License.",
  "The software is provided as-is, without warranty of any kind.",
  "You are responsible for complying with local laws when using any activity tracking software.",
  "Contributions to the open-source project are accepted under the same license unless stated otherwise.",
];

export default function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Legal</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
            <p className="mt-4 text-base leading-7 text-neutral-600">
              Simple and fair terms for a free, local-first, open-source desktop tool.
            </p>
          </div>

          <Card className="mb-8 rounded-2xl border-neutral-200 bg-neutral-50 shadow-none">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                <Scale className="size-5 text-neutral-950" />
              </div>
              <div>
                <p className="font-semibold">A quick note before you read</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  These terms are here to protect both users and contributors. No legal theater, just practical boundaries.
                </p>
              </div>
            </CardContent>
          </Card>

          <ol className="space-y-4">
            {terms.map((term, index) => (
              <li key={term} className="rounded-2xl border border-neutral-200 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-500">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="text-base font-semibold">Clause {index + 1}</h2>
                </div>
                <p className="text-sm leading-7 text-neutral-700">{term}</p>
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer />
    </div>
  );
}
