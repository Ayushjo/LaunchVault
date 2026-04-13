import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import BlurText from "./BlurText";
import HLSVideo from "./HLSVideo";
import { motion } from "motion/react";

const HLS_URL = "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

export default function StartSection() {
  return (
    <section className="relative" style={{ minHeight: "600px" }}>
      {/* HLS Video background */}
      <HLSVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top gradient fade */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "200px",
          background: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "200px",
          background: "linear-gradient(to top, black, transparent)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Content */}
      <div
        className="relative z-20 flex flex-col items-center text-center px-6 py-32"
        style={{ minHeight: "600px", justifyContent: "center" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass rounded-full px-3.5 py-1 mb-6"
        >
          <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
            The Protocol
          </span>
        </motion.div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-2xl mb-6">
          <BlurText text="You build it. Proof verifies it." delay={80} />
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-white/60 font-body font-light text-sm md:text-base max-w-xl mb-10 leading-relaxed"
        >
          Founders stake collateral and define milestones. Investors commit ETH.
          AI agents audit evidence on-chain. Token holders vote. Capital flows
          only when truth is confirmed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <Link to="/create">
            <button className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
              Start a Campaign
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
