/**
 * Componente ItemModal - Formulario para agregar/editar items
 * Modal estilo glass con todos los campos del producto
 */

import { useState, useEffect } from "react";
import { Item, Priority, Status, Category, CATEGORIES, PRIORITIES, STATUSES } from "@/lib/types";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  defaultCategory?: Category;
  onSave: (data: Omit<Item, "id" | "created_at">) => void;
}

/**
 * Estado inicial del formulario
 */
const initialFormData = {
  name: "",
  priority: "deseable" as Priority,
  category: "general" as Category,
  status: "pendiente" as Status,
  budget: 0,
  link: "",
  notes: "",
  imagen: "",
};

export function ItemModal({ isOpen, onClose, item, defaultCategory, onSave }: ItemModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  // Actualizar formData cuando cambian las props
  useEffect(() => {
    if (!isOpen) return;
    
    if (item) {
      setFormData({
        name: item.name,
        priority: item.priority,
        category: item.category,
        status: item.status,
        budget: item.budget,
        link: item.link || "",
        notes: item.notes || "",
        imagen: item.imagen || "",
      });
    } else {
      setFormData({
        ...initialFormData,
        category: defaultCategory || "general",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, item?.id]);

  // Manejar subida de imagen
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagen: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Guardar item
  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave({
      ...formData,
      name: formData.name.trim(),
      status: "pendiente", // Siempre pendiente al crear
    });
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!item;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl md:max-h-[90vh] overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Gradiente decorativo */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 30% 0%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 100%, rgba(168,85,247,0.2) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/10">
          <h2 className="text-xl md:text-2xl font-bold text-white uppercase">
            {isEditing ? "Editar Item" : "Nuevo Item"}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
              Nombre del producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="EJ: SOFÁ GRIS 3 PLAZAS"
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-base uppercase"
              autoFocus
            />
          </div>

          {/* Prioridad y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
                Prioridad
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setFormData({ ...formData, priority: p.value })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      formData.priority === p.value
                        ? `${p.bg} ${p.color} ${p.border}`
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {p.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px'
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estado (solo al editar) */}
          {isEditing && (
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
                Estado
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setFormData({ ...formData, status: s.value })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      formData.status === s.value
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {s.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Presupuesto y Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
                Presupuesto (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  value={formData.budget || ""}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-white/20 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
                Link del producto
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="HTTPS://..."
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
              Imagen
            </label>
            <label className="flex flex-col items-center justify-center gap-3 bg-slate-800 border-2 border-dashed border-white/20 rounded-2xl px-6 py-8 cursor-pointer hover:bg-slate-700 hover:border-white/30 transition-all duration-200">
              {formData.imagen ? (
                <div className="relative w-full flex flex-col items-center">
                  <img src={formData.imagen} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                  <span className="mt-3 text-sm text-slate-400">Click para cambiar</span>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400 font-medium">Subir imagen</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
            {formData.imagen && (
              <button
                onClick={() => setFormData({ ...formData, imagen: "" })}
                className="mt-3 text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Eliminar imagen
              </button>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre el producto..."
              rows={3}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 text-lg uppercase tracking-wider"
            >
              {isEditing ? "Guardar cambios" : "Agregar item"}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-2xl transition-all duration-200 uppercase tracking-wider"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
