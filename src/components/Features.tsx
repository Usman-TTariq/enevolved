"use client";

import Link from "next/link";
import { Caladea, DM_Sans } from "next/font/google";
import { motion } from "framer-motion";
import { figmaFadeUp, figmaViewport } from "@/lib/figma-home-motion";

const sectionSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sectionDisplay = DM_Sans({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const sectionSerif = Caladea({
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
  display: "swap",
});

const listRows = [
  {
    label: "Custom your EPC dolor sit",
    sub: "Lorem ipsum dolor sit amet, consectetur adipiscing",
    price: "$47.00",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 2v2m6-2v2M7 8h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2zM9 12h6"
      />
    ),
  },
  {
    label: "Custom your EPC dolor sit",
    sub: "Lorem ipsum dolor sit amet, consectetur adipiscing",
    price: "$47.00",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" fill="none" strokeWidth={1.75} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2 12h20M12 2a15.3 15.3 0 010 20" />
      </>
    ),
  },
  {
    label: "Custom your EPC dolor sit",
    sub: "Lorem ipsum dolor sit amet, consectetur adipiscing",
    price: "$47.00",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l8.328-8.329a6 6 0 012.828-1.415z"
      />
    ),
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className={`${sectionSans.className} relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-[380px] w-[380px] rounded-full bg-violet-300/35 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[420px] -translate-x-1/2 rounded-full bg-teal-200/25 blur-[100px]" />
        <div className="absolute -right-16 top-1/3 h-[280px] w-[280px] rounded-full bg-violet-200/40 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left on desktop: product card */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={figmaViewport}
            variants={figmaFadeUp}
            className="order-2 lg:order-1"
          >
            <div
              className="flex w-full max-w-[min(100%,720px)] flex-col rounded-[20px] border border-neutral-200 bg-white p-8 sm:p-9 lg:h-[554px] lg:w-[720px] lg:max-w-none lg:shrink-0 lg:overflow-hidden"
              style={{ boxShadow: "0px 19.9px 39.81px -9.55px rgba(0, 0, 0, 0.05)" }}
            >
              <div className="shrink-0">
                <div className="flex flex-wrap items-start gap-4">
                  <div
                    className={`${sectionDisplay.className} flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-xl text-base font-bold text-neutral-950 shadow-sm ring-1 ring-violet-200/60 sm:h-16 sm:w-16 sm:text-lg`}
                    style={{
                      background: "linear-gradient(180deg, #e9d5ff 0%, #fbcfe8 100%)",
                    }}
                  >
                    41%
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`${sectionDisplay.className} text-2xl font-bold tracking-tight text-neutral-950`}>
                      Welcome Back!
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500 sm:text-[15px]">
                      <span className="text-neutral-400" aria-hidden>
                        →
                      </span>
                      Track commissions and sales from synced data
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-neutral-200/90 pt-8">
                  <p className={`${sectionDisplay.className} text-sm font-bold text-neutral-950 sm:text-[15px]`}>
                    Commission &amp; Performance
                  </p>

                  <div
                    className="mt-4 rounded-2xl p-4 sm:p-5"
                    style={{
                      background: "linear-gradient(90deg, #A890FE 0%, #7EF3E1 100%)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full max-w-[420px] rounded-full bg-white px-5 py-2.5 text-center text-sm font-medium text-neutral-950 shadow-sm">
                        www.yourbrandname.com
                      </div>
                      <p className="text-center text-xs font-medium leading-snug text-neutral-950 sm:text-sm">
                        Pulled live from brand&apos;s programme details endpoint for this programm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="features-card-scroll mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto pb-1 pr-1 sm:mt-7 lg:mt-5">
                {listRows.map((row, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50 p-3.5 sm:p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200/80">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {row.icon}
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${sectionDisplay.className} text-sm font-bold text-neutral-950 sm:text-base`}>
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">{row.sub}</p>
                    </div>
                    <span className={`${sectionDisplay.className} shrink-0 text-base font-bold text-[#28A745] sm:text-lg`}>
                      {row.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right on desktop: copy */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={figmaViewport}
            variants={figmaFadeUp}
            className="order-1 lg:order-2 lg:pl-4"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#e8d3ff] to-[rgba(232,212,255,0.12)] py-1.5 pl-2 pr-5">
              <span
                className="size-5 shrink-0 rounded-full ring-1 ring-violet-300/60"
                style={{
                  background: "radial-gradient(circle at 32% 28%, #f5f3ff 0%, #a78bfa 40%, #5b21b6 100%)",
                }}
                aria-hidden
              />
              <span className="text-sm font-semibold text-[#1f006a] sm:text-base">Platform Capabilities</span>
            </div>

            <h2 className="mt-6 max-w-xl tracking-tight text-neutral-950 [font-size:clamp(2rem,4vw,3.25rem)] [line-height:1.12] sm:mt-8">
              <span className={`${sectionDisplay.className} font-bold`}>Built For </span>
              <span className={`${sectionSerif.className} font-bold italic text-[#4c1d95]`}>Performance </span>
              <span className={`${sectionDisplay.className} font-bold`}>Partnerships</span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:mt-6 sm:text-lg">
              Our platform connects advertisers and publishers through reliable technology that simplifies
              collaboration, tracks results accurately, and supports long-term affiliate growth.
            </p>

            <Link
              href="/get-started"
              className={`${sectionDisplay.className} mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1f006a] to-[#4c1d95] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:opacity-95 sm:mt-10`}
            >
              Get Started For Free
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
