/**
 * PageBackground — ambient orb layer used on all inner pages
 * (Home manages its own animated version)
 */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {/* Top-center purple */}
      <div style={{
        position: "absolute", width: 800, height: 800,
        top: "-25%", left: "50%", transform: "translateX(-50%)",
        background: "radial-gradient(circle, rgba(99,60,255,0.13) 0%, transparent 65%)",
        filter: "blur(70px)",
      }} />
      {/* Mid-left blue */}
      <div style={{
        position: "absolute", width: 500, height: 500,
        top: "25%", left: "-8%",
        background: "radial-gradient(circle, rgba(56,130,255,0.09) 0%, transparent 70%)",
        filter: "blur(80px)",
      }} />
      {/* Mid-right teal */}
      <div style={{
        position: "absolute", width: 450, height: 450,
        top: "50%", right: "-5%",
        background: "radial-gradient(circle, rgba(0,190,170,0.07) 0%, transparent 70%)",
        filter: "blur(80px)",
      }} />
      {/* Bottom purple */}
      <div style={{
        position: "absolute", width: 600, height: 400,
        bottom: "5%", left: "50%", transform: "translateX(-50%)",
        background: "radial-gradient(circle, rgba(99,60,255,0.08) 0%, transparent 70%)",
        filter: "blur(80px)",
      }} />
    </div>
  );
}
