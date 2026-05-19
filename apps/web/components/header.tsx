import Link from "next/link";
import { NeroLogo } from "./nero-logo";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <NeroLogo />
          <span className="font-semibold text-base leading-6 tracking-tight text-neutral-950">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="text-neutral-500 text-sm leading-5 transition-colors hover:text-neutral-950">
            Features
          </Link>
          <Link href={siteConfig.privacyHref} className="text-neutral-500 text-sm leading-5 transition-colors hover:text-neutral-950">
            Privacy
          </Link>
          <Link href={siteConfig.docsHref} className="text-neutral-500 text-sm leading-5 transition-colors hover:text-neutral-950">
            Docs
          </Link>
          <Link href={siteConfig.communityHref} className="text-neutral-500 text-sm leading-5 transition-colors hover:text-neutral-950">
            Community
          </Link>
        </nav>
        <Button asChild className="gap-2 bg-neutral-950 text-neutral-50 hover:bg-neutral-900">
          <a href={siteConfig.downloadHref}>
          <Download className="size-4" />
          Download
          </a>
        </Button>
      </div>
    </header>
  );
}
