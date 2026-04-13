import Hero from "../components/landing/Hero";
import StartSection from "../components/landing/StartSection";
import FeaturesChess from "../components/landing/FeaturesChess";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import Stats from "../components/landing/Stats";
import Testimonials from "../components/landing/Testimonials";
import CtaFooter from "../components/landing/CtaFooter";

export default function Home() {
  return (
    <div className="bg-black">
      <Hero />
      <div className="bg-black">
        <StartSection />
        <FeaturesChess />
        <FeaturesGrid />
        <Stats />
        <Testimonials />
        <CtaFooter />
      </div>
    </div>
  );
}
