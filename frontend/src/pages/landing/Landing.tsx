import { Footer } from "../../components/landing/Footer";
import { Hero } from "../../components/landing/Hero";
import { Nav } from "../../components/landing/Nav";
import { ScrollBeam } from "../../components/landing/ScrollBeam";
import {
  Features,
  FinalCTA,
  HowItWorks,
  Integrations,
  Pricing,
  SocialProof,
  Testimonials,
} from "../../components/landing/Sections";
import "./landing.css";

export function Landing() {
  return (
    <div id="top" className="landing-root">
      <Nav />
      <ScrollBeam />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Features />
        <Integrations />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
