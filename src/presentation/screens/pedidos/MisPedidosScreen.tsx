import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Text } from '@ui-kitten/components';
import { EstadoPedido, Pedido } from '../../../domain/entities';
import { pedidosService } from '../../services/pedidos.service';
import { useSocket } from '../../hooks/useSocket';
import { colores, dinero } from '../../theme/tema';

const ESTADO: Record<EstadoPedido, { texto: string; color: string }> = {
  pendiente: { texto: 'Pendiente de confirmación', color: '#F9A825' },
  confirmado: { texto: 'Confirmado', color: '#0288D1' },
  preparando: { texto: 'En preparación', color: '#5E35B1' },
  listo: { texto: 'Listo para retirar', color: '#2E7D32' },
  en_camino: { texto: 'En camino', color: '#00897B' },
  entregado: { texto: 'Entregado', color: '#6B6B6B' },
  cancelado: { texto: 'Cancelado', color: '#C62828' },
};

export const MisPedidosScreen = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setPedidos(await pedidosService.listar());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);
  useSocket({ 'pedido:actualizado': () => cargar() });

  const cancelar = (p: Pedido) =>
    Alert.alert(`Cancelar pedido #${p.numero}`, '¿Seguro?', [
      { text: 'No' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => pedidosService.cancelar(p.id).then(cargar).catch((e) => Alert.alert('No se pudo cancelar', e.message)) },
    ]);

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.lista}
      data={pedidos}
      keyExtractor={(p) => p.id}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      renderItem={({ item }) => (
        <View style={estilos.tarjeta}>
          <View style={estilos.fila}>
            <Text category="s1">Pedido #{item.numero}</Text>
            <Text category="s1">{dinero(item.total)}</Text>
          </View>
          <Text category="c1" style={{ color: ESTADO[item.estado].color }}>{ESTADO[item.estado].texto}</Text>
          <Text appearance="hint" category="c1">{new Date(item.creadoEn).toLocaleDateString('es-AR')} · {item.tipoEntrega === 'envio' ? 'envío' : 'retiro'}</Text>
          <Text category="c1" style={estilos.items}>{item.items.map((i) => `${i.cantidad}× ${i.nombreProducto}`).join(', ')}</Text>
          {item.estado === 'pendiente' && <Button size="tiny" appearance="ghost" status="danger" style={estilos.cancelar} onPress={() => cancelar(item)}>Cancelar</Button>}
        </View>
      )}
      ListEmptyComponent={!cargando ? <Text appearance="hint" style={estilos.vacio}>Todavía no hiciste pedidos.</Text> : null}
    />
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: 12 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colores.borde, gap: 2 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  items: { marginTop: 6 },
  cancelar: { alignSelf: 'flex-start', marginTop: 4 },
  vacio: { textAlign: 'center', padding: 32 },
});
