import Hero from "../components/landing/Hero";
import StartSection from "../components/landing/StartSection";
import FeaturesChess from "../components/landing/FeaturesChess";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import Stats from "../components/landing/Stats";
import Testimonials from "../components/landing/Testimonials";
import CtaFooter from "../components/landing/CtaFooter";

export default function Home() {
  return (
    <div className="bg-black relative overflow-x-hidden">
      {/* ── Persistent ambient background ───────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {/* Top-center purple core — bleeds into hero */}
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(99,60,255,0.18) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        {/* Mid-left blue glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            top: "30%",
            left: "-8%",
            background:
              "radial-gradient(circle, rgba(56,130,255,0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Mid-right teal glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            top: "55%",
            right: "-5%",
            background:
              "radial-gradient(circle, rgba(0,190,170,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Bottom purple glow */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 500,
            bottom: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(99,60,255,0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
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
