import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { Bug, Heart, Lightbulb, MessageCircle, Users } from "lucide-react";

const cards = [
  {
    icon: MessageCircle,
    title: "Join the conversation",
    copy: "Discuss features, share feedback, and follow the project as it evolves.",
    href: siteConfig.repoUrl,
    label: "Open GitHub",
  },
  {
    icon: Bug,
    title: "Report a bug",
    copy: "Found something broken? Open an issue with steps to reproduce and we can track it properly.",
    href: `${siteConfig.repoUrl}/issues`,
    label: "Open an issue",
  },
  {
    icon: Lightbulb,
    title: "Request a feature",
    copy: "Pitch ideas for future releases and explain the workflow problem you want nero to solve.",
    href: `${siteConfig.repoUrl}/issues`,
    label: "Share an idea",
  },
  {
    icon: Users,
    title: "Follow development",
    copy: "Watch release notes, roadmap discussion, and community feedback in one place.",
    href: siteConfig.changelogHref,
    label: "Read changelog",
  },
];

export default function Community() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Community</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Community & Feedback</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              nero is built in the open. Feedback, bug reports, and practical feature requests all help shape future releases.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cards.map((card) => (
              <Card key={card.title} className="rounded-2xl border-neutral-200 bg-neutral-50 p-6 shadow-none">
                <CardHeader className="gap-4 p-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                    <card.icon className="size-5 text-neutral-950" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{card.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{card.copy}</p>
                  </div>
                </CardHeader>
                <CardFooter className="p-0 pt-6">
                  <Button asChild variant="outline">
                    <a href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {card.label}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card className="mt-10 rounded-3xl border-amber-200 bg-amber-50 p-6 shadow-none">
            <CardContent className="flex flex-col gap-4 p-0 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Heart className="size-6 fill-current text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-950">Love the project?</h3>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Community support helps keep the app free and makes future polish and features easier to ship.
                  </p>
                </div>
              </div>
              <Button asChild className="bg-amber-500 text-white hover:bg-amber-600">
                <a href={siteConfig.supportHref}>Support nero</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
