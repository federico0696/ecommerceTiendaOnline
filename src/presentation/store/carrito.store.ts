import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ItemCarrito, Producto } from '../../domain/entities';

interface CarritoState {
  items: ItemCarrito[];
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (productoId: string) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

/** Carrito persistido en el dispositivo (no es sensible, va en AsyncStorage). */
export const useCarritoStore = create<CarritoState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (producto, cantidad = 1) =>
        set((s) => {
          const existe = s.items.find((i) => i.producto.id === producto.id);
          if (existe) return { items: s.items.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) } : i)) };
          return { items: [...s.items, { producto, cantidad: Math.min(cantidad, producto.stock) }] };
        }),
      quitar: (productoId) => set((s) => ({ items: s.items.filter((i) => i.producto.id !== productoId) })),
      cambiarCantidad: (productoId, cantidad) =>
        set((s) => ({ items: cantidad <= 0 ? s.items.filter((i) => i.producto.id !== productoId) : s.items.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i)) })),
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + (i.producto.precioOferta ?? i.producto.precio) * i.cantidad, 0),
      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'vivero.carrito', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
