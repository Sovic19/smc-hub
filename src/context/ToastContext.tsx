"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, options?: { description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof CheckCircle2; classes: string; iconClasses: string }> = {
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-200 bg-white",
    iconClasses: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    classes: "border-red-200 bg-white",
    iconClasses: "text-red-500",
  },
  info: {
    icon: Info,
    classes: "border-brand-200 bg-white",
    iconClasses: "text-brand-500",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback<ToastContextValue["showToast"]>((message, options) => {
    const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const toast: Toast = {
      id,
      message,
      description: options?.description,
      variant: options?.variant ?? "success",
    };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg",
                style.classes
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", style.iconClasses)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{toast.message}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
