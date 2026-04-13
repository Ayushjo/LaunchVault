import { motion } from "motion/react";
import HLSVideo from "./HLSVideo";
import BlurText from "./BlurText";

const HLS_URL =
  "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const stats = [
  { value: "200+", label: "Campaigns verified" },
  { value: "99%", label: "AI accuracy rate" },
  { value: "3.2x", label: "Capital protection factor" },
  { value: "72hrs", label: "Avg. verification time" },
];

export default function Stats() {
  return (
    <section className="relative py-8">
      {/* Desaturated HLS video */}
      <HLSVideo
        src={HLS_URL}
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "saturate(0)" }}
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

      {/* Content */}
      <div className="relative z-20 px-6 md:px-12 lg:px-24 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-16"
          >
            <div className="liquid-glass rounded-full px-3.5 py-1">
              <span className="text-xs font-medium text-white font-body uppercase tracking-widest">
                By the Numbers
              </span>
            </div>
          </motion.div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="liquid-glass rounded-3xl p-12 md:p-16"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col gap-2 items-center text-center"
                >
                  <span className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white">
                    {value}
                  </span>
                  <span className="text-white/60 font-body font-light text-sm">
                    {label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Heading below card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-heading italic text-white tracking-tight leading-[0.9]">
              <BlurText text="Numbers that speak for themselves." delay={70} />
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
