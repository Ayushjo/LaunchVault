import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
  color: string;
  isCyan: boolean;
}

export default function BlockchainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodeCount = 28;
    const nodes: Node[] = Array.from({ length: nodeCount }, () => {
      const isCyan = Math.random() < 0.7;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 0.5 + 1,
        pulse: Math.random() * Math.PI * 2,
        color: isCyan ? "rgba(34, 211, 238," : "rgba(16, 185, 129,",
        isCyan,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.012;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Draw edges — razor-thin, near-invisible white
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.05;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Draw nodes — glowing fiber-optic tips, no outer ring
      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        const alpha = 0.5 + glow * 0.5;

        ctx.shadowBlur = 10;
        ctx.shadowColor = n.isCyan
          ? "rgba(34, 211, 238, 0.8)"
          : "rgba(16, 185, 129, 0.8)";

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color} ${alpha})`;
        ctx.fill();
      });

      // Reset shadow so it doesn't bleed
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-50"
    />
  );
}
