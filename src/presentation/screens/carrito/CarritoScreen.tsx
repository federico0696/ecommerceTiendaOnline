import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Input, Radio, RadioGroup, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { mensajeError } from '../../../infrastructure/api/clienteApi';
import { pedidosService } from '../../services/pedidos.service';
import { useCarritoStore } from '../../store/carrito.store';
import { useViveroStore } from '../../store/vivero.store';
import { colores, dinero } from '../../theme/tema';

export const CarritoScreen = () => {
  const navigation = useNavigation<any>();
  const vivero = useViveroStore((s) => s.vivero);
  const { items, cambiarCantidad, quitar, vaciar, total } = useCarritoStore();
  const opciones = [
    ...(vivero?.pedidos.permiteRetiro !== false ? ['retiro' as const] : []),
    ...(vivero?.pedidos.permiteEnvio ? ['envio' as const] : []),
  ];
  const [entregaIdx, setEntregaIdx] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const tipoEntrega = opciones[entregaIdx] ?? 'retiro';
  const costoEnvio = tipoEntrega === 'envio' ? Number(vivero?.pedidos.costoEnvioBase ?? 0) : 0;

  const confirmar = async () => {
    if (tipoEntrega === 'envio' && !direccion.trim()) return Alert.alert('Falta la dirección', 'Indicá a dónde te lo enviamos.');
    setEnviando(true);
    try {
      const pedido = await pedidosService.crear(items, tipoEntrega, direccion.trim() || undefined, nota.trim() || undefined);
      vaciar();
      Alert.alert(`Pedido #${pedido.numero} enviado`, 'Te avisamos cuando el vivero lo confirme.', [
        { text: 'Ver mis pedidos', onPress: () => navigation.navigate('PerfilTab', { screen: 'MisPedidos' }) },
        { text: 'Listo' },
      ]);
    } catch (e) {
      Alert.alert('No pudimos tomar el pedido', mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={estilos.vacio}>
        <Text category="h1" style={estilos.vacioIcono}>🪴</Text>
        <Text category="s1">Tu carrito está vacío</Text>
        <Button appearance="ghost" onPress={() => navigation.navigate('CatalogoTab')}>Ir al catálogo</Button>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.producto.id}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <View style={estilos.itemTexto}>
              <Text category="s1">{item.producto.nombre}</Text>
              <Text appearance="hint" category="c1">{dinero(item.producto.precioOferta ?? item.producto.precio)} c/u</Text>
            </View>
            <View style={estilos.cantidad}>
              <Button size="tiny" appearance="outline" onPress={() => cambiarCantidad(item.producto.id, item.cantidad - 1)}>−</Button>
              <Text category="s1" style={estilos.numero}>{item.cantidad}</Text>
              <Button size="tiny" appearance="outline" disabled={item.cantidad >= item.producto.stock} onPress={() => cambiarCantidad(item.producto.id, item.cantidad + 1)}>+</Button>
            </View>
            <Text category="s1" style={estilos.subtotal}>{dinero((item.producto.precioOferta ?? item.producto.precio) * item.cantidad)}</Text>
            <Text status="danger" category="c1" onPress={() => quitar(item.producto.id)}>Quitar</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={estilos.pie}>
            <Text category="h6" style={estilos.seccion}>Entrega</Text>
            <RadioGroup selectedIndex={entregaIdx} onChange={setEntregaIdx}>
              {opciones.map((o) => (
                <Radio key={o}>{o === 'retiro' ? `Retiro en el vivero${vivero?.direccion ? ` (${vivero.direccion})` : ''}` : `Envío a domicilio (${dinero(Number(vivero?.pedidos.costoEnvioBase ?? 0))})`}</Radio>
              ))}
            </RadioGroup>
            {tipoEntrega === 'envio' && <Input label="Dirección de entrega" value={direccion} onChangeText={setDireccion} style={estilos.campo} />}
            <Input label="Nota para el vivero (opcional)" value={nota} onChangeText={setNota} multiline style={estilos.campo} />
            <View style={estilos.totales}>
              <Text appearance="hint">Subtotal {dinero(total())}</Text>
              {costoEnvio > 0 && <Text appearance="hint">Envío {dinero(costoEnvio)}</Text>}
              <Text category="h6">Total {dinero(total() + costoEnvio)}</Text>
            </View>
            <Button onPress={confirmar} disabled={enviando}>{enviando ? 'Enviando…' : 'Confirmar pedido'}</Button>
            <Text appearance="hint" category="c1" style={estilos.aviso}>El pago se coordina con el vivero al confirmar.</Text>
          </View>
        }
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  vacioIcono: { fontSize: 56 },
  lista: { padding: 12, paddingBottom: 40 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colores.borde },
  itemTexto: { flex: 1 },
  cantidad: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numero: { minWidth: 20, textAlign: 'center' },
  subtotal: { minWidth: 70, textAlign: 'right' },
  pie: { marginTop: 8 },
  seccion: { marginBottom: 8 },
  campo: { marginTop: 10 },
  totales: { marginVertical: 16, alignItems: 'flex-end', gap: 2 },
  aviso: { textAlign: 'center', marginTop: 10 },
});
