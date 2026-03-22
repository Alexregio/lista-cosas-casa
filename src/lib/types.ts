/**
 * Tipos y constantes compartidos para la aplicación
 * Usados en toda la app para mantener consistencia de tipos
 */

export type Priority = "necesario" | "importante" | "deseable" | "decoracion";
export type Status = "pendiente" | "comprado" | "en espera";
export type Category = "cocina" | "bano" | "sala" | "dormitorio" | "jardin" | "oficina" | "garaje" | "general";
export type ToastType = "success" | "error";

/**
 * Interface principal para cada item de la lista
 */
export interface Item {
  id: string;
  name: string;
  priority: Priority;
  status: Status;
  category: Category;
  budget: number;
  notes: string;
  link: string;
  imagen: string;
  created_at?: string;
}

/**
 * Interface para los toasts de notificación
 */
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

/**
 * Configuración de categorías con íconos
 */
export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "cocina", label: "Cocina", icon: "🍳" },
  { value: "bano", label: "Baño", icon: "🚿" },
  { value: "sala", label: "Sala", icon: "🛋️" },
  { value: "dormitorio", label: "Dormitorio", icon: "🛏️" },
  { value: "jardin", label: "Jardín", icon: "🌳" },
  { value: "oficina", label: "Oficina", icon: "💼" },
  { value: "garaje", label: "Garaje", icon: "🚗" },
  { value: "general", label: "General", icon: "📦" },
];

/**
 * Configuración de prioridades con colores
 */
export const PRIORITIES: { value: Priority; label: string; color: string; bg: string; border: string }[] = [
  { value: "necesario", label: "Necesario", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/50" },
  { value: "importante", label: "Importante", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/50" },
  { value: "deseable", label: "Deseable", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/50" },
  { value: "decoracion", label: "Decoración", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/50" },
];

/**
 * Estados disponibles para los items
 */
export const STATUSES: { value: Status; label: string }[] = [
  { value: "pendiente", label: "Por comprar" },
  { value: "comprado", label: "Comprado" },
  { value: "en espera", label: "En espera" },
];

/**
 * Orden de prioridad para sorting (número menor = más importante)
 */
export const PRIORITY_ORDER: Record<Priority, number> = {
  necesario: 0,
  importante: 1,
  deseable: 2,
  decoracion: 3,
};
