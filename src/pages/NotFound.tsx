import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Search } from "lucide-react";
import {type JSX} from "react"

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <span className="text-[10rem] font-black text-slate-800 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
              <Search className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Page Not Found</h1>
        <p className="text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          This page doesn't exist or has been moved. Double-check the URL or head back to explore active campaigns.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/create"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            Launch Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}