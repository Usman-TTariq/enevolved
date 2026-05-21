import Image from 'next/image'
import { Heart, MessageCircle, Users } from 'lucide-react'

/** Homepage-style hero visual — yellow creator card + phone video + two portrait cards */
export function MarketingHeroCollage() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-md min-w-0 lg:mx-0 lg:max-w-[600px] lg:justify-self-end xl:max-w-[640px]">
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:gap-4 xl:gap-5">
        <div
          className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-[2.25rem] p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] sm:rounded-[2.5rem] sm:p-5 lg:w-[min(100%,18.5rem)] xl:w-[min(100%,19.5rem)]"
          style={{ backgroundColor: '#FEE199' }}
        >
          <div className="mb-1.5 text-center sm:mb-2">
            <p className="text-base font-bold tracking-[0.15em] text-neutral-900 sm:text-lg">EARNYTICS</p>
            <p className="mt-0.5 text-sm font-medium text-neutral-800">@earnytics</p>
          </div>
          <div className="relative mx-auto w-full max-w-[260px] px-2 pb-6 pt-0 sm:max-w-[280px] sm:pb-7">
            <div className="absolute left-2 top-[5.75rem] z-20 flex flex-col gap-2 sm:left-3 sm:top-[6.25rem]">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-md">
                <Heart className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden />
                3560
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-md">
                <Users className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden />
                236k
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-md">
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden />
                226
              </div>
            </div>
            <div className="relative z-10 w-full">
              <div className="relative rounded-[2.1rem] bg-neutral-950 p-1.5 shadow-2xl ring-1 ring-black/50 sm:rounded-[2.25rem] sm:p-2">
                <div className="relative aspect-[9/17.6] w-full overflow-hidden rounded-[1.55rem] bg-neutral-900 sm:rounded-[1.7rem]">
                  <video
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-label=""
                  >
                    {/* MP4 first — Chrome/Edge reliably decode H.264 in MP4; raw .mov often shows black */}
                    <source src="/home-hero/6-1.mp4" type="video/mp4" />
                    <source src="/home-hero/6-1.mov" type="video/quicktime" />
                  </video>
                </div>
              </div>
            </div>
            <div className="absolute bottom-1.5 right-2 z-20 max-w-[12.5rem] rounded-2xl border border-white/95 bg-white px-3 py-1.5 shadow-lg sm:bottom-2 sm:right-3 sm:max-w-[13rem] sm:px-3.5 sm:py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-900">Creator program</p>
              <div className="mt-1.5 flex items-center gap-1">
                {['bg-rose-200', 'bg-amber-200', 'bg-cyan-200', 'bg-violet-200'].map((bg) => (
                  <span key={bg} className={`h-6 w-6 shrink-0 rounded-full border border-neutral-200/80 ${bg}`} aria-hidden />
                ))}
                <span className="ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                  +86
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:gap-5 lg:grid-rows-2 lg:gap-4 xl:gap-5">
          <div className="relative w-full overflow-hidden rounded-[2rem] shadow-[0_16px_40px_-18px_rgba(0,0,0,0.12)] sm:rounded-[2.25rem]">
            <Image
              src="/home-hero/home_banner_img3-DD9j9sJY.png.png"
              alt=""
              width={640}
              height={1024}
              className="block h-auto w-full object-cover object-top"
              sizes="(max-width: 1024px) 90vw, 300px"
            />
          </div>
          <div className="relative w-full overflow-hidden rounded-[2rem] shadow-[0_16px_40px_-18px_rgba(0,0,0,0.12)] sm:rounded-[2.25rem]">
            <Image
              src="/home-hero/home_banner_img3-DD9j9sJY.png-1.png"
              alt=""
              width={640}
              height={1024}
              className="block h-auto w-full object-cover object-top"
              sizes="(max-width: 1024px) 90vw, 300px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
