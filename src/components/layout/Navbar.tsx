import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import {
  ArrowUpRight,
  Menu,
  X,
  AlertTriangle,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Zap,
} from "lucide-react";
import { useState, type JSX } from "react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Explore", path: "/explore" },
  { label: "Dashboard", path: "/dashboard" },
];

const SUPPORTED_NETWORKS = ["Polygon", "Mumbai", "LaunchVault Testnet", "Localhost"];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isWrongNetwork = network ? !SUPPORTED_NETWORKS.includes(network) : false;

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 pointer-events-none">
        <nav className="flex items-center justify-between pointer-events-auto">

          {/* ── LEFT: Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="liquid-glass-strong rounded-xl p-2">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading italic text-xl text-white">
              LaunchVault
            </span>
          </Link>

          {/* ── CENTER: Nav pill (desktop) ── */}
          <div className="hidden md:flex items-center">
            <div className="liquid-glass rounded-full px-1.5 py-1 flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/create">
                <button className="ml-1 bg-white text-black rounded-full px-3.5 py-1.5 text-sm font-body font-medium flex items-center gap-1.5 hover:bg-white/90 transition-colors">
                  Get Started
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Wallet area (desktop) ── */}
          <div className="hidden md:flex items-center gap-2">
            {wallet ? (
              <div className="flex items-center gap-2">
                {/* Wrong network warning */}
                {isWrongNetwork && (
                  <button
                    onClick={switchToTenderly}
                    className="liquid-glass rounded-full flex items-center gap-1.5 px-3 py-2 text-xs font-body text-amber-300 hover:opacity-80 transition-opacity"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Switch Network
                  </button>
                )}

                {/* Network indicator + address */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown((p) => !p)}
                    className="liquid-glass rounded-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                    <span className="text-xs font-body text-white/80 font-mono">
                      {shortAddress}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-white/40 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-64 liquid-glass rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-[10px] text-white/40 font-body uppercase tracking-widest mb-2">
                          Connected
                        </p>
                        <p className="text-white/80 font-mono text-xs break-all leading-relaxed">
                          {wallet}
                        </p>
                      </div>
                      {network && (
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                          <span className="text-xs text-white/50 font-body">Network</span>
                          <span className="text-xs text-white/80 font-body font-mono">
                            {network === "LaunchVault Testnet" ? "Chain 9991" : network}
                          </span>
                        </div>
                      )}
                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all font-body"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { disconnectWallet(); setShowDropdown(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all font-body"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect
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
                className="liquid-glass-strong rounded-full px-4 py-2 text-sm font-body font-medium text-white hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {connecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* ── MOBILE TOGGLE ── */}
          <button
            className="md:hidden liquid-glass rounded-xl p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div className="md:hidden mt-3 liquid-glass rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="p-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-body transition-all ${
                    isActive(link.path)
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="p-3 border-t border-white/10">
              {wallet ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/70 font-mono text-xs truncate">{shortAddress}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all font-body"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { disconnectWallet(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all font-body"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full py-3 rounded-xl text-sm font-body font-medium text-white bg-white/10 hover:bg-white/15 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown backdrop */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </>
  );
}
