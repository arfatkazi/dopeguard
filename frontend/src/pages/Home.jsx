import React from "react";
import ScrollReveal from "../components/ScrollReveal";
import Hero from "../components/Hero";
import FeaturesSection from "../components/FeaturesSection";
import DemoPreview from "../components/DemoPreview";
import Testimonials from "../components/Testimonials";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import FAQ from "../components/FAQ";

export default function Home() {
  return (
    <div className="bg-dark text-white">
      <ScrollReveal>
        <Hero chromeUrl="/pricing" />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <FeaturesSection />
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <DemoPreview />
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <FAQ />
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <CTASection />
      </ScrollReveal>

      <Footer />
    </div>
  );
}
