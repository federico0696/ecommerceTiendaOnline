import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry, Spinner, Text } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registrarCierreSesion } from './infrastructure/api/clienteApi';
import { NavegacionAuth, NavegacionPrincipal } from './presentation/routes/Navegacion';
import { notificacionesService } from './presentation/services/notificaciones.service';
import { useAuthStore } from './presentation/store/auth.store';
import { useViveroStore } from './presentation/store/vivero.store';
import { temaDesdeVivero } from './presentation/theme/tema';

/**
 * Arranque:
 *  1. carga el perfil público del vivero (colores, nombre del bot, entregas),
 *  2. verifica si hay sesión guardada,
 *  3. muestra login o la app.
 */
export const App = () => {
  const { estado, verificar, salir } = useAuthStore();
  const { vivero, cargar } = useViveroStore();

  useEffect(() => {
    registrarCierreSesion(() => salir());
    cargar();
    verificar();
  }, [cargar, verificar, salir]);

  useEffect(() => {
    if (estado === 'autenticado') notificacionesService.registrarDispositivo();
  }, [estado]);

  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={temaDesdeVivero(vivero)}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F7F4" />
        {estado === 'verificando' ? (
          <View style={estilos.centro}>
            <Spinner size="giant" />
            <Text appearance="hint" style={estilos.cargando}>{vivero?.nombre ?? 'Cargando…'}</Text>
          </View>
        ) : (
          <NavigationContainer>{estado === 'autenticado' ? <NavegacionPrincipal /> : <NavegacionAuth />}</NavigationContainer>
        )}
      </ApplicationProvider>
    </SafeAreaProvider>
  );
};

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7F4', gap: 12 },
  cargando: { marginTop: 8 },
});
