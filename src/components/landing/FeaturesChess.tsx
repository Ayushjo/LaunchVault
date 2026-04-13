import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import BlurText from "./BlurText";

const GIF_1 = "https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif";
const GIF_2 = "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif";

function FeatureRow({
  reverse,
  title,
  body,
  cta,
  gif,
}: {
  reverse?: boolean;
  title: string;
  body: string;
  cta: string;
  gif: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Text side */}
      <div className="flex-1 flex flex-col items-start gap-6">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-heading italic text-white leading-[0.95] tracking-tight">
          <BlurText text={title} delay={60} />
        </h3>
        <p className="text-white/60 font-body font-light text-sm md:text-base leading-relaxed max-w-md">
          {body}
        </p>
        <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
          {cta}
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* GIF side */}
      <div className="flex-1 w-full">
        <div className="liquid-glass rounded-2xl overflow-hidden aspect-video w-full">
          <img
            src={gif}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesChess() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-24">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="liquid-glass rounded-full px-3.5 py-1 mb-6"
        >
          <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
            Capabilities
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] max-w-2xl">
          <BlurText text="Pro features. Zero complexity." delay={70} />
        </h2>
      </div>

      {/* Alternating rows */}
      <div className="flex flex-col gap-24 max-w-6xl mx-auto">
        <FeatureRow
          title="AI that audits, not assumes."
          body="Document forensics, GitHub diff analysis, and LLM cross-referencing synthesize into a tamper-resistant verification score — signed and written to the blockchain before a single vote is cast."
          cta="Learn more"
          gif={GIF_1}
        />
        <FeatureRow
          reverse
          title="Votes that can't be gamed."
          body="Commit-reveal mechanics and Brier scoring make truthful reporting the economically dominant strategy. Manipulation isn't just hard — it's irrational by design."
          cta="See how it works"
          gif={GIF_2}
        />
      </div>
    </section>
  );
}
