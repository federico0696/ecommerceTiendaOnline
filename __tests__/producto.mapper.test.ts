import { mapearPedido, mapearProducto } from '../src/infrastructure/mappers/producto.mapper';

describe('mapearProducto', () => {
  it('convierte precios a número y elige la imagen principal', () => {
    const p = mapearProducto({
      id: '1',
      nombre: 'Monstera',
      slug: 'monstera',
      nombreCientifico: null,
      tipo: 'planta',
      descripcion: null,
      precio: '18500.00',
      precioOferta: null,
      stock: 3,
      destacado: true,
      etiquetas: ['tropical'],
      cuidados: { luz: 'sol-indirecto', toxicaMascotas: true },
      imagenes: [
        { url: 'b.jpg', principal: false, orden: 1 },
        { url: 'a.jpg', principal: true, orden: 2 },
      ],
      categoria: { nombre: 'Interior' },
    });
    expect(p.precio).toBe(18500);
    expect(p.precioOferta).toBeNull();
    expect(p.imagen).toBe('a.jpg');
    expect(p.imagenes).toEqual(['a.jpg', 'b.jpg']);
    expect(p.cuidados.luz).toBe('sol-indirecto');
    expect(p.cuidados.toxicaMascotas).toBe(true);
    expect(p.cuidados.riego).toBeNull();
    expect(p.categoria).toBe('Interior');
  });

  it('tolera productos sin imágenes ni categoría', () => {
    const p = mapearProducto({
      id: '2', nombre: 'Maceta', slug: 'maceta', nombreCientifico: null, tipo: 'maceta', descripcion: null,
      precio: 100, precioOferta: 80, stock: 0, destacado: false, etiquetas: [], cuidados: {}, imagenes: [],
    });
    expect(p.imagen).toBeNull();
    expect(p.precioOferta).toBe(80);
    expect(p.categoria).toBeNull();
  });
});

describe('mapearPedido', () => {
  it('convierte totales y precios de ítems', () => {
    const p = mapearPedido({
      id: 'p1', numero: 7, estado: 'pendiente', tipoEntrega: 'retiro', total: '37000.00', creadoEn: '2026-01-01T00:00:00Z',
      items: [{ nombreProducto: 'Monstera', cantidad: 2, precioUnitario: '18500.00' }],
    });
    expect(p.total).toBe(37000);
    expect(p.items[0].precioUnitario).toBe(18500);
    expect(p.estado).toBe('pendiente');
  });
});
