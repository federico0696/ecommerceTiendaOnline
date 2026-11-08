import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Spinner, Text } from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Producto } from '../../../domain/entities';
import { catalogoService } from '../../services/catalogo.service';
import { useCarritoStore } from '../../store/carrito.store';
import { colores, dinero } from '../../theme/tema';
import { CatalogoStackParams } from '../../routes/tipos';

type Props = NativeStackScreenProps<CatalogoStackParams, 'Producto'>;

const ETIQUETAS: Record<string, Record<string, string>> = {
  luz: { sombra: 'Sombra', 'media-sombra': 'Media sombra', 'sol-indirecto': 'Sol indirecto', 'pleno-sol': 'Pleno sol' },
  riego: { bajo: 'Riego bajo', medio: 'Riego medio', alto: 'Riego alto' },
  ubicacion: { interior: 'Interior', exterior: 'Exterior', ambos: 'Interior o exterior' },
  dificultad: { facil: 'Fácil de cuidar', media: 'Cuidado medio', dificil: 'Para expertos' },
};

const Dato = ({ icono, texto }: { icono: string; texto: string }) => (
  <View style={estilos.dato}>
    <Text category="h6">{icono}</Text>
    <Text category="c1" style={estilos.datoTexto}>{texto}</Text>
  </View>
);

export const ProductoScreen = ({ route, navigation }: Props) => {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [agregado, setAgregado] = useState(false);
  const agregar = useCarritoStore((s) => s.agregar);

  useEffect(() => {
    navigation.setOptions({ title: route.params.nombre });
    catalogoService.producto(route.params.slug).then(setProducto).catch(() => undefined);
  }, [route.params, navigation]);

  if (!producto) return <View style={estilos.centro}><Spinner size="large" /></View>;
  const c = producto.cuidados;
  const esPlanta = producto.tipo === 'planta' || producto.tipo === 'flor';

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.imagenWrap}>
          {producto.imagen ? <Image source={{ uri: producto.imagen }} style={estilos.imagen} /> : <Text category="h1" style={estilos.sinImagen}>🌿</Text>}
        </View>
        <View style={estilos.cuerpo}>
          <Text category="h5">{producto.nombre}</Text>
          {producto.nombreCientifico ? <Text appearance="hint" style={estilos.cientifico}>{producto.nombreCientifico}</Text> : null}
          <View style={estilos.precios}>
            <Text category="h5" status="primary">{dinero(producto.precioOferta ?? producto.precio)}</Text>
            {producto.precioOferta != null && <Text appearance="hint" style={estilos.tachado}>{dinero(producto.precio)}</Text>}
          </View>
          <Text category="c1" style={{ color: producto.stock > 0 ? colores.exito : colores.error }}>
            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock por ahora'}
          </Text>
          {producto.descripcion ? <Text style={estilos.descripcion}>{producto.descripcion}</Text> : null}

          {esPlanta && (
            <>
              <Text category="h6" style={estilos.seccion}>Cuidados</Text>
              <View style={estilos.datos}>
                {c.luz && <Dato icono="☀️" texto={ETIQUETAS.luz[c.luz] ?? c.luz} />}
                {c.riego && <Dato icono="💧" texto={ETIQUETAS.riego[c.riego] ?? c.riego} />}
                {c.ubicacion && <Dato icono="🏡" texto={ETIQUETAS.ubicacion[c.ubicacion] ?? c.ubicacion} />}
                {c.dificultad && <Dato icono="🌱" texto={ETIQUETAS.dificultad[c.dificultad] ?? c.dificultad} />}
                {c.toxicaMascotas != null && <Dato icono={c.toxicaMascotas ? '⚠️' : '🐾'} texto={c.toxicaMascotas ? 'Tóxica para mascotas' : 'Segura para mascotas'} />}
              </View>
              {c.riegoDetalle ? <Text appearance="hint" category="c1">Riego: {c.riegoDetalle}</Text> : null}
              {c.consejos ? <Text style={estilos.consejos}>{c.consejos}</Text> : null}
            </>
          )}
        </View>
      </ScrollView>
      <View style={estilos.barra}>
        <Button
          style={estilos.botonAgregar}
          disabled={producto.stock === 0}
          status={agregado ? 'success' : 'primary'}
          onPress={() => {
            agregar(producto);
            setAgregado(true);
            setTimeout(() => setAgregado(false), 1500);
          }}
        >
          {agregado ? 'Agregado ✓' : 'Agregar al carrito'}
        </Button>
        <Button appearance="outline" onPress={() => navigation.getParent()?.navigate('ChatTab', { pregunta: `Hola, tengo una consulta sobre ${producto.nombre}` })}>
          Preguntar
        </Button>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contenido: { paddingBottom: 90 },
  imagenWrap: { height: 260, backgroundColor: '#ECEFE8', alignItems: 'center', justifyContent: 'center' },
  imagen: { width: '100%', height: '100%' },
  sinImagen: { opacity: 0.25, fontSize: 64 },
  cuerpo: { padding: 20 },
  cientifico: { fontStyle: 'italic' },
  precios: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  tachado: { textDecorationLine: 'line-through' },
  descripcion: { marginTop: 14, lineHeight: 22 },
  seccion: { marginTop: 20, marginBottom: 8 },
  datos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dato: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colores.borde },
  datoTexto: { flex: 1 },
  consejos: { marginTop: 10, lineHeight: 20 },
  barra: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colores.borde },
  botonAgregar: { flex: 1 },
});
