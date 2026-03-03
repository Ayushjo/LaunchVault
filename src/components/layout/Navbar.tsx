import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { Zap, Menu, X, Wifi, AlertTriangle } from "lucide-react";
import { useState, type JSX } from "react";

interface NavLink {
  label: string;
  path: string;
}

const navLinks: NavLink[] = [
  { label: "Explore",         path: "/"          },
  { label: "Create Campaign", path: "/create"    },
  { label: "Dashboard",       path: "/dashboard" },
];

const networkColors: Record<string, string> = {
  Ethereum:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Polygon:   "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Mumbai:    "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Sepolia:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Localhost: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function Navbar(): JSX.Element {
  const { wallet, connecting, connectWallet, disconnectWallet, shortAddress, network } = useWallet();
  const [menuOpen, setMenuOpen]       = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;
  const networkStyle: string = network
    ? networkColors[network] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20"
    : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">
              Launch<span className="text-emerald-400">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link: NavLink) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Area */}
          <div className="hidden md:flex items-center gap-3">
            {wallet ? (
              <div className="flex items-center gap-2">
                {network && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${networkStyle}`}>
                    <Wifi className="w-3 h-3" />
                    {network}
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown((p) => !p)}
                    className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-slate-300 text-sm font-mono font-semibold">{shortAddress}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-12 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-800">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Connected Wallet</p>
                        <p className="text-white font-mono text-sm font-bold break-all">{wallet}</p>
                      </div>

                      {network && (
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Network</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${networkStyle}`}>
                            {network}
                          </span>
                        </div>
                      )}

                      {network && network !== "Polygon" && network !== "Mumbai" && (
                        <div className="px-4 py-3 border-b border-slate-800 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-400 leading-relaxed">
                            Switch to Polygon or Mumbai testnet for full functionality.
                          </p>
                        </div>
                      )}

                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                        >
                          My Dashboard
                        </Link>
                        <button
                          onClick={() => { disconnectWallet(); setShowDropdown(false); }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
                        >
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
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-white/5 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link: NavLink) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive(link.path)
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-white/5 mt-1">
            {wallet ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-slate-300 text-sm font-mono">{shortAddress}</span>
                  {network && (
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${networkStyle}`}>
                      {network}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { disconnectWallet(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}

      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </nav>
  );
}