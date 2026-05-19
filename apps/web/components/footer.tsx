import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { NeroLogo } from "./nero-logo";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <Link href="/" className="mb-6 flex items-center gap-2">
              <NeroLogo />
              <span className="text-base font-semibold text-neutral-950">{siteConfig.name}</span>
            </Link>
            <p className="text-xs text-neutral-500">{siteConfig.description}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-950">Product</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-950">
                Features
              </Link>
              <Link href={siteConfig.changelogHref} className="text-sm text-neutral-600 hover:text-neutral-950">
                Changelog
              </Link>
              <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-950">
                GitHub
              </a>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-950">Community</h4>
            <nav className="flex flex-col space-y-2">
              <Link href={siteConfig.communityHref} className="text-sm text-neutral-600 hover:text-neutral-950">
                Community Hub
              </Link>
              <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-950">
                GitHub Discussions
              </a>
              <a href={`${siteConfig.repoUrl}/issues`} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-950">
                Issues
              </a>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-950">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <Link href={siteConfig.privacyHref} className="text-sm text-neutral-600 hover:text-neutral-950">
                Privacy Policy
              </Link>
              <Link href={siteConfig.termsHref} className="text-sm text-neutral-600 hover:text-neutral-950">
                Terms of Service
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-950">Support</h4>
            <nav className="flex flex-col space-y-2">
              <Link href={siteConfig.docsHref} className="text-sm text-neutral-600 hover:text-neutral-950">
                Documentation
              </Link>
              <a href={siteConfig.supportHref} className="text-sm text-neutral-600 hover:text-neutral-950">
                Support the project
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            © 2026 {siteConfig.name}. MIT licensed. Made with <span className="text-red-500">♥</span>
          </p>
          <p className="text-xs text-neutral-500">Crafted with attention to detail.</p>
        </div>
      </div>
    </footer>
  );
}
