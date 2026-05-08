"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section id="contact" className="relative bg-neutral-50/80 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg sm:p-10 lg:p-16"
        >
          <div className="absolute inset-0 opacity-[0.12]">
            <Image
              src="/meeting-background-o9k6b5wkuevvy1f7.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/95 via-white/95 to-white" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 sm:text-3xl lg:text-4xl">
              Forge Valuable Partnerships Today
            </h2>
            <p className="mt-3 text-base text-neutral-600 sm:mt-4 sm:text-lg">
              Join a dynamic affiliate platform where advertisers, publishers, and creators collaborate to expand reach, boost performance, and unlock new revenue opportunities.
            </p>
            <Link
              href="/get-started"
              className="mt-6 inline-block w-full rounded-xl bg-[#1f006a] px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-[#2d0a7a] sm:mt-8 sm:w-auto sm:px-10"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
