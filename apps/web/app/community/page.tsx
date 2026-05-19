import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Bug,
  Coffee,
  Download,
  Heart,
  Lightbulb,
  MessageCircle,
  Users,
} from "lucide-react";

export default function Community() {
  return (
    <div className="bg-white text-neutral-950 w-full min-h-screen">
      <Header />
      <div className="max-w-[1140px] mx-auto px-8 py-12">
        <div className="text-center flex mb-12 flex-col items-center gap-4">
          <Badge
            variant="secondary"
            className="rounded-full bg-neutral-100 text-neutral-700 px-3 py-1"
          >
            <Users className="size-3 mr-1.5" />
            Community
          </Badge>
          <h1 className="font-bold text-5xl leading-12 tracking-tight">{`Community & Feedback`}</h1>
          <p className="max-w-xl text-neutral-500 text-base leading-6">
            nero is built in the open. Your feedback shapes every release.
          </p>
        </div>
        <div className="grid grid-cols-2 mb-8 gap-6">
          <Card className="shadow-none rounded-xl bg-neutral-50 border-neutral-200 border-0 border-solid p-6 gap-4">
            <CardHeader className="p-0 gap-4">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <MessageCircle className="size-5 text-neutral-950" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg leading-7 tracking-tight">
                  Join the Discord
                </h3>
                <p className="leading-relaxed text-neutral-500 text-sm leading-5">
                  Chat with other users, share tips, and get help from the
                  community.
                </p>
              </div>
            </CardHeader>
            <CardFooter className="p-0">
              <Button className="bg-neutral-950 text-neutral-50 px-4 gap-2 h-9">
                <MessageCircle className="size-4" />
                Join Discord
              </Button>
            </CardFooter>
          </Card>
          <Card className="shadow-none rounded-xl bg-neutral-50 border-neutral-200 border-0 border-solid p-6 gap-4">
            <CardHeader className="p-0 gap-4">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg leading-7 tracking-tight">
                  GitHub Discussions
                </h3>
                <p className="leading-relaxed text-neutral-500 text-sm leading-5">
                  Ask questions, share ideas, and discuss nero with the
                  developer and contributors.
                </p>
              </div>
            </CardHeader>
            <CardFooter className="p-0">
              <Button
                variant="outline"
                className="border-neutral-300 border-0 border-solid px-4 gap-2 h-9"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Open Discussions
              </Button>
            </CardFooter>
          </Card>
          <Card className="shadow-none rounded-xl bg-neutral-50 border-neutral-200 border-0 border-solid p-6 gap-4">
            <CardHeader className="p-0 gap-4">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <Bug className="size-5 text-neutral-950" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg leading-7 tracking-tight">
                  Report a Bug
                </h3>
                <p className="leading-relaxed text-neutral-500 text-sm leading-5">
                  Found something broken? Open an issue on GitHub and help
                  make nero better.
                </p>
              </div>
            </CardHeader>
            <CardFooter className="p-0">
              <Button
                variant="outline"
                className="border-neutral-300 border-0 border-solid px-4 gap-2 h-9"
              >
                <Bug className="size-4" />
                Open an Issue
              </Button>
            </CardFooter>
          </Card>
          <Card className="shadow-none rounded-xl bg-neutral-50 border-neutral-200 border-0 border-solid p-6 gap-4">
            <CardHeader className="p-0 gap-4">
              <div className="size-10 rounded-lg bg-neutral-100 flex justify-center items-center">
                <Lightbulb className="size-5 text-neutral-950" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg leading-7 tracking-tight">
                  Request a Feature
                </h3>
                <p className="leading-relaxed text-neutral-500 text-sm leading-5">
                  Have an idea? Submit a feature request and vote on what gets
                  built next.
                </p>
              </div>
            </CardHeader>
            <CardFooter className="p-0">
              <Button
                variant="outline"
                className="border-neutral-300 border-0 border-solid px-4 gap-2 h-9"
              >
                <Lightbulb className="size-4" />
                Request a Feature
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Card className="shadow-none rounded-xl bg-amber-50 border-amber-200 border-0 border-solid mb-12 p-6 gap-4">
          <CardContent className="flex p-0 justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 shrink-0 rounded-xl bg-amber-100 flex justify-center items-center">
                <Heart
                  className="size-6 text-amber-600"
                  fill="currentColor"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-amber-950 text-lg leading-7 tracking-tight">
                  Love nero? Support the project on Ko-fi ☕
                </h3>
                <p className="text-amber-800 text-sm leading-5">
                  nero is free forever. A small donation helps keep
                  development going.
                </p>
              </div>
            </div>
            <Button className="shrink-0 bg-amber-500 text-white px-5 gap-2 h-10">
              <Coffee className="size-4" />
              Donate on Ko-fi
            </Button>
          </CardContent>
        </Card>
        <div className="text-center flex py-8 flex-col items-center gap-4">
          <h2 className="font-bold text-2xl leading-8 tracking-tight">
            Stay in the loop
          </h2>
          <p className="max-w-md text-neutral-500 text-sm leading-5">
            Follow development updates, release notes, and announcements on
            GitHub.
          </p>
          <Button variant="ghost" className="text-neutral-950 px-4 gap-2 h-9">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3.405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Watch on GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
