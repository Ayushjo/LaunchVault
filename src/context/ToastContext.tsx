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
  success: "border-emerald-500/30",
  error: "border-red-500/30",
  warning: "border-amber-500/30",
  info: "border-blue-500/30",
};

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, filter: "blur(8px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 48, filter: "blur(8px)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`liquid-glass rounded-xl border ${BORDER[t.type]} px-4 py-3 flex items-start gap-3 min-w-[300px] max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
    >
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
