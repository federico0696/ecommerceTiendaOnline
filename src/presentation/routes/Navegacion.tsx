import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@ui-kitten/components';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegistroScreen } from '../screens/auth/RegistroScreen';
import { InicioScreen } from '../screens/inicio/InicioScreen';
import { CatalogoScreen } from '../screens/catalogo/CatalogoScreen';
import { ProductoScreen } from '../screens/catalogo/ProductoScreen';
import { CarritoScreen } from '../screens/carrito/CarritoScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { PerfilScreen } from '../screens/perfil/PerfilScreen';
import { MisPedidosScreen } from '../screens/pedidos/MisPedidosScreen';
import { useCarritoStore } from '../store/carrito.store';
import { useViveroStore } from '../store/vivero.store';
import { AuthStackParams, CatalogoStackParams, TabsParams } from './tipos';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
export const NavegacionAuth = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Registro" component={RegistroScreen} />
  </AuthStack.Navigator>
);

const CatalogoStack = createNativeStackNavigator<CatalogoStackParams>();
const NavegacionCatalogo = () => (
  <CatalogoStack.Navigator>
    <CatalogoStack.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Catálogo' }} />
    <CatalogoStack.Screen name="Producto" component={ProductoScreen} />
  </CatalogoStack.Navigator>
);

const PerfilStack = createNativeStackNavigator();
const NavegacionPerfil = () => (
  <PerfilStack.Navigator>
    <PerfilStack.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Mi cuenta' }} />
    <PerfilStack.Screen name="MisPedidos" component={MisPedidosScreen} options={{ title: 'Mis pedidos' }} />
  </PerfilStack.Navigator>
);

const Tabs = createBottomTabNavigator<TabsParams>();
const ICONOS: Record<keyof TabsParams, string> = {
  InicioTab: 'home-outline',
  CatalogoTab: 'grid-outline',
  CarritoTab: 'shopping-cart-outline',
  ChatTab: 'message-circle-outline',
  PerfilTab: 'person-outline',
};

/** Navegación principal del cliente logueado. */
export const NavegacionPrincipal = () => {
  const cantidad = useCarritoStore((s) => s.cantidadTotal());
  const primario = useViveroStore((s) => s.vivero?.marca.colorPrimario ?? '#2E7D32');
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: primario,
        tabBarIcon: ({ color, size }) => <Icon name={ICONOS[route.name]} fill={color} style={{ width: size, height: size }} />,
      })}
    >
      <Tabs.Screen name="InicioTab" component={InicioScreen} options={{ title: 'Inicio' }} />
      <Tabs.Screen name="CatalogoTab" component={NavegacionCatalogo} options={{ title: 'Catálogo', headerShown: false }} />
      <Tabs.Screen name="CarritoTab" component={CarritoScreen} options={{ title: 'Carrito', tabBarBadge: cantidad || undefined }} />
      <Tabs.Screen name="ChatTab" component={ChatScreen} options={{ title: 'Chat' }} />
      <Tabs.Screen name="PerfilTab" component={NavegacionPerfil} options={{ title: 'Mi cuenta', headerShown: false }} />
    </Tabs.Navigator>
  );
};
