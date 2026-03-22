"use client";

import { useState, useCallback } from "react";
import { Toast, ToastType } from "@/lib/types";

/**
 * Hook personalizado para manejar notificaciones toast
 * Proporciona funciones para mostrar/ocultar toasts
 * 
 * @example
 * const { showToast, toasts } = useToast();
 * showToast("Guardado correctamente", "success");
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Muestra un toast con mensaje
   * @param message - Texto a mostrar
   * @param type - Tipo de toast (success/error)
   * @param duration - Milisegundos antes de ocultarlo (default: 3000)
   */
  const showToast = useCallback((message: string, type: ToastType = "success", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, showToast };
}
