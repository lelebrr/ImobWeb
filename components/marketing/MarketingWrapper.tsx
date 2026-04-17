"use client";

import { useMarketingLanguage } from "@/lib/i18n/MarketingLanguageContext";
import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import Hero from "./Hero";

const ProblemSolution = dynamic(() => import("./ProblemSolution"), {
  loading: () => null,
});
const HowItWorks = dynamic(() => import("./HowItWorks"), {
  loading: () => null,
});
const FeaturesGrid = dynamic(() => import("./FeaturesGrid"), {
  loading: () => null,
});
const MarketplaceTeaser = dynamic(() => import("./MarketplaceTeaser"), {
  loading: () => null,
});
const FranchiseSection = dynamic(() => import("./FranchiseSection"), {
  loading: () => null,
});
const Testimonials = dynamic(() => import("./Testimonials"), {
  loading: () => null,
});
const PricingTable = dynamic(() => import("./PricingTable"), {
  loading: () => null,
});
const CTASection = dynamic(() => import("./CTASection"), {
  loading: () => null,
});
const Footer = dynamic(() => import("./Footer"), { loading: () => null });
const FloatingWhatsApp = dynamic(() => import("./FloatingWhatsApp"), {
  loading: () => null,
});

export default function MarketingWrapper() {
  const { t, language, setLanguage } = useMarketingLanguage();

  return (
    <>
      <Navbar />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <FeaturesGrid />
      <MarketplaceTeaser />
      <FranchiseSection />
      <Testimonials />
      <PricingTable />
      <CTASection />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
