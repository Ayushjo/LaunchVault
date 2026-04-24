/**
 * PageBackground — ambient orb + grid layer used on all inner pages
 */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Top-center violet core */}
      <div style={{
        position: "absolute", width: 900, height: 700,
        top: "-20%", left: "50%", transform: "translateX(-50%)",
        background: "radial-gradient(ellipse, rgba(109,40,217,0.15) 0%, transparent 65%)",
        filter: "blur(60px)",
      }} />

      {/* Mid-left blue */}
      <div style={{
        position: "absolute", width: 500, height: 500,
        top: "20%", left: "-10%",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        filter: "blur(80px)",
      }} />

      {/* Mid-right teal */}
      <div style={{
        position: "absolute", width: 400, height: 400,
        top: "45%", right: "-8%",
        background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
        filter: "blur(70px)",
      }} />

      {/* Bottom gradient to bg color */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
        background: "linear-gradient(to bottom, transparent, #080808)",
      }} />
    </div>
  );
}
