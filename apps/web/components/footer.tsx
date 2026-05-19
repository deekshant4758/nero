import Link from "next/link";
import { NeroLogo } from "./nero-logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 w-full mt-auto">
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-5 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <NeroLogo />
              <span className="font-semibold text-base text-neutral-950">nero</span>
            </Link>
            <p className="text-xs text-neutral-500">
              Beautiful insights. Your data never leaves your PC.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-neutral-950 mb-4">Product</h4>
            <nav className="space-y-2">
              <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-950">
                Features
              </Link>
              <Link href="/changelog" className="text-sm text-neutral-600 hover:text-neutral-950">
                Changelog
              </Link>
              <a href="https://github.com" className="text-sm text-neutral-600 hover:text-neutral-950">
                GitHub
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-neutral-950 mb-4">Community</h4>
            <nav className="space-y-2">
              <a href="#" className="text-sm text-neutral-600 hover:text-neutral-950">
                Discord
              </a>
              <a href="#" className="text-sm text-neutral-600 hover:text-neutral-950">
                GitHub Discussions
              </a>
              <a href="#" className="text-sm text-neutral-600 hover:text-neutral-950">
                Issues
              </a>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-neutral-950 mb-4">Legal</h4>
            <nav className="space-y-2">
              <Link href="/privacy" className="text-sm text-neutral-600 hover:text-neutral-950">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-neutral-600 hover:text-neutral-950">
                Terms of Service
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-neutral-950 mb-4">Support</h4>
            <nav className="space-y-2">
              <Link href="/docs" className="text-sm text-neutral-600 hover:text-neutral-950">
                Documentation
              </Link>
              <a href="#" className="text-sm text-neutral-600 hover:text-neutral-950">
                Support Email
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-8 pt-8 flex justify-between items-center">
          <p className="text-xs text-neutral-500">
            © 2024 nero. MIT licensed. Made with <span className="text-red-500">♥</span>
          </p>
          <p className="text-xs text-neutral-500">
            Crafted with attention to detail.
          </p>
        </div>
      </div>
    </footer>
  );
}
