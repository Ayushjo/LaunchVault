import Hero from "../components/landing/Hero";
import StartSection from "../components/landing/StartSection";
import FeaturesChess from "../components/landing/FeaturesChess";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import Stats from "../components/landing/Stats";
import Testimonials from "../components/landing/Testimonials";
import CtaFooter from "../components/landing/CtaFooter";

export default function Home() {
  return (
    <div className="grain relative overflow-x-hidden" style={{ background: "#080808" }}>
      {/* Ambient background — fixed, behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {/* Top violet core */}
        <div style={{
          position: "absolute", width: 1000, height: 900,
          top: "-22%", left: "50%", transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(109,40,217,0.16) 0%, transparent 65%)",
          filter: "blur(70px)",
        }} />
        {/* Mid-left blue */}
        <div style={{
          position: "absolute", width: 600, height: 600,
          top: "28%", left: "-10%",
          background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        {/* Mid-right teal */}
        <div style={{
          position: "absolute", width: 500, height: 500,
          top: "52%", right: "-6%",
          background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        {/* Lower violet */}
        <div style={{
          position: "absolute", width: 700, height: 500,
          bottom: "4%", left: "50%", transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(109,40,217,0.09) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <div className="relative z-10">
        <Hero />
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
