import { useWallet } from "../context/WalletContext";
import { X, Zap, ExternalLink } from "lucide-react";

export default function WalletModal() {
  const { showWalletModal, setShowWalletModal, availableWallets, connectSpecificWallet } = useWallet();

  if (!showWalletModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowWalletModal(false)}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Connect Wallet</h2>
            <p className="text-slate-400 text-xs mt-0.5">Choose your preferred wallet</p>
          </div>
          <button
            onClick={() => setShowWalletModal(false)}
            className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="space-y-2">
          {availableWallets.map((w) => (
            <button
              key={w.name}
              onClick={() => connectSpecificWallet(w)}
              disabled={w.comingSoon}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                w.comingSoon
                  ? "bg-slate-800/30 border-slate-800 cursor-not-allowed opacity-50"
                  : "bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 active:scale-95"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl shrink-0">
                {w.icon}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{w.name}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {w.comingSoon ? "Coming soon" : "Detected • Ready to connect"}
                </div>
              </div>
              {!w.comingSoon && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">New to Web3 wallets?</p>
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          >
            Get MetaMask <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}