import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import HLSVideo from "./HLSVideo";
import BlurText from "./BlurText";

const HLS_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export default function CtaFooter() {
  return (
    <section className="relative">
      {/* HLS video bg */}
      <HLSVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "200px",
          background: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "200px",
          background: "linear-gradient(to top, black, transparent)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* CTA content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 py-40">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.85] tracking-tight max-w-3xl mb-6">
          <BlurText text="Your next raise starts here." delay={80} />
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-white/60 font-body font-light text-sm md:text-base max-w-lg mb-10 leading-relaxed"
        >
          Define your milestones. Let AI verify your progress. Let investors
          fund what you've actually built. Launch in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <Link to="/create">
            <button className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
              Launch a Campaign
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to="/explore">
            <button className="bg-white text-black rounded-full px-6 py-3 font-body font-medium text-sm hover:bg-white/90 transition-colors">
              Explore Projects
            </button>
          </Link>
        </motion.div>

        {/* Footer bar */}
        <div className="mt-32 pt-8 border-t border-white/10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/40 font-body font-light text-xs">
            &copy; 2026 LaunchVault. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-white/40 hover:text-white/70 font-body font-light text-xs transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
