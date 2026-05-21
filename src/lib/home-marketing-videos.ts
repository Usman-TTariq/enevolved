/** Vertical reels in “Our Creator Cases” on the home page */
export const HOME_CREATOR_CASE_VIDEO_SRCS = [
  '/home-creator-cases/1.mp4',
  '/home-hero/Model_steps_out_202604220234.mp4',
  '/home-creator-cases/3.mp4',
  '/home-creator-cases/4.mp4',
  '/home-creator-cases/5.mov',
  '/home-creator-cases/6.mov',
] as const

/** Hero yellow-card phone reel (H.264), same asset as `MarketingHeroCollage` */
export const HOME_HERO_REEL_VIDEO_SRC = '/home-hero/6-1.mp4' as const

/** Every marketing `<video>` used on the homepage (hero reel + creator strip) */
export const HOME_ALL_MARKETING_VIDEO_SRCS = [HOME_HERO_REEL_VIDEO_SRC, ...HOME_CREATOR_CASE_VIDEO_SRCS] as const
