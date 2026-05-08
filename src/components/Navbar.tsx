"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/advertisers", label: "Advertisers" },
  { href: "/publishers", label: "Publishers" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function linkActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/blog") return pathname?.startsWith("/blog") ?? false;
  return pathname === href;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="fixed top-0 left-0 right-0 z-[100] border-b border-neutral-200/90 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/85"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/LinkHexa Logo Svg.svg"
            alt="LinkHexa"
            width={160}
            height={50}
            className="h-9 w-auto sm:h-10"
            priority
          />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex flex-wrap items-center justify-end gap-6 text-center lg:gap-8 xl:gap-11">
            {navLinks.map((link) => {
              const active = linkActive(pathname, link.href);
              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={`text-lg leading-7 transition-colors xl:text-2xl xl:leading-[36px] ${
                    active
                      ? "font-bold text-[#1f006a]"
                      : "font-normal text-[#a3a3a3] hover:text-neutral-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <Link
            href="/get-started"
            className="ml-4 rounded-xl bg-[#1f006a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2d0a7a]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="h-0.5 w-6 bg-neutral-800"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="h-0.5 w-6 bg-neutral-800"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="h-0.5 w-6 bg-neutral-800"
          />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-200 bg-white md:hidden"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={`rounded-lg px-4 py-3 text-base font-medium ${
                    linkActive(pathname, link.href)
                      ? "bg-violet-50 text-[#1f006a]"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/get-started"
                className="mt-2 rounded-xl bg-[#1f006a] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#2d0a7a]"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
