import { useState } from "react";
import { Link } from "react-router-dom";
import { campaigns } from "../data/mockData";
import BlockchainBackground from "../components/BlockchainBackground";
import HowItWorks from "../components/HowItWorks";
import FeatureCards from "../components/FeatureCards";
import {
  Zap, TrendingUp, Shield, Users, Clock,
  ArrowRight, Search, Filter, ChevronRight,
  CheckCircle2
} from "lucide-react";

const categories = ["All", "CleanTech", "HealthTech", "EdTech", "Logistics", "Web3", "GovTech"];

const statusConfig = {
  active: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: TrendingUp },
  voting: { label: "Voting", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  funded: { label: "Funded", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: CheckCircle2 },
  released: { label: "Released", color: "text-slate-300", bg: "bg-slate-800 border-slate-700", icon: CheckCircle2 },
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-700 relative"
        style={{ width: `${Math.min(value, 100)}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
      </div>
    </div>
  );
}

function FeaturedCampaignCard({ campaign }: { campaign: any }) {
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );
  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.active;
  const StatusIcon = status.icon;

  return (
    <Link to={`/campaign/${campaign.id}`} className="block group">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
        
        <div className="flex-1 space-y-6 z-10 w-full">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{campaign.category}</span>
          </div>

          <div>
            <h3 className="text-white font-black text-3xl mb-3 group-hover:text-emerald-400 transition-colors">
              {campaign.title}
            </h3>
            <p className="text-slate-400 text-base leading-relaxed line-clamp-2">
              {campaign.description}
            </p>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <span className="text-white text-3xl font-black">{campaign.raised}</span>
                <span className="text-slate-500 font-medium ml-1">/ {campaign.goal} ETH</span>
              </div>
              <span className="text-emerald-400 font-bold">{Math.round(progress)}% Funded</span>
            </div>
            <ProgressBar value={progress} />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-medium mb-1">Backers</span>
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Users className="w-4 h-4 text-emerald-500" />
                {campaign.investors}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-medium mb-1">Time Left</span>
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Clock className="w-4 h-4 text-emerald-500" />
                {daysLeft > 0 ? `${daysLeft} days` : "Ended"}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-medium mb-1">Reward Token</span>
              <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                <Zap className="w-4 h-4" />
                {campaign.tokens}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RegularCampaignCard({ campaign }: { campaign: any }) {
  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <Link to={`/campaign/${campaign.id}`} className="block h-full">
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col group relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-800/50 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-900/30 transition-all duration-500" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          <span className="text-xs text-slate-500 font-medium">{campaign.category}</span>
        </div>

        <h3 className="text-white font-bold text-lg mb-2 leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 relative z-10">
          {campaign.title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 flex-1 relative z-10">
          {campaign.description}
        </p>

        <div className="mb-4 relative z-10">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-white text-sm font-semibold">
              {campaign.raised} <span className="text-slate-500 font-normal">/ {campaign.goal} ETH</span>
            </span>
            <span className="text-emerald-500 text-xs font-bold">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>
    </Link>
  );
}

function StatCard({ icon: Icon, value, label, delay }: { icon: any, value: any, label: string, delay: number }) {
  return (
    <div className={`glass-card rounded-2xl p-6 flex items-center gap-5 animate-fade-up-delay-${delay}`}>
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
        <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
          <Icon className="w-6 h-6 text-emerald-500" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-white tracking-tight">
          {value}
        </div>
        <div className="text-slate-400 text-sm font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = campaigns.filter((c: any) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const totalRaised = campaigns.reduce((s: number, c: any) => s + c.raised, 0);
  const totalInvestors = campaigns.reduce((s: number, c: any) => s + c.investors, 0);
  
  const featuredCampaign = filtered.length > 0 ? filtered[0] : null;
  const regularCampaigns = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <div className="relative min-h-screen" >

      {/* Hero Section */}
<section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 text-center overflow-hidden flex flex-col items-center justify-center min-h-[90svh] sm:min-h-[85svh]">
  <BlockchainBackground />

  <div className="relative max-w-5xl mx-auto w-full z-10 flex flex-col items-center">
    {/* Badge */}
    <div className="animate-fade-up inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-emerald-400 text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8 tracking-widest uppercase">
      <span className="w-2 h-2 bg-emerald-500 rounded-full pulse-dot shrink-0" />
      Decentralized Funding
    </div>

    {/* Headline */}
    <h1 className="animate-fade-up-delay-1 text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-4 sm:mb-6 px-2">
      Fund the Future.{" "}
      <br className="hidden sm:block" />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
        Trust the Code.
      </span>
    </h1>

    {/* Subheadline */}
    <p className="animate-fade-up-delay-2 text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-medium px-4 sm:px-0">
      LaunchVault locks startup funds in smart contracts and releases them only when investors approve milestones.{" "}
      <span className="hidden sm:inline">Transparent, secure, unstoppable.</span>
    </p>

    {/* CTA Buttons */}
    <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0">
      <Link
        to="/create"
        className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/25 active:scale-95 text-sm sm:text-base"
      >
        Start Launching
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
      <a
        href="#explore"
        className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 active:scale-95 text-sm sm:text-base"
      >
        Explore Projects
      </a>
    </div>

    {/* Mobile trust line */}
    <p className="sm:hidden text-xs text-slate-600 mt-6 font-medium">
      Transparent · Secure · Unstoppable
    </p>
  </div>

  {/* Scroll indicator — hidden on mobile */}
  <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-up-delay-4 flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
      Scroll to explore
    </span>
    <div className="w-0.5 h-8 bg-gradient-to-b from-slate-400 to-transparent rounded-full" />
  </div>
</section>

{/* Stats */}
<section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24 relative z-20">
  <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-6">
    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-5 animate-fade-up-delay-1 text-center sm:text-left">
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
        <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3.5 rounded-xl">
          <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
        </div>
      </div>
      <div>
        <div className="text-lg sm:text-3xl font-black text-white tracking-tight">
          {totalRaised} ETH
        </div>
        <div className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
          Total Volume
        </div>
      </div>
    </div>

    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-5 animate-fade-up-delay-2 text-center sm:text-left">
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
        <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3.5 rounded-xl">
          <Users className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
        </div>
      </div>
      <div>
        <div className="text-lg sm:text-3xl font-black text-white tracking-tight">
          {totalInvestors}
        </div>
        <div className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
          Global Backers
        </div>
      </div>
    </div>

    <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-5 animate-fade-up-delay-3 text-center sm:text-left">
      <div className="relative shrink-0">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
        <div className="relative bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3.5 rounded-xl">
          <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
        </div>
      </div>
      <div>
        <div className="text-lg sm:text-3xl font-black text-white tracking-tight">
          {campaigns.length}
        </div>
        <div className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
          Live Campaigns
        </div>
      </div>
    </div>
  </div>
</section>
      <HowItWorks />    
      <FeatureCards />  

      {/* Campaigns Explorer */}
      {/* Explore Section */}
<section id="explore" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">

  {/* Section Header */}
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Discover Projects</h2>
        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-full">
          {filtered.length} live
        </span>
      </div>
      <p className="text-slate-400 font-medium">Find and back the next big thing in Web3.</p>
    </div>

    {/* Search */}
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        placeholder="Search campaigns..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-72 bg-slate-900/50 border border-slate-800 text-white placeholder-slate-500 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
      />
    </div>
  </div>

  {/* Category Tabs */}
  <div className="relative mb-10">
    <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`shrink-0 relative text-xs font-black px-5 py-2.5 rounded-full transition-all duration-300 uppercase tracking-widest ${
            activeCategory === cat
              ? "text-slate-950"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {activeCategory === cat && (
            <span className="absolute inset-0 bg-emerald-400 rounded-full" />
          )}
          <span className="relative z-10">{cat}</span>
        </button>
      ))}
    </div>
    {/* Bottom border line */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-800" />
  </div>

  {filtered.length > 0 ? (
    <div className="space-y-6">

      {/* Featured Campaign */}
      {featuredCampaign && (
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
              <span className="text-emerald-400 font-black tracking-widest uppercase text-xs">
                Featured
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
          </div>

          {/* Featured Card — redesigned */}
          <Link to={`/campaign/${featuredCampaign.id}`}>
            <div className="glass-card rounded-3xl overflow-hidden group relative border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />

              <div className="p-8 flex flex-col lg:flex-row gap-8">
                {/* Left — main info */}
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot" />
                      {statusConfig[featuredCampaign.status]?.label || "Live"}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      {featuredCampaign.category}
                    </span>
                    <span className="text-xs text-slate-600 font-mono">
                      by {featuredCampaign.founder}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors leading-tight">
                      {featuredCampaign.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed line-clamp-2">
                      {featuredCampaign.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-white text-2xl font-black">
                        {featuredCampaign.raised}
                        <span className="text-slate-500 text-base font-normal ml-1">
                          / {featuredCampaign.goal} ETH
                        </span>
                      </span>
                      <span className="text-emerald-400 font-black">
                        {Math.round((featuredCampaign.raised / featuredCampaign.goal) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative"
                        style={{ width: `${Math.min((featuredCampaign.raised / featuredCampaign.goal) * 100, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — stats panel */}
                <div className="lg:w-56 flex lg:flex-col justify-between gap-4 lg:gap-0 lg:justify-start lg:space-y-4 shrink-0">
                  <div className="glass-card rounded-2xl p-4 text-center flex-1 lg:flex-none">
                    <div className="text-2xl font-black text-white">{featuredCampaign.investors}</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Backers</div>
                  </div>
                  <div className="glass-card rounded-2xl p-4 text-center flex-1 lg:flex-none">
                    <div className="text-2xl font-black text-white">
                      {Math.max(0, Math.ceil((new Date(featuredCampaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)))}d
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Remaining</div>
                  </div>
                  <div className="glass-card rounded-2xl p-4 text-center flex-1 lg:flex-none">
                    <div className="text-2xl font-black text-emerald-400 font-mono">{featuredCampaign.tokens}</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Token</div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Rest of campaigns — masonry style */}
      {regularCampaigns.length > 0 && (
        <div className="animate-fade-up-delay-1">
          {/* First two — wider cards side by side */}
          {regularCampaigns.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              {regularCampaigns.slice(0, 2).map((c) => {
                const progress = Math.min((c.raised / c.goal) * 100, 100);
                const status = statusConfig[c.status] || statusConfig.active;
                const borderAccent = {
                  active: "border-l-emerald-500",
                  voting: "border-l-amber-500",
                  funded: "border-l-blue-500",
                  released: "border-l-slate-500",
                }[c.status] || "border-l-emerald-500";

                return (
                  <Link key={c.id} to={`/campaign/${c.id}`}>
                    <div className={`glass-card rounded-2xl p-6 h-full group relative overflow-hidden border-l-2 ${borderAccent} hover:scale-[1.02] transition-all duration-300`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-slate-500">{c.category}</span>
                      </div>

                      <h3 className="text-white font-black text-xl mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-5">
                        {c.description}
                      </p>

                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-white font-bold text-sm">
                            {c.raised} <span className="text-slate-500 font-normal">/ {c.goal} ETH</span>
                          </span>
                          <span className="text-emerald-400 text-xs font-black">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {c.investors} backers
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                          <Zap className="w-3.5 h-3.5" />
                          {c.tokens}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Rest — 3 col grid */}
          {regularCampaigns.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularCampaigns.slice(2).map((c) => {
                const progress = Math.min((c.raised / c.goal) * 100, 100);
                const status = statusConfig[c.status] || statusConfig.active;
                const borderAccent = {
                  active: "border-l-emerald-500",
                  voting: "border-l-amber-500",
                  funded: "border-l-blue-500",
                  released: "border-l-slate-500",
                }[c.status] || "border-l-emerald-500";

                return (
                  <Link key={c.id} to={`/campaign/${c.id}`}>
                    <div className={`glass-card rounded-2xl p-5 h-full group relative overflow-hidden border-l-2 ${borderAccent} hover:scale-[1.02] transition-all duration-300`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-slate-500">{c.category}</span>
                      </div>

                      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                        {c.description}
                      </p>

                      <div>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-white font-bold text-xs">
                            {c.raised} <span className="text-slate-500 font-normal">/ {c.goal} ETH</span>
                          </span>
                          <span className="text-emerald-400 text-xs font-black">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-800/50 rounded-full h-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {c.investors}
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                          <Zap className="w-3 h-3" />
                          {c.tokens}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div className="glass-card rounded-3xl py-32 text-center">
      <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6">
        <div className="absolute inset-0 bg-slate-700/50 rounded-full animate-ping opacity-20" />
        <Search className="w-9 h-9 text-slate-500" />
      </div>
      <h3 className="text-2xl font-black text-white mb-2">No projects found</h3>
      <p className="text-slate-400 text-sm max-w-sm mx-auto">
        Try a different search term or category filter.
      </p>
    </div>
  )}
</section>

      {/* Footer CTA */}
      <section className="border-t border-slate-800/50 bg-slate-900/20 pt-24 pb-32 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-6 shadow-xl shadow-emerald-500/5 border border-emerald-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
            Ready to Build?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Create your campaign in minutes, define your milestones, and let the community fund your vision trustlessly.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-200 font-bold px-8 py-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            Start Your Campaign
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}