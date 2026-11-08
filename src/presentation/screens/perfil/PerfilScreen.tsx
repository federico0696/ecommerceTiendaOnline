import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, ListItem, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { useViveroStore } from '../../store/vivero.store';
import { colores } from '../../theme/tema';

export const PerfilScreen = () => {
  const navigation = useNavigation<any>();
  const { cliente, salir } = useAuthStore();
  const vivero = useViveroStore((s) => s.vivero);

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.cabecera}>
        <Text category="h5">{cliente?.nombre}</Text>
        <Text appearance="hint">{cliente?.email}</Text>
      </View>
      <View style={estilos.bloque}>
        <ListItem title="Mis pedidos" description="Estado y detalle de tus compras" onPress={() => navigation.navigate('MisPedidos')} />
        <Divider />
        <ListItem title="Mis plantas" description="Próximamente: recordatorios de riego" disabled />
      </View>
      <Text category="h6" style={estilos.seccion}>{vivero?.nombre}</Text>
      <View style={estilos.bloque}>
        <ListItem title="Horarios" description={vivero?.horarios} />
        <Divider />
        {vivero?.direccion ? <ListItem title="Dirección" description={`${vivero.direccion}${vivero.ciudad ? `, ${vivero.ciudad}` : ''}`} /> : null}
        <Divider />
        {vivero?.telefono ? <ListItem title="Teléfono" description={vivero.telefono} onPress={() => Linking.openURL(`tel:${vivero.telefono}`)} /> : null}
      </View>
      <Button appearance="outline" status="basic" style={estilos.salir} onPress={salir}>Cerrar sesión</Button>
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 16 },
  cabecera: { marginBottom: 16 },
  bloque: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colores.borde },
  seccion: { marginTop: 20, marginBottom: 8 },
  salir: { marginTop: 24 },
});
