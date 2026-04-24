import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, ExternalLink } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  txHash?: string;
  duration?: number; // ms, default 5000
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string, txHash?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

// ── Toast item ────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

const BORDER: Record<ToastType, string> = {
  success: "border-emerald-500/20",
  error:   "border-red-500/20",
  warning: "border-amber-500/20",
  info:    "border-blue-500/20",
};

const BAR: Record<ToastType, string> = {
  success: "bg-emerald-400",
  error:   "bg-red-400",
  warning: "bg-amber-400",
  info:    "bg-blue-400",
};

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border ${BORDER[t.type]} px-4 py-3.5 flex items-start gap-3 min-w-[320px] max-w-sm overflow-hidden`}
      style={{ background: "rgba(14,14,16,0.95)", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset" }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${BAR[t.type]}`} />
      <div className="mt-0.5 shrink-0">{ICONS[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-body font-medium text-sm leading-snug">{t.title}</p>
        {t.description && (
          <p className="text-white/50 font-body font-light text-xs mt-0.5 leading-relaxed">
            {t.description}
          </p>
        )}
        {t.txHash && (
          <a
            href={`https://dashboard.tenderly.co/tx/${t.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 font-mono text-[10px] mt-1 transition-colors"
          >
            {t.txHash.slice(0, 10)}…
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-white/30 hover:text-white/60 transition-colors shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 5000;
    setToasts((prev) => [...prev, { ...opts, id }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback(
    (title: string, description?: string, txHash?: string) =>
      toast({ type: "success", title, description, txHash }),
    [toast]
  );
  const error = useCallback(
    (title: string, description?: string) =>
      toast({ type: "error", title, description, duration: 7000 }),
    [toast]
  );
  const warning = useCallback(
    (title: string, description?: string) => toast({ type: "warning", title, description }),
    [toast]
  );
  const info = useCallback(
    (title: string, description?: string) => toast({ type: "info", title, description }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast stack — bottom-right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem t={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
