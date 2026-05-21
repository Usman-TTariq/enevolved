'use client'

import Link from 'next/link'
import { useTranslations } from '@/contexts/LocaleContext'

type SiteFooterProps = {
  id?: string
}

/** Figma “arrow” icon — 20×20, northeast */
function FooterNavArrow({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.39184 5.32319H14.9183L14.9175 14.8506L13.543 14.8497V7.67078L6.54089 14.6729L5.56862 13.7006L12.5707 6.69851L5.39272 6.69763L5.39184 5.32319Z"
        fill="currentColor"
        className="transition-colors duration-300"
      />
    </svg>
  )
}

function FooterUnderlineLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="group relative inline-block shrink-0">
      <span className="font-hero text-lg font-medium leading-[1.2] text-[#8c8c8c] transition-colors duration-300 group-hover:text-[#262626]">
        {children}
      </span>
      <span
        className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#2B75FF] transition-all duration-300 ease-out group-hover:w-full"
        aria-hidden
      />
    </Link>
  )
}

export function SiteFooter({ id = 'contact' }: SiteFooterProps) {
  const { t } = useTranslations()
  const supportMail = 'mailto:support@earnytics.com'
  const supportPhoneHref = 'tel:+18472087685'
  const supportPhoneLabel = '+1 847 208 7685'
  const supportAddressLines = ['734 S Charlotte St', 'Lombard, IL 60148'] as const

  const navRows = [
    { href: '/', labelKey: 'nav.home' as const },
    { href: '/influencers', labelKey: 'nav.influencers' as const },
    { href: '/publishers', labelKey: 'nav.publishers' as const },
    { href: '/advertisers', labelKey: 'nav.advertisers' as const },
    { href: '/about', labelKey: 'nav.aboutUs' as const },
    { href: '/blog', labelKey: 'nav.blog' as const },
  ] as const

  return (
    <footer className="border-t border-[#e8e8e8] bg-white text-[#262626]" id={id}>
      <div className="mx-auto flex w-full max-w-[1840px] flex-col gap-12 px-6 pb-6 pt-12 sm:px-8 md:px-10 lg:px-[40px]">
        {/* Let’s talk + email */}
        <div className="flex w-full shrink-0 flex-col gap-4 font-heading font-medium leading-[1.2] not-italic text-[#262626] sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <p className="shrink-0 text-[clamp(2.25rem,6vw,5rem)] tracking-tight lg:text-[80px]">{t('footer.letsTalk')}</p>
          <div className="flex max-w-full shrink-0 flex-col items-start gap-3 sm:max-w-[min(100%,52%)] sm:items-end sm:text-right">
            <a
              href={supportMail}
              className="group relative inline-block max-w-full cursor-pointer break-all text-[clamp(1.5rem,4vw,5rem)] tracking-tight lg:text-[80px]"
            >
              <span className="relative inline-block">{t('footer.supportEmail')}</span>
              <span
                className="absolute bottom-[-2px] left-0 h-[3px] w-full origin-left scale-x-0 bg-[#2B75FF] transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden
              />
            </a>

            <div className="flex flex-col gap-1 text-left font-hero text-base font-medium leading-snug text-[#8c8c8c] sm:items-end sm:text-right sm:text-lg">
              <a href={supportPhoneHref} className="hover:text-[#262626] transition-colors duration-300">
                {supportPhoneLabel}
              </a>
              <div>
                {supportAddressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full shrink-0 bg-[#D9D9D9]" aria-hidden />

        {/* Logo + nav + CTA */}
        <div className="flex w-full flex-col gap-16 lg:gap-20">
          <div className="flex w-full flex-col gap-14 pt-2 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-24">
            {/* Logo + tagline */}
            <div className="flex max-w-[500px] flex-col gap-6">
              <Link
                href="/"
                className="inline-block w-fit transition-transform duration-300 ease-out hover:scale-[1.02]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Untitled%20design%20(2).svg"
                  alt="Earnytics"
                  className="h-7 w-auto max-w-[200px] object-contain object-left sm:h-8"
                />
              </Link>
              <p className="font-hero text-lg font-medium leading-[1.2] text-[#8c8c8c] sm:text-xl">
                {t('footer.brandTaglineShort')}
              </p>
            </div>

            {/* Nav — Figma: column gap 24px, Poppins 20px, underline + arrow */}
            <nav className="flex flex-col gap-6 lg:pl-4" aria-label="Footer">
              {navRows.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  className="group inline-flex w-fit items-center gap-1 no-underline"
                >
                  <span className="relative">
                    <span className="font-hero text-lg font-medium capitalize leading-none text-[#8c8c8c] transition-colors duration-300 group-hover:text-[#262626] sm:text-xl">
                      {t(labelKey)}
                    </span>
                    <span
                      className="absolute bottom-[-2px] left-0 h-0.5 w-0 bg-[#2B75FF] transition-all duration-300 ease-out group-hover:w-full"
                      aria-hidden
                    />
                  </span>
                  <FooterNavArrow className="size-5 shrink-0 text-[#404040] transition-colors duration-300 group-hover:text-[#262626]" />
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex flex-col gap-6">
              <p className="font-hero text-lg font-medium leading-[1.6] text-[#8c8c8c] text-nowrap sm:text-xl">
                {t('footer.readyLine')}
              </p>
              <Link
                href="/signup"
                className="group relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[100px] border border-[#262626] bg-[#262626] px-6 py-3 transition-all duration-300 ease-out hover:scale-[1.03]"
              >
                <span
                  className="font-hero text-lg font-normal capitalize leading-[1.2] transition-all duration-300 ease-out sm:text-[22px]"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #fff4df, #a8d3ff)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {t('nav.getStarted')}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom — legal + Instagram + top */}
        <div className="flex w-full flex-col gap-8 border-t border-[#D9D9D9] pt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <FooterUnderlineLink href="/privacy">{t('footer.privacyPolicy')}</FooterUnderlineLink>
            <span className="hidden h-4 w-px shrink-0 bg-[#BFBFBF] sm:block" aria-hidden />
            <FooterUnderlineLink href="/imprint">{t('footer.legalImprint')}</FooterUnderlineLink>
            <span className="hidden h-4 w-px shrink-0 bg-[#BFBFBF] sm:block" aria-hidden />
            <p className="font-hero w-full text-base font-medium leading-[1.2] text-[#8c8c8c] text-nowrap sm:w-auto sm:text-lg">
              {t('footer.copyright')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <a
              href="https://www.instagram.com/earn_ytics/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/ig relative inline-flex h-12 max-w-[240px] shrink-0 cursor-pointer items-center gap-4 rounded-[60px] py-0 pl-1.5 pr-6 transition-transform duration-300 hover:scale-105"
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-[60px] p-px transition-all duration-300"
                style={{ background: '#d9d9d9' }}
                aria-hidden
              />
              <span className="pointer-events-none absolute inset-[1px] rounded-[59px] bg-white" aria-hidden />
              <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-[36px] bg-[#262626] text-white transition-opacity duration-300">
                <svg className="size-[19px]" viewBox="0 0 19 19" fill="none" aria-hidden>
                  <path
                    d="M9.49745 4.62558C6.80005 4.62558 4.62312 6.80255 4.62312 9.5C4.62312 12.1974 6.80005 14.3744 9.49745 14.3744C12.1948 14.3744 14.3718 12.1974 14.3718 9.5C14.3718 6.80255 12.1948 4.62558 9.49745 4.62558ZM9.49745 12.668C7.75305 12.668 6.32949 11.2444 6.32949 9.5C6.32949 7.75557 7.75305 6.33198 9.49745 6.33198C11.2418 6.33198 12.6654 7.75557 12.6654 9.5C12.6654 11.2444 11.2418 12.668 9.49745 12.668ZM14.5714 3.28993C13.9416 3.28993 13.433 3.79852 13.433 4.42832C13.433 5.05812 13.9416 5.56672 14.5714 5.56672C15.2012 5.56672 15.7098 5.0605 15.7098 4.42832C15.71 4.27877 15.6806 4.13066 15.6235 3.99246C15.5664 3.85426 15.4825 3.72869 15.3768 3.62294C15.271 3.51719 15.1455 3.43335 15.0073 3.3762C14.8691 3.31906 14.721 3.28974 14.5714 3.28993ZM18.9989 9.5C18.9989 8.18811 19.0108 6.88811 18.9371 5.5786C18.8635 4.05757 18.5165 2.70766 17.4043 1.59541C16.2897 0.480781 14.9421 0.136173 13.4211 0.0624986C12.1093 -0.0111762 10.8093 0.000706914 9.49982 0.000706914C8.18796 0.000706914 6.88798 -0.0111762 5.5785 0.0624986C4.0575 0.136173 2.70761 0.483158 1.59538 1.59541C0.480772 2.71004 0.136171 4.05757 0.0624975 5.5786C-0.0111759 6.89049 0.000706887 8.19049 0.000706887 9.5C0.000706887 10.8095 -0.0111759 12.1119 0.0624975 13.4214C0.136171 14.9424 0.483149 16.2923 1.59538 17.4046C2.70999 18.5192 4.0575 18.8638 5.5785 18.9375C6.89036 19.0112 8.19034 18.9993 9.49982 18.9993C10.8117 18.9993 12.1117 19.0112 13.4211 18.9375C14.9421 18.8638 16.292 18.5168 17.4043 17.4046C18.5189 16.29 18.8635 14.9424 18.9371 13.4214C19.0132 12.1119 18.9989 10.8119 18.9989 9.5ZM16.9076 15.104C16.7341 15.5366 16.5249 15.8598 16.1898 16.1925C15.8547 16.5276 15.5339 16.7368 15.1014 16.9103C13.8513 17.407 10.883 17.2953 9.49745 17.2953C8.11191 17.2953 5.14121 17.407 3.89114 16.9126C3.4586 16.7391 3.13539 16.53 2.80267 16.1949C2.46758 15.8598 2.25844 15.539 2.08495 15.1064C1.59063 13.8539 1.70232 10.8856 1.70232 9.5C1.70232 8.11444 1.59063 5.14368 2.08495 3.89359C2.25844 3.46104 2.46758 3.13783 2.80267 2.8051C3.13777 2.47238 3.4586 2.26086 3.89114 2.08737C5.14121 1.59303 8.11191 1.70473 9.49745 1.70473C10.883 1.70473 13.8537 1.59303 15.1038 2.08737C15.5363 2.26086 15.8595 2.47 16.1922 2.8051C16.5273 3.1402 16.7365 3.46104 16.9099 3.89359C17.4043 5.14368 17.2926 8.11444 17.2926 9.5C17.2926 10.8856 17.4043 13.8539 16.9076 15.104Z"
                    fill="white"
                  />
                </svg>
              </span>
              <span className="relative z-10 font-hero text-lg font-medium capitalize leading-[1.2] text-[#8c8c8c] underline decoration-solid underline-offset-2 transition-colors duration-300 group-hover/ig:text-[#262626]">
                {t('footer.instagram')}
              </span>
            </a>

            <button
              type="button"
              onClick={() => {
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } catch {
                  window.scrollTo(0, 0)
                }
              }}
              className="relative size-12 shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
              aria-label={t('footer.backToTop')}
            >
              <svg className="size-full" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect x="0.5" y="0.5" width="47" height="47" rx="15.5" stroke="#D9D9D9" fill="transparent" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.7162 29.2705C24.7162 29.464 24.6393 29.6495 24.5025 29.7863C24.3657 29.9231 24.1801 30 23.9867 30C23.7932 30 23.6076 29.9231 23.4708 29.7863C23.334 29.6495 23.2572 29.464 23.2572 29.2705V20.7916L20.4072 23.6416C20.2697 23.7745 20.0854 23.8481 19.8941 23.8466C19.7029 23.845 19.5199 23.7684 19.3845 23.6332C19.2492 23.498 19.1724 23.315 19.1707 23.1238C19.1689 22.9325 19.2423 22.7482 19.3752 22.6105L23.4702 18.5155L23.9857 18L24.5012 18.5155L28.5972 22.6105C28.6689 22.6773 28.7263 22.7578 28.7662 22.8473C28.8061 22.9368 28.8275 23.0334 28.8293 23.1314C28.831 23.2293 28.813 23.3266 28.7763 23.4175C28.7396 23.5083 28.685 23.5908 28.6157 23.6601C28.5464 23.7294 28.4639 23.784 28.3731 23.8207C28.2822 23.8573 28.1849 23.8754 28.087 23.8736C27.989 23.8719 27.8924 23.8505 27.803 23.8106C27.7135 23.7707 27.6329 23.7132 27.5661 23.6416L24.7162 20.7916V29.2715V29.2705Z"
                  fill="#262626"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
