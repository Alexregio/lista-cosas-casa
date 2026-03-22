"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Item, Category, CATEGORIES } from "@/lib/types";

/**
 * Hook personalizado para manejar operaciones CRUD de items
 * Encapsula toda la lógica de Supabase
 */
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene todos los items de la base de datos
   */
  const fetchItems = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .order("priority", { ascending: true });

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

  /**
   * Agrega un nuevo item
   */
  const addItem = async (itemData: Omit<Item, "id" | "created_at">) => {
    const { data, error: insertError } = await supabase
      .from("items")
      .insert({
        name: itemData.name,
        priority: itemData.priority,
        status: itemData.status,
        category: itemData.category,
        budget: itemData.budget,
        notes: itemData.notes,
        link: itemData.link,
        imagen: itemData.imagen,
      })
      .select()
      .single();

    if (insertError) {
      setError("Error al agregar");
      return null;
    }

    if (data) {
      setItems(prev => [data, ...prev]);
    }
    return data;
  };

  /**
   * Actualiza un item existente
   */
  const updateItem = async (id: string, updates: Partial<Item>) => {
    const { error: updateError } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      setError("Error al actualizar");
      return false;
    }

    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    return true;
  };

  /**
   * Elimina un item
   */
  const deleteItem = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError("Error al eliminar");
      return false;
    }

    setItems(prev => prev.filter(item => item.id !== id));
    return true;
  };

  /**
   * Alterna el estado de compra de un item
   */
  const toggleStatus = async (item: Item) => {
    const newStatus = item.status === "comprado" ? "pendiente" : "comprado";
    
    await supabase
      .from("items")
      .update({ status: newStatus })
      .eq("id", item.id);

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
  };

  /**
   * Agrupa items por categoría
   */
  const groupedItems = useMemo(() => {
    const groups: Record<Category, Item[]> = {} as Record<Category, Item[]>;
    CATEGORIES.forEach(c => {
      groups[c.value] = [];
    });
    
    items.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups.general.push(item);
      }
    });
    
    return groups;
  }, [items]);

  /**
   * Calcula estadísticas
   */
  const stats = useMemo(() => {
    const total = items.length;
    const purchased = items.filter(i => i.status === "comprado").length;
    const totalBudget = items.reduce((sum, i) => sum + (i.budget || 0), 0);
    const purchasedBudget = items.filter(i => i.status === "comprado").reduce((sum, i) => sum + (i.budget || 0), 0);
    return { 
      total, 
      purchased, 
      totalBudget, 
      purchasedBudget, 
      progress: total ? Math.round((purchased / total) * 100) : 0 
    };
  }, [items]);

  return {
    items,
    loading,
    error,
    groupedItems,
    stats,
    addItem,
    updateItem,
    deleteItem,
    toggleStatus,
    clearError: () => setError(null),
  };
}
