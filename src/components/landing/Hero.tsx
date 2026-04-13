import { motion } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import BlurText from "./BlurText";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

const partners = ["Ethereum", "OpenZeppelin", "Tenderly", "Anthropic", "Hardhat"];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "1000px" }}
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute left-0 w-full h-auto object-contain z-0"
        style={{ top: "20%" }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5 z-0" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "300px",
          background: "linear-gradient(to bottom, transparent, black)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-20 flex flex-col items-center text-center px-6"
        style={{ paddingTop: "150px" }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">
            New
          </span>
          <span className="text-white/80 text-xs font-body pr-3">
            AI-Verified Milestone Funding is Live
          </span>
        </motion.div>

        {/* Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-3xl tracking-[-3px] mb-6">
          <BlurText
            text="Fund the Future. Trust the Code."
            delay={100}
            direction="bottom"
          />
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-base text-white/70 font-body font-light leading-relaxed max-w-lg mb-8"
        >
          Milestone-based crowdfunding where AI verifies proof, game theory
          governs votes, and smart contracts enforce accountability.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <Link to="/create">
            <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
              Launch a Campaign
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to="/#explore">
            <button className="flex items-center gap-2 text-white/70 hover:text-white font-body font-light text-sm transition-colors">
              <Play className="w-4 h-4 fill-current" />
              Explore Projects
            </button>
          </Link>
        </motion.div>

        {/* Partners bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-20 flex flex-col items-center gap-6"
        >
          <div className="liquid-glass rounded-full px-4 py-2">
            <span className="text-white/40 text-xs font-body uppercase tracking-widest">
              Secured by the teams behind
            </span>
          </div>
          <div className="flex items-center gap-12 md:gap-16 flex-wrap justify-center">
            {partners.map((p) => (
              <span
                key={p}
                className="text-2xl md:text-3xl font-heading italic text-white/60 hover:text-white/90 transition-colors"
              >
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
