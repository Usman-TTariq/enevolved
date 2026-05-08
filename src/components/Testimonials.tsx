"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "LinkHexa helped us find high-performing campaigns in minutes. The platform makes managing partnerships effortless.",
    author: "Sarah Chen",
    role: "Partnerships Lead",
    company: "GrowthHub",
    avatar: "SC",
  },
  {
    quote:
      "We switched from multiple affiliate tools to LinkHexa. One dashboard, one platform, zero confusion.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "ScaleUp",
    avatar: "MJ",
  },
  {
    quote:
      "Setting up campaigns was effortless. Linked email, analytics, and payment tools in no time.",
    author: "Elena Rodriguez",
    role: "Growth Lead",
    company: "StackLabs",
    avatar: "ER",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-[#1f006a] sm:text-sm">
            Testimonials
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:mt-4 sm:text-3xl lg:text-4xl">
            Loved by teams everywhere
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:mt-4 sm:text-lg">
            See what our partners have to say for LinkHexa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <p className="flex-1 text-sm text-neutral-700 sm:text-base">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex flex-shrink-0 items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-[#1f006a]">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{t.author}</p>
                  <p className="text-sm text-neutral-600">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
