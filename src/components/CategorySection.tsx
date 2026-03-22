/**
 * Componente CategorySection - Sección colapsable por categoría
 * Contiene múltiples ItemCards y permite agregar nuevos items
 */

import { Item, Category, CATEGORIES, PRIORITY_ORDER } from "@/lib/types";
import { ItemCard } from "./ItemCard";

interface CategorySectionProps {
  categoryValue: Category;
  items: Item[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddItem: (category: Category) => void;
  onToggleStatus: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onImageClick: (imagen: string) => void;
}

/**
 * Obtiene la config de una categoría por su valor
 */
function getCategoryInfo(value: Category) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
}

export function CategorySection({
  categoryValue,
  items,
  isExpanded,
  onToggle,
  onAddItem,
  onToggleStatus,
  onEdit,
  onDelete,
  onImageClick,
}: CategorySectionProps) {
  const categoryInfo = getCategoryInfo(categoryValue);

  // Ordenar items por prioridad
  const sortedItems = [...items].sort((a, b) => 
    PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header de la sección */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryInfo.icon}</span>
          <span className="text-lg font-semibold text-white uppercase">{categoryInfo.label}</span>
          <span className="bg-white/10 text-slate-300 text-sm px-2.5 py-1 rounded-full">
            {items.length}
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Contenido de la sección */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {sortedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              onImageClick={onImageClick}
            />
          ))}
          
          {/* Botón para agregar */}
          <button
            onClick={() => onAddItem(categoryValue)}
            className="w-full p-3 text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar a {categoryInfo.label}
          </button>
        </div>
      )}
    </div>
  );
}
