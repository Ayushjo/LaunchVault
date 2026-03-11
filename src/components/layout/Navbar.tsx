import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import {
  Zap,
  Menu,
  X,
  AlertTriangle,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useState, type JSX } from "react";

interface NavLink {
  label: string;
  path: string;
}

const navLinks: NavLink[] = [
  { label: "Explore", path: "/" },
  { label: "Create Campaign", path: "/create" },
  { label: "Dashboard", path: "/dashboard" },
];

const networkColors: Record<string, string> = {
  Ethereum: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Polygon: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Mumbai: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Sepolia: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Localhost: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  "LaunchVault Testnet":
    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const networkDots: Record<string, string> = {
  Ethereum: "bg-blue-400",
  Polygon: "bg-violet-400",
  Mumbai: "bg-violet-400",
  Sepolia: "bg-amber-400",
  Localhost: "bg-zinc-400",
  "LaunchVault Testnet": "bg-emerald-400",
};

const SUPPORTED_NETWORKS = [
  "Polygon",
  "Mumbai",
  "LaunchVault Testnet",
  "Localhost",
];

export default function Navbar(): JSX.Element {
  const {
    wallet,
    connecting,
    connectWallet,
    disconnectWallet,
    shortAddress,
    network,
    switchToTenderly,
  } = useWallet();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;
  const networkStyle: string = network
    ? (networkColors[network] ??
      "text-zinc-400 bg-zinc-500/10 border-zinc-500/20")
    : "";
  const networkDot: string = network
    ? (networkDots[network] ?? "bg-zinc-400")
    : "bg-zinc-400";
  const isWrongNetwork = network
    ? !SUPPORTED_NETWORKS.includes(network)
    : false;

  return (
    <>
      {/* ── FLOATING PILL ───────────────────────────────────────────────── */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none">
        <nav className="max-w-5xl mx-auto pointer-events-auto">
          <div className="bg-zinc-950/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] px-3 h-14 flex items-center justify-between gap-4">
            {/* ── LOGO ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/40 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-emerald-600/20 border border-emerald-500/30 p-1.5 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
              <span className="text-white font-bold text-base tracking-tighter">
                Launch<span className="text-emerald-400">Vault</span>
              </span>
            </Link>

            {/* ── DESKTOP NAV LINKS ── */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link: NavLink) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-px bg-emerald-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* ── WALLET AREA ── */}
            <div className="hidden md:flex items-center gap-2">
              {wallet ? (
                <div className="flex items-center gap-2">
                  {/* Network badge — minimal */}
                  {network && (
                    <div className="flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 rounded-lg">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${networkDot} ${network === "LaunchVault Testnet" ? "animate-pulse" : ""}`}
                      />
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest whitespace-nowrap">
                        {network === "LaunchVault Testnet"
                          ? "Chain 9991"
                          : network}
                      </span>
                    </div>
                  )}

                  {/* Wrong network warning inline */}
                  {isWrongNetwork && (
                    <button
                      onClick={switchToTenderly}
                      className="flex items-center gap-1.5 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                        Switch
                      </span>
                    </button>
                  )}

                  {/* Wallet trigger pill */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown((p) => !p)}
                      className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] px-3 py-1.5 rounded-xl transition-all duration-200"
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                      <span className="text-zinc-300 text-xs font-mono font-medium tracking-wide">
                        {shortAddress}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-zinc-950/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden z-50">
                        {/* Address block */}
                        <div className="p-4 border-b border-white/[0.05]">
                          <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-2">
                            Connected Wallet
                          </p>
                          <p className="text-white font-mono text-xs font-medium break-all leading-relaxed">
                            {wallet}
                          </p>
                        </div>

                        {/* Network row */}
                        {network && (
                          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                            <span className="text-[11px] text-zinc-500 font-medium">
                              Network
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${networkDot}`}
                              />
                              <span
                                className={`text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-1 rounded-lg border ${networkStyle}`}
                              >
                                {network}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Wrong network warning */}
                        {isWrongNetwork && (
                          <div className="px-4 py-3 border-b border-white/[0.05]">
                            <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-amber-400 font-medium leading-relaxed mb-2">
                                  Wrong network detected.
                                </p>
                                <button
                                  onClick={() => {
                                    switchToTenderly();
                                    setShowDropdown(false);
                                  }}
                                  className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                  Switch to LaunchVault Testnet →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all duration-150 font-medium group"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                            My Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              disconnectWallet();
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-150 font-medium group"
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-500 group-hover:text-red-400 transition-colors" />
                            Disconnect Wallet
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="flex items-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 hover:ring-emerald-400/80 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-[0_0_16px_rgba(16,185,129,0.12)] hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>

            {/* ── MOBILE TOGGLE ── */}
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-zinc-400 hover:text-white transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* ── MOBILE MENU ── */}
          {menuOpen && (
            <div className="md:hidden mt-2 bg-zinc-950/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
              {/* Nav links */}
              <div className="p-2 space-y-0.5">
                {navLinks.map((link: NavLink) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? "bg-white/[0.06] text-white"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {isActive(link.path) && (
                      <span className="w-1 h-1 bg-emerald-400 rounded-full mr-2.5 shrink-0" />
                    )}
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Wallet section */}
              <div className="p-2 pt-0 border-t border-white/[0.05] mt-1">
                <div className="p-2">
                  {wallet ? (
                    <div className="space-y-2">
                      {/* Address + network */}
                      <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] px-3 py-3 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                          <span className="text-zinc-300 text-xs font-mono truncate">
                            {shortAddress}
                          </span>
                        </div>
                        {network && (
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${networkDot}`}
                            />
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                              {network === "LaunchVault Testnet"
                                ? "9991"
                                : network}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Wrong network warning */}
                      {isWrongNetwork && (
                        <button
                          onClick={() => {
                            switchToTenderly();
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 rounded-xl text-xs text-amber-400 font-medium hover:bg-amber-500/10 transition-all"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Wrong network — tap to switch
                        </button>
                      )}

                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500" />
                        My Dashboard
                      </Link>

                      <button
                        onClick={() => {
                          disconnectWallet();
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/[0.08] transition-all font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Disconnect Wallet
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-900 ring-1 ring-emerald-500/50 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95 shadow-[0_0_16px_rgba(16,185,129,0.1)]"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Dropdown backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Spacer so content doesn't hide under navbar */}
      <div className="h-20" />
    </>
  );
}
