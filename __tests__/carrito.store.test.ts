import { Producto } from '../src/domain/entities';
import { useCarritoStore } from '../src/presentation/store/carrito.store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined), removeItem: jest.fn(async () => undefined) },
}));

const producto = (extra: Partial<Producto> = {}): Producto => ({
  id: 'a', nombre: 'Potus', slug: 'potus', nombreCientifico: null, tipo: 'planta', descripcion: null,
  precio: 1000, precioOferta: null, stock: 3, destacado: false, etiquetas: [],
  cuidados: { luz: null, riego: null, riegoDetalle: null, ubicacion: null, dificultad: null, toxicaMascotas: null, consejos: null },
  imagen: null, imagenes: [], categoria: null, ...extra,
});

describe('carrito', () => {
  beforeEach(() => useCarritoStore.getState().vaciar());

  it('suma cantidades del mismo producto sin superar el stock', () => {
    const { agregar } = useCarritoStore.getState();
    agregar(producto(), 2);
    agregar(producto(), 2);
    expect(useCarritoStore.getState().items[0].cantidad).toBe(3);
    expect(useCarritoStore.getState().cantidadTotal()).toBe(3);
  });

  it('usa el precio de oferta en el total y quita al llegar a cero', () => {
    const { agregar, cambiarCantidad } = useCarritoStore.getState();
    agregar(producto({ id: 'b', precio: 1000, precioOferta: 800 }), 2);
    expect(useCarritoStore.getState().total()).toBe(1600);
    cambiarCantidad('b', 0);
    expect(useCarritoStore.getState().items).toHaveLength(0);
  });
});
