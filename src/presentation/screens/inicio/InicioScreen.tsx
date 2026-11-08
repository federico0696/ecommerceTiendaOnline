import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { Categoria, Producto } from '../../../domain/entities';
import { TarjetaProducto } from '../../components/TarjetaProducto';
import { catalogoService } from '../../services/catalogo.service';
import { useAuthStore } from '../../store/auth.store';
import { useViveroStore } from '../../store/vivero.store';
import { colores } from '../../theme/tema';

/** Portada: saludo, accesos a categorías, destacados y un atajo al chat. */
export const InicioScreen = () => {
  const navigation = useNavigation<any>();
  const cliente = useAuthStore((s) => s.cliente);
  const vivero = useViveroStore((s) => s.vivero);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [destacados, setDestacados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [cats, dest] = await Promise.all([catalogoService.categorias(), catalogoService.productos({ destacados: true })]);
      setCategorias(cats);
      setDestacados(dest.productos);
    } catch {
      /* sin conexión: la pantalla queda vacía y se puede refrescar */
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const irACatalogo = (categoriaId?: string) => navigation.navigate('CatalogoTab', { screen: 'Catalogo', params: { categoriaId } });
  const irAProducto = (p: Producto) => navigation.navigate('CatalogoTab', { screen: 'Producto', params: { slug: p.slug, nombre: p.nombre } });

  return (
    <ScrollView style={estilos.pantalla} refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}>
      <View style={estilos.cabecera}>
        <Text category="h4">Hola, {cliente?.nombre?.split(' ')[0]} 🌱</Text>
        <Text appearance="hint">{vivero?.horarios}</Text>
      </View>

      <Card style={estilos.tarjetaChat} onPress={() => navigation.navigate('ChatTab')}>
        <Text category="s1">¿Dudas sobre qué planta elegir o cómo cuidarla?</Text>
        <Text appearance="hint" category="c1">Chateá con {vivero?.nombreBot ?? 'nuestro asistente'} o con alguien del vivero.</Text>
      </Card>

      <Text category="h6" style={estilos.seccion}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
        {categorias.map((c) => (
          <Button key={c.id} size="small" appearance="outline" style={estilos.chip} onPress={() => irACatalogo(c.id)}>{c.nombre}</Button>
        ))}
        <Button size="small" appearance="ghost" onPress={() => irACatalogo()}>Ver todo</Button>
      </ScrollView>

      <Text category="h6" style={estilos.seccion}>Destacados</Text>
      <FlatList
        data={destacados}
        keyExtractor={(p) => p.id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={estilos.grilla}
        renderItem={({ item }) => <TarjetaProducto producto={item} alTocar={() => irAProducto(item)} />}
        ListEmptyComponent={<Text appearance="hint" style={estilos.vacio}>Todavía no hay destacados.</Text>}
      />
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  cabecera: { padding: 20, paddingBottom: 8 },
  tarjetaChat: { marginHorizontal: 16, marginBottom: 8 },
  seccion: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  chips: { paddingHorizontal: 14 },
  chip: { marginHorizontal: 4, borderRadius: 20 },
  grilla: { paddingHorizontal: 10, paddingBottom: 24 },
  vacio: { textAlign: 'center', padding: 24 },
});
