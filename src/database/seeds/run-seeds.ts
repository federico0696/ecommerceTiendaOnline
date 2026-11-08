/**
 * Seed de DEMO: crea un vivero de ejemplo con admin, empleado, categorías, productos y un cliente.
 * Uso: npm run seed
 * Pensado para mostrar el sistema a un vivero con datos reales de muestra.
 */
import 'reflect-metadata';
import { config as cargarEnv } from 'dotenv';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/typeorm.datasource';
import { Rol } from '../../common/enums';
import { Vivero, CONFIGURACION_VIVERO_DEFAULT } from '../../modules/viveros/entities/vivero.entity';
import { Usuario } from '../../modules/usuarios/entities/usuario.entity';
import { Cliente } from '../../modules/clientes/entities/cliente.entity';
import { Categoria } from '../../modules/catalogo/entities/categoria.entity';
import {
  FICHA_CUIDADO_VACIA,
  Producto,
  TipoProducto,
} from '../../modules/catalogo/entities/producto.entity';

cargarEnv();

async function main() {
  await dataSource.initialize();
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
  const viveros = dataSource.getRepository(Vivero);
  const usuarios = dataSource.getRepository(Usuario);
  const clientes = dataSource.getRepository(Cliente);
  const categorias = dataSource.getRepository(Categoria);
  const productos = dataSource.getRepository(Producto);

  let vivero = await viveros.findOne({ where: { slug: 'demo' } });
  if (!vivero) {
    vivero = await viveros.save(
      viveros.create({
        nombre: 'Vivero Demo',
        slug: 'demo',
        email: 'hola@viverodemo.local',
        telefono: '+54 11 5555-0000',
        direccion: 'Av. Siempreverde 742',
        ciudad: 'Buenos Aires',
        provincia: 'Buenos Aires',
        configuracion: {
          ...CONFIGURACION_VIVERO_DEFAULT,
          ia: { ...CONFIGURACION_VIVERO_DEFAULT.ia, nombreBot: 'Flora' },
        },
      }),
    );
    console.log('✔ Vivero demo creado');
  }

  const altaUsuario = async (email: string, nombre: string, rol: Rol) => {
    if (await usuarios.findOne({ where: { email } })) return;
    await usuarios.save(
      usuarios.create({
        email,
        nombre,
        rol,
        viveroId: vivero!.id,
        passwordHash: await bcrypt.hash('Demo1234!', rounds),
      }),
    );
    console.log(`✔ Usuario ${rol}: ${email} / Demo1234!`);
  };
  await altaUsuario('admin@demo.local', 'Ana Admin', Rol.ADMIN);
  await altaUsuario('empleado@demo.local', 'Emilio Empleado', Rol.EMPLEADO);

  const altaCategoria = async (nombre: string, slug: string, orden: number) => {
    const existe = await categorias.findOne({ where: { viveroId: vivero!.id, slug } });
    return (
      existe ?? categorias.save(categorias.create({ viveroId: vivero!.id, nombre, slug, orden }))
    );
  };
  const interior = await altaCategoria('Plantas de interior', 'interior', 1);
  const exterior = await altaCategoria('Plantas de exterior', 'exterior', 2);
  const suculentas = await altaCategoria('Suculentas y cactus', 'suculentas', 3);
  const macetas = await altaCategoria('Macetas', 'macetas', 4);
  const sustratos = await altaCategoria('Tierra y sustratos', 'sustratos', 5);

  const lista: Array<Partial<Producto> & { categoriaId: string }> = [
    {
      nombre: 'Monstera deliciosa',
      nombreCientifico: 'Monstera deliciosa',
      tipo: TipoProducto.PLANTA,
      categoriaId: interior.id,
      precio: 18500,
      stock: 12,
      etiquetas: ['tropical', 'hojas grandes', 'purifica aire'],
      descripcion: 'La clásica costilla de Adán. Crece rápido y llena cualquier rincón luminoso.',
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'sol-indirecto',
        riego: 'medio',
        riegoDetalle: 'Cuando los primeros 3 cm de tierra estén secos',
        ubicacion: 'interior',
        dificultad: 'facil',
        toxicaMascotas: true,
        consejos: 'Limpiá las hojas con un paño húmedo una vez al mes.',
      },
    },
    {
      nombre: 'Potus',
      nombreCientifico: 'Epipremnum aureum',
      tipo: TipoProducto.PLANTA,
      categoriaId: interior.id,
      precio: 6500,
      stock: 30,
      etiquetas: ['colgante', 'resistente', 'poca luz'],
      descripcion: 'Imposible de matar. Ideal para empezar.',
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'media-sombra',
        riego: 'bajo',
        ubicacion: 'interior',
        dificultad: 'facil',
        toxicaMascotas: true,
      },
    },
    {
      nombre: 'Sansevieria',
      nombreCientifico: 'Dracaena trifasciata',
      tipo: TipoProducto.PLANTA,
      categoriaId: interior.id,
      precio: 9800,
      stock: 15,
      etiquetas: ['resistente', 'poca luz', 'purifica aire'],
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'media-sombra',
        riego: 'bajo',
        riegoDetalle: 'Cada 2 o 3 semanas',
        ubicacion: 'ambos',
        dificultad: 'facil',
        toxicaMascotas: true,
      },
    },
    {
      nombre: 'Lavanda',
      nombreCientifico: 'Lavandula angustifolia',
      tipo: TipoProducto.PLANTA,
      categoriaId: exterior.id,
      precio: 5200,
      stock: 25,
      etiquetas: ['aromática', 'florece', 'atrae abejas'],
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'pleno-sol',
        riego: 'bajo',
        ubicacion: 'exterior',
        dificultad: 'facil',
        toxicaMascotas: false,
        floracion: 'Primavera y verano',
      },
    },
    {
      nombre: 'Rosal mini',
      tipo: TipoProducto.FLOR,
      categoriaId: exterior.id,
      precio: 7900,
      stock: 8,
      etiquetas: ['florece', 'regalo'],
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'pleno-sol',
        riego: 'medio',
        ubicacion: 'exterior',
        dificultad: 'media',
        toxicaMascotas: false,
        floracion: 'Primavera a otoño',
      },
    },
    {
      nombre: 'Echeveria',
      nombreCientifico: 'Echeveria elegans',
      tipo: TipoProducto.PLANTA,
      categoriaId: suculentas.id,
      precio: 3200,
      stock: 40,
      etiquetas: ['suculenta', 'pequeña', 'regalo'],
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'pleno-sol',
        riego: 'bajo',
        riegoDetalle: 'Cada 15 días en verano, casi nada en invierno',
        ubicacion: 'ambos',
        dificultad: 'facil',
        toxicaMascotas: false,
      },
    },
    {
      nombre: 'Cactus San Pedro 30 cm',
      tipo: TipoProducto.PLANTA,
      categoriaId: suculentas.id,
      precio: 8700,
      stock: 6,
      etiquetas: ['cactus', 'columnar'],
      cuidados: {
        ...FICHA_CUIDADO_VACIA,
        luz: 'pleno-sol',
        riego: 'bajo',
        ubicacion: 'exterior',
        dificultad: 'facil',
        toxicaMascotas: false,
      },
    },
    {
      nombre: 'Maceta de barro N°14',
      tipo: TipoProducto.MACETA,
      categoriaId: macetas.id,
      precio: 2900,
      stock: 50,
      etiquetas: ['barro', 'clásica'],
    },
    {
      nombre: 'Maceta colgante de fibra',
      tipo: TipoProducto.MACETA,
      categoriaId: macetas.id,
      precio: 4600,
      stock: 20,
      etiquetas: ['colgante'],
    },
    {
      nombre: 'Sustrato universal 10 L',
      tipo: TipoProducto.SUSTRATO,
      categoriaId: sustratos.id,
      precio: 3800,
      stock: 35,
      etiquetas: ['tierra'],
    },
    {
      nombre: 'Sustrato para cactus 5 L',
      tipo: TipoProducto.SUSTRATO,
      categoriaId: sustratos.id,
      precio: 3100,
      stock: 18,
      etiquetas: ['cactus', 'drenaje'],
    },
  ];
  for (const p of lista) {
    const slug = p
      .nombre!.normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (await productos.findOne({ where: { viveroId: vivero.id, slug } })) continue;
    await productos.save(
      productos.create({
        ...p,
        slug,
        viveroId: vivero.id,
        cuidados: p.cuidados ?? FICHA_CUIDADO_VACIA,
        destacado: ['monstera-deliciosa', 'lavanda', 'echeveria'].includes(slug),
      }),
    );
  }
  console.log(`✔ ${lista.length} productos verificados`);

  if (!(await clientes.findOne({ where: { viveroId: vivero.id, email: 'cliente@demo.local' } }))) {
    await clientes.save(
      clientes.create({
        viveroId: vivero.id,
        email: 'cliente@demo.local',
        nombre: 'Clara Cliente',
        telefono: '+54 11 6666-0000',
        passwordHash: await bcrypt.hash('Demo1234!', rounds),
        perfilJardin: {
          luz: 'media-sombra',
          espacio: 'balcón',
          mascotas: true,
          experiencia: 'principiante',
        },
      }),
    );
    console.log('✔ Cliente: cliente@demo.local / Demo1234! (vivero: demo)');
  }

  await dataSource.destroy();
  console.log('Listo.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
