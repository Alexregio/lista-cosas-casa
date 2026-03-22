/**
 * Componente Toast - Notificaciones emergentes
 * Muestra mensajes de éxito/error en la esquina inferior derecha
 */

import { Toast as ToastType } from "@/lib/types";

interface ToastContainerProps {
  toasts: ToastType[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
            toast.type === "success" 
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" 
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
