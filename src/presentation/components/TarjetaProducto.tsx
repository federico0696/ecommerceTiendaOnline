import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Producto } from '../../domain/entities';
import { colores, dinero } from '../theme/tema';

interface Props {
  producto: Producto;
  alTocar: () => void;
}

export const TarjetaProducto = ({ producto, alTocar }: Props) => (
  <Pressable onPress={alTocar} style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
    <View style={estilos.imagenWrap}>
      {producto.imagen ? (
        <Image source={{ uri: producto.imagen }} style={estilos.imagen} />
      ) : (
        <Text category="h1" style={estilos.sinImagen}>🌿</Text>
      )}
      {producto.precioOferta != null && <Text category="c2" style={estilos.oferta}>OFERTA</Text>}
    </View>
    <View style={estilos.cuerpo}>
      <Text category="s1" numberOfLines={1}>{producto.nombre}</Text>
      {producto.nombreCientifico ? (
        <Text category="c1" appearance="hint" numberOfLines={1} style={estilos.cientifico}>{producto.nombreCientifico}</Text>
      ) : null}
      <View style={estilos.fila}>
        <Text category="s1" status="primary">{dinero(producto.precioOferta ?? producto.precio)}</Text>
        {producto.precioOferta != null && (
          <Text category="c1" appearance="hint" style={estilos.tachado}>{dinero(producto.precio)}</Text>
        )}
      </View>
      <Text category="c1" style={{ color: producto.stock > 0 ? colores.exito : colores.error }}>
        {producto.stock > 0 ? 'Disponible' : 'Sin stock'}
      </Text>
    </View>
  </Pressable>
);

const estilos = StyleSheet.create({
  tarjeta: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.borde },
  presionada: { opacity: 0.85 },
  imagenWrap: { height: 130, backgroundColor: '#ECEFE8', alignItems: 'center', justifyContent: 'center' },
  imagen: { width: '100%', height: '100%' },
  sinImagen: { opacity: 0.25 },
  oferta: { position: 'absolute', top: 8, left: 8, backgroundColor: colores.alerta, color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  cuerpo: { padding: 10 },
  cientifico: { fontStyle: 'italic' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  tachado: { textDecorationLine: 'line-through' },
});
