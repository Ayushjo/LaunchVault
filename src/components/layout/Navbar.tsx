import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import {
  ArrowUpRight, Menu, X, AlertTriangle,
  ChevronDown, LayoutDashboard, LogOut,
} from "lucide-react";
import { useState, type JSX } from "react";

const navLinks = [
  { label: "Explore", path: "/explore" },
  { label: "Dashboard", path: "/dashboard" },
];

const SUPPORTED_NETWORKS = ["Polygon", "Mumbai", "LaunchVault Testnet", "Localhost"];

// LaunchVault logomark SVG
function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="white" fillOpacity="0.07"/>
      <rect x="0.5" y="0.5" width="27" height="27" rx="6.5" stroke="white" strokeOpacity="0.12"/>
      {/* Vault door ring */}
      <circle cx="14" cy="14" r="7" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
      {/* Center dot */}
      <circle cx="14" cy="14" r="2.5" fill="white" fillOpacity="0.9"/>
      {/* Spokes */}
      <line x1="14" y1="7" x2="14" y2="9.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="14" y1="18.5" x2="14" y2="21" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7" y1="14" x2="9.5" y2="14" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="18.5" y1="14" x2="21" y2="14" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function Navbar(): JSX.Element {
  const {
    wallet, connecting, connectWallet, disconnectWallet,
    shortAddress, network, switchToTenderly, switchToLocalhost,
  } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isWrongNetwork = network ? !SUPPORTED_NETWORKS.includes(network) : false;

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Blur + border line */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "rgba(8,8,8,0.75)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        />

        <div className="relative flex items-center justify-between px-6 lg:px-10 h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <Logo />
            <span className="font-heading italic text-[17px] text-white tracking-tight">
              LaunchVault
            </span>
          </Link>

          {/* Center nav (desktop) */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-body font-medium transition-all duration-150 ${
                  isActive(link.path)
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {isWrongNetwork && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={switchToLocalhost}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body text-amber-300 border border-amber-400/20 bg-amber-400/5 hover:bg-amber-400/10 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Localhost
                </button>
                <button
                  onClick={switchToTenderly}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body text-white/40 border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Testnet
                </button>
              </div>
            )}

            <Link to="/create">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-body font-medium text-white border border-white/12 bg-white/6 hover:bg-white/10 transition-colors">
                Launch
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>

            {wallet ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((p) => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/4 hover:bg-white/8 transition-colors"
                >
                  <span className="dot-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 text-emerald-400" />
                  <span className="text-[12px] font-mono text-white/70">{shortAddress}</span>
                  <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)] border border-white/8"
                    style={{ background: "rgba(14,14,16,0.96)", backdropFilter: "blur(24px)" }}>
                    <div className="p-4 border-b border-white/6">
                      <p className="text-[10px] text-white/30 font-body uppercase tracking-[0.15em] mb-2">Connected wallet</p>
                      <p className="text-white/75 font-mono text-[11px] break-all leading-relaxed">{wallet}</p>
                      {network && (
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[11px] text-white/40 font-body">
                            {network === "LaunchVault Testnet" ? "Chain 9991 · Tenderly" : network}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <Link to="/dashboard" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-all font-body">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { disconnectWallet(); setShowDropdown(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all font-body">
                        <LogOut className="w-3.5 h-3.5" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="px-4 py-1.5 rounded-full text-[13px] font-body font-medium text-white bg-white/8 border border-white/12 hover:bg-white/12 transition-colors disabled:opacity-40"
              >
                {connecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/6"
            style={{ background: "rgba(8,8,8,0.98)", backdropFilter: "blur(20px)" }}>
            <div className="p-3 space-y-0.5">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-[13px] font-body transition-all ${
                    isActive(link.path) ? "bg-white/8 text-white font-medium" : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}>
                  {link.label}
                </Link>
              ))}
              <Link to="/create" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-body text-white/50 hover:text-white hover:bg-white/5 transition-all">
                Launch Campaign
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-3 border-t border-white/6">
              {wallet ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/4">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-white/60 font-mono text-[12px] truncate">{shortAddress}</span>
                  </div>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] text-white/50 hover:text-white hover:bg-white/5 transition-all font-body">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <button onClick={() => { disconnectWallet(); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[13px] text-red-400/80 hover:bg-red-500/8 transition-all font-body">
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={connectWallet}
                  className="w-full py-3 rounded-xl text-[13px] font-body font-medium text-white bg-white/8 hover:bg-white/12 transition-colors">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown backdrop */}
      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
    </>
  );
}
