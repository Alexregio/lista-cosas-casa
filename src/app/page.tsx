"use client";

import { useState } from "react";
import { Item, Category, CATEGORIES } from "@/lib/types";
import { useItems } from "@/hooks/useItems";
import { useToast } from "@/hooks/useToast";
import { Stats } from "@/components/Stats";
import { CategorySection } from "@/components/CategorySection";
import { ItemModal } from "@/components/ItemModal";
import { ImageModal } from "@/components/ImageModal";
import { ToastContainer } from "@/components/Toast";

/**
 * Página principal de la lista para la nueva casa
 * Agrupa todos los componentes y maneja el estado global
 */
export default function Home() {
  // Hooks personalizados
  const { items, loading, error, groupedItems, stats, addItem, updateItem, deleteItem, toggleStatus, clearError } = useItems();
  const { toasts, showToast } = useToast();

  // Estado local
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set());
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<Category>("general");
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  /**
   * Abre el modal para agregar un nuevo item
   * @param category - Categoría preseleccionada
   */
  const openAddModal = (category: Category = "general") => {
    setEditingItem(null);
    setDefaultCategory(category);
    setShowItemModal(true);
  };

  /**
   * Abre el modal para editar un item existente
   */
  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  /**
   * Maneja el guardado del formulario (crear o actualizar)
   */
  const handleSave = async (data: Omit<Item, "id" | "created_at">) => {
    if (editingItem) {
      // Actualizar item existente
      const success = await updateItem(editingItem.id, data);
      if (success) {
        showToast("Item actualizado correctamente");
      }
    } else {
      // Crear nuevo item
      const newItem = await addItem(data);
      if (newItem) {
        showToast("Item agregado correctamente");
        // Expandir la categoría donde se agregó
        setExpandedCategories(prev => new Set([...prev, data.category]));
      }
    }
  };

  /**
   * Maneja la eliminación de un item
   */
  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) {
      showToast("Item eliminado");
    }
  };

  /**
   * Alterna la expansión de una categoría
   */
  const toggleCategory = (category: Category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  // Filtrar solo categorías con items
  const categoriesWithItems = CATEGORIES.filter(cat => 
    groupedItems[cat.value]?.length > 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              🏠 Lista para la nueva casa
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Organiza todo lo que necesitas para tu nuevo hogar
            </p>
          </div>
          <button
            onClick={() => openAddModal()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-5 sm:px-8 py-3 rounded-2xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-2xl p-4 mb-6 text-red-200 flex items-center justify-between backdrop-blur-md">
            <p>{error}</p>
            <button onClick={clearError} className="text-sm underline">Cerrar</button>
          </div>
        )}

        {/* Estadísticas */}
        <Stats stats={stats} />

        {/* Lista de items */}
        <div className="space-y-4">
          {items.length === 0 ? (
            // Estado vacío
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
              <p className="text-slate-400 text-lg mb-6">No hay items todavía</p>
              <button
                onClick={() => openAddModal()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/25"
              >
                Agrega tu primera cosa
              </button>
            </div>
          ) : (
            // Secciones por categoría
            categoriesWithItems.map(category => (
              <CategorySection
                key={category.value}
                categoryValue={category.value}
                items={groupedItems[category.value]}
                isExpanded={expandedCategories.has(category.value)}
                onToggle={() => toggleCategory(category.value)}
                onAddItem={openAddModal}
                onToggleStatus={toggleStatus}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onImageClick={setShowImageModal}
              />
            ))
          )}
        </div>

        {/* Modal de item (agregar/editar) */}
        <ItemModal
          isOpen={showItemModal}
          onClose={() => setShowItemModal(false)}
          item={editingItem}
          defaultCategory={defaultCategory}
          onSave={handleSave}
        />

        {/* Modal de imagen */}
        <ImageModal
          imagen={showImageModal}
          onClose={() => setShowImageModal(null)}
        />

        {/* Toasts */}
        <ToastContainer toasts={toasts} />

        {/* Footer */}
        <footer className="mt-8 text-center text-slate-500 text-sm">
          <p>☁️ Datos guardados en la nube</p>
        </footer>
      </div>
    </div>
  );
}
