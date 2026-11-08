/* eslint-disable no-bitwise */
import * as eva from '@eva-design/eva';
import { Vivero } from '../../domain/entities';

/**
 * Tema de UI Kitten construido a partir de los colores del vivero (marca blanca).
 * Si todavía no cargó el perfil del vivero, usa un verde por defecto.
 */
const aclarar = (hex: string, factor: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const canal = (c: number) => Math.round(c + (255 - c) * factor).toString(16).padStart(2, '0');
  return `#${canal((n >> 16) & 255)}${canal((n >> 8) & 255)}${canal(n & 255)}`;
};
const oscurecer = (hex: string, factor: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const canal = (c: number) => Math.round(c * (1 - factor)).toString(16).padStart(2, '0');
  return `#${canal((n >> 16) & 255)}${canal((n >> 8) & 255)}${canal(n & 255)}`;
};

export const temaDesdeVivero = (vivero: Vivero | null) => {
  const primario = vivero?.marca.colorPrimario ?? '#2E7D32';
  return {
    ...eva.light,
    'color-primary-100': aclarar(primario, 0.85),
    'color-primary-200': aclarar(primario, 0.7),
    'color-primary-300': aclarar(primario, 0.5),
    'color-primary-400': aclarar(primario, 0.25),
    'color-primary-500': primario,
    'color-primary-600': oscurecer(primario, 0.12),
    'color-primary-700': oscurecer(primario, 0.25),
    'color-primary-800': oscurecer(primario, 0.4),
    'color-primary-900': oscurecer(primario, 0.55),
    'background-basic-color-1': '#FFFFFF',
    'background-basic-color-2': '#F6F7F4',
    'background-basic-color-3': '#ECEFE8',
  };
};

export const colores = {
  fondo: '#F6F7F4',
  texto: '#2B2B2B',
  textoSuave: '#6B6B6B',
  borde: '#E3E6DF',
  exito: '#2E7D32',
  alerta: '#F9A825',
  error: '#C62828',
};

export const dinero = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
