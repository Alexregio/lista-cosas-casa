"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Priority = "necesario" | "importante" | "deseable" | "decoracion";
type Status = "pendiente" | "comprado" | "en espera";
type Category = "cocina" | "bano" | "sala" | "dormitorio" | "jardin" | "oficina" | "garaje" | "general";
type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface Item {
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

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "cocina", label: "Cocina" },
  { value: "bano", label: "Baño" },
  { value: "sala", label: "Sala" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "jardin", label: "Jardín" },
  { value: "oficina", label: "Oficina" },
  { value: "garaje", label: "Garaje" },
  { value: "general", label: "General" },
];

const PRIORITIES: { value: Priority; label: string; color: string; bg: string; border: string }[] = [
  { value: "necesario", label: "Necesario", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/50" },
  { value: "importante", label: "Importante", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/50" },
  { value: "deseable", label: "Deseable", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/50" },
  { value: "decoracion", label: "Decoración", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/50" },
];

const STATUSES: { value: Status; label: string }[] = [
  { value: "pendiente", label: "Por comprar" },
  { value: "comprado", label: "Comprado" },
  { value: "en espera", label: "En espera" },
];

const PRIORITY_ORDER = { necesario: 0, importante: 1, deseable: 2, decoracion: 3 };

function ModalForm({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

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
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 30% 0%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 100%, rgba(168,85,247,0.2) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        
        <div className="relative z-10 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-white/10">
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "todas">("todas");
  const [filterPriority, setFilterPriority] = useState<Priority | "todas">("todas");
  const [filterStatus, setFilterStatus] = useState<Status | "todas">("todas");
  const [sortBy, setSortBy] = useState<"priority" | "name" | "category">("priority");
  const [showFilters, setShowFilters] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    priority: "deseable" as Priority,
    category: "general" as Category,
    status: "pendiente" as Status,
    budget: 0,
    link: "",
    notes: "",
    imagen: "",
  });

  const fetchItems = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      priority: "deseable",
      category: "general",
      status: "pendiente",
      budget: 0,
      link: "",
      notes: "",
      imagen: "",
    });
    setShowItemModal(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
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
    setShowItemModal(true);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imagen: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const saveItem = async () => {
    if (!formData.name.trim()) return;

    if (editingItem) {
      const { error: updateError } = await supabase
        .from("items")
        .update({
          name: formData.name.trim(),
          priority: formData.priority,
          status: formData.status,
          category: formData.category,
          budget: formData.budget,
          link: formData.link,
          notes: formData.notes,
          imagen: formData.imagen,
        })
        .eq("id", editingItem.id);

      if (updateError) {
        setError("Error al actualizar");
        return;
      }

      setItems(items.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
      showToast("Item actualizado correctamente");
    } else {
      const { data, error: insertError } = await supabase
        .from("items")
        .insert({
          name: formData.name.trim(),
          priority: formData.priority,
          status: "pendiente",
          category: formData.category,
          budget: formData.budget,
          link: formData.link,
          notes: formData.notes,
          imagen: formData.imagen,
        })
        .select()
        .single();

      if (insertError) {
        setError("Error al agregar");
        return;
      }

      if (data) {
        setItems([data, ...items]);
        showToast("Item agregado correctamente");
      }
    }

    setShowItemModal(false);
  };

  const deleteItem = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError("Error al eliminar");
      return;
    }

    setItems(items.filter(item => item.id !== id));
    showToast("Item eliminado");
  };

  const toggleStatus = async (item: Item) => {
    const newStatus = item.status === "comprado" ? "pendiente" : "comprado";
    
    await supabase
      .from("items")
      .update({ status: newStatus })
      .eq("id", item.id);

    setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory !== "todas" && item.category !== filterCategory) return false;
        if (filterPriority !== "todas" && item.priority !== filterPriority) return false;
        if (filterStatus !== "todas" && item.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "category") return a.category.localeCompare(b.category);
        return 0;
      });
  }, [items, search, filterCategory, filterPriority, filterStatus, sortBy]);

  const stats = useMemo(() => {
    const total = items.length;
    const purchased = items.filter(i => i.status === "comprado").length;
    const totalBudget = items.reduce((sum, i) => sum + (i.budget || 0), 0);
    const purchasedBudget = items.filter(i => i.status === "comprado").reduce((sum, i) => sum + (i.budget || 0), 0);
    return { total, purchased, totalBudget, purchasedBudget, progress: total ? Math.round((purchased / total) * 100) : 0 };
  }, [items]);

  const getPriorityInfo = (priority: Priority) => PRIORITIES.find(p => p.value === priority)!;

  const formatCurrency = (amount: number) => `$${amount.toLocaleString("es-MX")}`;

  const clearAllFilters = () => {
    setSearch("");
    setFilterCategory("todas");
    setFilterPriority("todas");
    setFilterStatus("todas");
    setSortBy("priority");
  };

  const hasActiveFilters = search || filterCategory !== "todas" || filterPriority !== "todas" || filterStatus !== "todas";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              🏠 Lista para la nueva casa
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">Organiza todo lo que necesitas para tu nuevo hogar</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-5 sm:px-8 py-3 rounded-2xl transition-all duration-300 text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-2xl p-4 mb-6 text-red-200 flex items-center justify-between backdrop-blur-md">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-sm underline">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Total</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Comprados</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.purchased}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Presupuesto</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400">{formatCurrency(stats.totalBudget)}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
            <div className="text-slate-400 text-xs sm:text-sm mb-1">Gastado</div>
            <div className="text-xl sm:text-2xl font-bold text-violet-400">{formatCurrency(stats.purchasedBudget)}</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 mb-4 sm:mb-8 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <span className="text-white font-bold text-sm">{stats.progress}%</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl mb-4 sm:mb-8 border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 text-white"
          >
            <span className="font-semibold">Filtros {hasActiveFilters && "( activos )"}</span>
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFilters && (
            <div className="p-4 pt-0 space-y-3">
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as Category | "todas")}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="todas">Categoría</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as Priority | "todas")}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="todas">Prioridad</option>
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as Status | "todas")}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="todas">Estado</option>
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "priority" | "name" | "category")}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="priority">Por prioridad</option>
                  <option value="name">Por nombre</option>
                  <option value="category">Por categoría</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
              <p className="text-slate-400 text-lg mb-6">
                {items.length === 0 ? "No hay items todavía" : "No hay items que coincidan con los filtros"}
              </p>
              {items.length === 0 && (
                <button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/25"
                >
                  Agrega tu primera cosa
                </button>
              )}
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className={`group bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
                  item.status === "comprado" 
                    ? "border-emerald-500/30 bg-emerald-500/5" 
                    : "border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStatus(item)}
                    className={`mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      item.status === "comprado"
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "border-slate-500/50 hover:border-emerald-500 hover:bg-emerald-500/20"
                    }`}
                  >
                    {item.status === "comprado" && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  {item.imagen && (
                    <button
                      onClick={() => setShowImageModal(item.imagen)}
                      className="flex-shrink-0"
                    >
                      <img 
                        src={item.imagen} 
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                      />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`font-semibold text-base sm:text-lg ${item.status === "comprado" ? "text-slate-500 line-through" : "text-white"}`}>
                        {item.name}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityInfo(item.priority).bg} ${getPriorityInfo(item.priority).color} ${getPriorityInfo(item.priority).border} border`}>
                        {getPriorityInfo(item.priority).label}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                        {CATEGORIES.find(c => c.value === item.category)?.label}
                      </span>
                      {item.budget > 0 && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {formatCurrency(item.budget)}
                        </span>
                      )}
                    </div>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <ModalForm
          isOpen={showItemModal}
          onClose={() => setShowItemModal(false)}
          title={editingItem ? "Editar item" : "Nuevo item"}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">Nombre del producto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Sofá gris 3 plazas"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">Prioridad</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setFormData({ ...formData, priority: p.value })}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        formData.priority === p.value
                          ? `${p.bg} ${p.color} ${p.border}`
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {editingItem && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">Estado</label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFormData({ ...formData, status: s.value })}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        formData.status === s.value
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">Presupuesto (MXN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    type="number"
                    value={formData.budget || ""}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">Link del producto</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">Imagen</label>
              <label className="flex flex-col items-center justify-center gap-3 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl px-6 py-8 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all duration-200">
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

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el producto..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={saveItem}
                disabled={!formData.name.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 text-lg"
              >
                {editingItem ? "Guardar cambios" : "Agregar item"}
              </button>
              <button
                onClick={() => setShowItemModal(false)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-2xl transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </ModalForm>

        {showImageModal && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(null)}
          >
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={showImageModal || ""} 
              alt="Imagen del producto" 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

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

        <footer className="mt-8 text-center text-slate-500 text-sm">
          <p>☁️ Datos guardados en la nube</p>
        </footer>
      </div>
    </div>
  );
}
