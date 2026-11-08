import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Input, Spinner, Text } from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Categoria, Producto } from '../../../domain/entities';
import { TarjetaProducto } from '../../components/TarjetaProducto';
import { catalogoService } from '../../services/catalogo.service';
import { colores } from '../../theme/tema';
import { CatalogoStackParams } from '../../routes/tipos';

type Props = NativeStackScreenProps<CatalogoStackParams, 'Catalogo'>;

export const CatalogoScreen = ({ navigation, route }: Props) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string | undefined>(route.params?.categoriaId);
  const [buscar, setBuscar] = useState(route.params?.buscar ?? '');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    catalogoService.categorias().then(setCategorias).catch(() => undefined);
  }, []);

  useEffect(() => {
    setCategoriaId(route.params?.categoriaId);
  }, [route.params?.categoriaId]);

  const cargar = useCallback(async (pag: number, reemplazar: boolean) => {
    setCargando(true);
    try {
      const r = await catalogoService.productos({ buscar: buscar || undefined, categoriaId, pagina: pag });
      setProductos((prev) => (reemplazar ? r.productos : [...prev, ...r.productos]));
      setPaginas(r.paginas);
      setPagina(pag);
    } catch {
      /* se mantiene lo cargado */
    } finally {
      setCargando(false);
    }
  }, [buscar, categoriaId]);

  useEffect(() => {
    const t = setTimeout(() => cargar(1, true), 300);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <View style={estilos.pantalla}>
      <Input placeholder="Buscar plantas, macetas…" value={buscar} onChangeText={setBuscar} style={estilos.buscador} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: '', nombre: 'Todo', slug: '' } as Categoria, ...categorias]}
        keyExtractor={(c) => c.id || 'todo'}
        contentContainerStyle={estilos.chips}
        style={estilos.filaChips}
        renderItem={({ item }) => (
          <Button
            size="tiny"
            appearance={(item.id || undefined) === categoriaId ? 'filled' : 'outline'}
            style={estilos.chip}
            onPress={() => setCategoriaId(item.id || undefined)}
          >
            {item.nombre}
          </Button>
        )}
      />
      <FlatList
        data={productos}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={estilos.grilla}
        renderItem={({ item }) => (
          <TarjetaProducto producto={item} alTocar={() => navigation.navigate('Producto', { slug: item.slug, nombre: item.nombre })} />
        )}
        onEndReached={() => !cargando && pagina < paginas && cargar(pagina + 1, false)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={cargando ? <View style={estilos.spinner}><Spinner /></View> : null}
        ListEmptyComponent={!cargando ? <Text appearance="hint" style={estilos.vacio}>No encontramos productos con esa búsqueda.</Text> : null}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  buscador: { margin: 12, marginBottom: 4 },
  filaChips: { flexGrow: 0 },
  chips: { paddingHorizontal: 10, paddingVertical: 6 },
  chip: { marginHorizontal: 3, borderRadius: 20 },
  grilla: { paddingHorizontal: 6, paddingBottom: 24 },
  spinner: { padding: 16, alignItems: 'center' },
  vacio: { textAlign: 'center', padding: 32 },
});
