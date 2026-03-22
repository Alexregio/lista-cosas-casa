/**
 * Componente ItemCard - Tarjeta individual de cada item
 * Muestra la información del producto con opciones de editar/eliminar
 */

import { Item, PRIORITIES } from "@/lib/types";

interface ItemCardProps {
  item: Item;
  onToggleStatus: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onImageClick: (imagen: string) => void;
}

/**
 * Formatea un número como moneda mexicana
 */
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-MX")}`;
}

/**
 * Obtiene la info de prioridad por su valor
 */
function getPriorityInfo(priority: string) {
  return PRIORITIES.find(p => p.value === priority) || PRIORITIES[2];
}

export function ItemCard({ item, onToggleStatus, onEdit, onDelete, onImageClick }: ItemCardProps) {
  const priorityInfo = getPriorityInfo(item.priority);

  return (
    <div
      className={`p-4 sm:p-5 border-b border-white/5 last:border-b-0 transition-all ${
        item.status === "comprado" 
          ? "bg-emerald-500/5" 
          : "hover:bg-white/5"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox de estado */}
        <button
          onClick={() => onToggleStatus(item)}
          className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            item.status === "comprado"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-500/50 hover:border-emerald-500 hover:bg-emerald-500/20"
          }`}
        >
          {item.status === "comprado" && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        {/* Imagen del producto */}
        {item.imagen && (
          <button
            onClick={() => onImageClick(item.imagen)}
            className="flex-shrink-0"
          >
            <img 
              src={item.imagen} 
              alt={item.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200"
            />
          </button>
        )}
        
        {/* Información del item */}
        <div className="flex-1 min-w-0">
          {/* Tags y nombre */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`font-semibold text-base sm:text-lg uppercase ${
              item.status === "comprado" ? "text-slate-500 line-through" : "text-white"
            }`}>
              {item.name.toUpperCase()}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border} border`}>
              {priorityInfo.label.toUpperCase()}
            </span>
            {item.budget > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {formatCurrency(item.budget)}
              </span>
            )}
          </div>
          
          {/* Link y notas */}
          <div className="flex items-center gap-3 flex-wrap">
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver producto
              </a>
            )}
            {item.notes && (
              <p className="text-slate-400 text-xs sm:text-sm">{item.notes}</p>
            )}
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
