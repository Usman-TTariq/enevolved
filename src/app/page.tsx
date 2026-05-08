import { Public_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroLogoCarousel from "@/components/HeroLogoCarousel";
import Features from "@/components/Features";
import ForAdvertisers from "@/components/ForAdvertisers";
import ForPublishers from "@/components/ForPublishers";
import ImpactByNumbers from "@/components/ImpactByNumbers";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import TrustAndPartnerships from "@/components/TrustAndPartnerships";
import BlogPreview from "@/components/BlogPreview";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

/** Figma file uses Aeonik; Public Sans is the closest variable-backed Google pairing for layout type. */
const homeFigma = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Home() {
  return (
    <div
      className={`${homeFigma.className} min-w-0 bg-white text-neutral-900 antialiased [font-feature-settings:'liga'_1,'kern'_1]`}
      data-home-theme="figma"
    >
      <Navbar />
      <main className="min-w-0">
        <Hero />
        <HeroLogoCarousel />
        <Features />
        <ForAdvertisers />
        <HowItWorks />
        <ForPublishers />
        <ImpactByNumbers />
        <Testimonials />
        <FAQ />
        <TrustAndPartnerships />
        <BlogPreview />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
