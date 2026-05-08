"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const brands = ["Belkin", "BLOOMCHIC", "carter's", "Crocs", "macy's", "NordVPN", "Walmart", "47 Brand"];

const pressLogos = [
  { src: "/asiaone-pr.png", alt: "AsiaOne" },
  { src: "/bloomberg-pr.png", alt: "Bloomberg" },
  { src: "/businessinsider-pr.png", alt: "Business Insider" },
  { src: "/digitaljournal-pr.png", alt: "Digital Journal" },
  { src: "/marketwatch-pr.png", alt: "MarketWatch" },
  { src: "/yahoo-pr.png", alt: "Yahoo!" },
];

export default function TrustAndPartnerships() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-1/4 h-[260px] w-[260px] rounded-full bg-violet-200/40 blur-[85px]" />
        <div className="absolute -right-16 bottom-1/3 h-[240px] w-[240px] rounded-full bg-violet-100/50 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* 1. Trusted by industry leaders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-20 lg:mb-28"
        >
          <div className="mb-3 flex justify-center text-[#1f006a] sm:mb-4">
            <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.5a3.5 3.5 0 11-5 4.95 3.5 3.5 0 015-4.95m0 11a3.5 3.5 0 11-5-4.95 3.5 3.5 0 015 4.95" />
            </svg>
          </div>
          <h2 className="inline-block rounded-xl border-2 border-[#1f006a]/25 bg-violet-50 px-4 py-2.5 text-xl font-bold tracking-[-0.02em] text-[#1f006a] sm:px-6 sm:py-3 sm:text-2xl md:text-3xl lg:text-4xl">
            <span className="italic">Trusted</span> by industry leaders
          </h2>
          <p className="mt-4 text-neutral-600">
            In partnership with leading global brands to drive real success.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs text-neutral-600 sm:mt-6 sm:text-sm">
            {brands.map((name, i) => (
              <span key={name} className="flex items-center gap-x-2">
                <span>{name}</span>
                {i < brands.length - 1 && <span className="text-neutral-400">•</span>}
              </span>
            ))}
          </div>
          <Link
            href="/get-started"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1f006a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2d0a7a] sm:mt-8 sm:px-6 sm:py-3.5"
          >
            Join LinkHexa
            <span>→</span>
          </Link>
        </motion.div>

        {/* 2. Build Meaningful Partnerships Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 sm:mb-28"
        >
          <h2 className="inline-block rounded-xl border-2 border-[#1f006a]/25 bg-violet-50 px-4 py-2.5 text-xl font-bold tracking-[-0.02em] text-[#1f006a] sm:px-6 sm:py-3 sm:text-2xl md:text-3xl lg:text-4xl">
            Build <span className="italic">Meaningful</span> Partnerships Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600 leading-relaxed">
            Become part of a powerful affiliate platform where advertisers, publishers, and creators work together to grow audiences, drive performance, and create new earning opportunities.
          </p>
          <Link
            href="/get-started"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1f006a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2d0a7a] sm:mt-8 sm:px-6 sm:py-3.5"
          >
            Get started today
            <span>→</span>
          </Link>
        </motion.div>

        {/* 3. AS SEEN ON - Logo slider carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1f006a]">
            As seen on
          </p>
          <div className="mt-4 overflow-hidden sm:mt-6">
            <div className="flex w-max animate-marquee gap-8 sm:gap-12">
              {[...pressLogos, ...pressLogos].map((logo, i) => (
                <div
                  key={`${logo.alt}-${i}`}
                  className="flex h-10 w-[140px] shrink-0 items-center justify-center sm:h-12 sm:w-[160px]"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={48}
                    className="h-full w-full object-contain object-center opacity-80 transition-opacity hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
