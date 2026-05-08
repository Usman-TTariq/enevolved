"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create your partner account",
    description:
      "Sign up as a publisher or advertiser in seconds and start building profitable partnerships.",
  },
  {
    number: "02",
    title: "Submit your information",
    description:
      "Provide your details, website, and payment info so we can verify your account and set you up for campaigns.",
  },
  {
    number: "03",
    title: "Choose campaigns or partners",
    description:
      "Publishers pick campaigns to earn, and advertisers connect with publishers to drive performance.",
  },
  {
    number: "04",
    title: "Drive sales and revenue",
    description:
      "Publishers earn by promoting campaigns, and advertisers grow their business through performance partnerships.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-neutral-50/80 py-16 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/4 h-[280px] w-[280px] rounded-full bg-violet-200/40 blur-[90px]" />
        <div className="absolute -right-20 bottom-1/4 h-[260px] w-[260px] rounded-full bg-violet-100/50 blur-[80px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#1f006a] sm:text-sm">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-neutral-900 sm:mt-4 sm:text-3xl lg:text-4xl">
            Get started in 4 simple steps
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            From registration to earning or launching campaigns in just minutes.
          </p>
        </motion.div>

        <div className="mt-8 sm:mt-10">
          <div className="relative">
            {/* Timeline line - hidden on mobile, visible from md up */}
            <div className="absolute left-5 top-0 bottom-0 hidden w-px bg-gradient-to-b from-violet-300 via-violet-200/80 to-transparent sm:left-6 md:block md:left-1/2 md:-translate-x-px" />

            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {steps.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative flex flex-col items-center gap-4 md:flex-row ${
                      !isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex w-full max-w-md flex-1 flex-col items-center md:items-end md:pr-10 ${
                        !isEven ? "md:items-start md:pl-10 md:pr-0" : ""
                      }`}
                    >
                      <div
                        className={`rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm md:text-left ${
                          !isEven ? "md:text-right" : ""
                        }`}
                      >
                        <span className="text-xs font-medium text-[#1f006a]">
                          Step {step.number}
                        </span>
                        <h3 className="mt-1 text-base font-semibold text-neutral-900 sm:text-lg">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
                      </div>
                    </div>

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#1f006a] bg-white shadow-sm">
                      <span className="text-sm font-bold text-[#1f006a]">
                        {step.number}
                      </span>
                    </div>

                    <div className="hidden w-full max-w-md flex-1 md:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
