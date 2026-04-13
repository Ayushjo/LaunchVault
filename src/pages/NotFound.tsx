import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { type JSX } from "react";
import PageBackground from "../components/layout/PageBackground";

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      <PageBackground />
      <div className="relative z-10 text-center max-w-lg">
        {/* Ghost number */}
        <div className="relative mb-8 select-none">
          <span className="text-[160px] md:text-[200px] font-heading italic leading-none text-white/[0.03]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="liquid-glass rounded-2xl px-6 py-3">
              <span className="text-white/40 font-body text-sm uppercase tracking-[0.2em]">Not Found</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-heading italic text-white tracking-tight leading-[0.9] mb-4">
          This page doesn't exist.
        </h1>
        <p className="text-white/40 font-body font-light text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          The URL may be wrong or the campaign may have moved. Head back and explore what's on-chain.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/">
            <button className="flex items-center gap-2 liquid-glass-strong rounded-full px-6 py-3 text-white font-body font-medium text-sm hover:opacity-90 transition-opacity">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
          <Link to="/explore">
            <button className="flex items-center gap-2 bg-white text-black rounded-full px-6 py-3 font-body font-medium text-sm hover:bg-white/90 transition-colors">
              Explore Campaigns
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
