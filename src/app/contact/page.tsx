'use client'

import { useState } from 'react'
import { SiteFooter } from '@/components/common/SiteFooter'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder – wire to API later
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader active="contact" />

      {/* Hero — light gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(900px 420px at 85% 15%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(600px 360px at 10% 90%, rgba(14,165,233,0.12), transparent 50%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)] py-14 md:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 sm:text-sm">
              Get in touch
            </p>
            <h1 className="font-heading text-4xl font-bold leading-[1.12] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              We&apos;d love to hear from you
            </h1>
            <p className="mt-6 text-base leading-relaxed text-neutral-600 sm:text-lg md:text-xl">
              Questions about Earnytics, becoming an advertiser or publisher, or need support? Reach out and we&apos;ll get back
              soon.
            </p>
          </div>
        </div>
      </section>

      {/* Contact — info cards + form (light) */}
      <section className="border-t border-neutral-200 bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12 xl:gap-16">
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04] transition hover:shadow-[0_18px_44px_-20px_rgba(6,182,212,0.28)]">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-200/60">
                  <svg className="h-6 w-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Email</h3>
                <a href="mailto:info@earnytics.com" className="mt-2 inline-block font-medium text-cyan-700 hover:text-cyan-800">
                  info@earnytics.com
                </a>
                <p className="mt-2 text-sm text-neutral-500">advertisers@earnytics.com</p>
                <p className="text-sm text-neutral-500">publishers@earnytics.com</p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04] transition hover:shadow-[0_18px_44px_-20px_rgba(6,182,212,0.28)]">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-200/60">
                  <svg className="h-6 w-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Phone</h3>
                <a href="tel:+18472087685" className="mt-2 inline-block font-medium text-cyan-700 hover:text-cyan-800">
                  +1 847 208 7685
                </a>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04] transition hover:shadow-[0_18px_44px_-20px_rgba(6,182,212,0.28)]">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-200/60">
                  <svg className="h-6 w-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Office</h3>
                <p className="mt-2 text-neutral-600">Earnytics LLC</p>
                <p className="text-neutral-600">734 S Charlotte St</p>
                <p className="text-neutral-600">Lombard, IL 60148</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.28)] ring-1 ring-black/[0.05] sm:p-10">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  Send us a message
                </h2>
                <p className="mt-2 text-neutral-600">Fill out the form below and we&apos;ll respond within 24–48 hours.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-neutral-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-neutral-700">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                    >
                      <option value="">Select a topic</option>
                      <option value="advertiser">Advertiser inquiry</option>
                      <option value="publisher">Publisher inquiry</option>
                      <option value="support">Technical support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-neutral-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
                      placeholder="How can we help?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-900/15 bg-gradient-to-r from-amber-100 via-white to-cyan-100 px-9 py-3.5 text-base font-semibold text-neutral-900 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.18)] ring-1 ring-inset ring-white/90 transition hover:scale-[1.02] hover:border-neutral-900/25 hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.22)]"
                  >
                    Send message
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support strip — light */}
      <section className="border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white py-10 sm:py-12">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-10 lg:px-14 xl:px-16 2xl:px-[clamp(2.5rem,8vw,8.75rem)]">
          <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12 lg:gap-16">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-200/60">
                <svg className="h-6 w-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Support hours</p>
                <p className="text-sm text-neutral-600">Mon–Fri, 9am–6pm AEST</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-200/60">
                <svg className="h-6 w-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Quick responses</p>
                <p className="text-sm text-neutral-600">We aim to reply within 24–48 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
