import Link from "next/link";
import { NeroLogo } from "./nero-logo";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function Header() {
  return (
    <header className="sticky z-50 bg-white border-neutral-200 border-b w-full top-0">
      <div className="flex px-8 py-4 justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <NeroLogo />
          <span className="font-semibold text-base leading-6 tracking-tight text-neutral-950">
            nero
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/" className="text-neutral-500 text-sm leading-5 hover:text-neutral-950">
            Features
          </Link>
          <Link href="/privacy" className="text-neutral-500 text-sm leading-5 hover:text-neutral-950">
            Security
          </Link>
          <Link href="/docs" className="text-neutral-500 text-sm leading-5 hover:text-neutral-950">
            Docs
          </Link>
          <Link href="/community" className="text-neutral-500 text-sm leading-5 hover:text-neutral-950">
            Contact
          </Link>
        </nav>
        <Button className="gap-2 bg-neutral-950 text-neutral-50 hover:bg-neutral-900">
          <Download className="size-4" />
          Download
        </Button>
      </div>
    </header>
  );
}
