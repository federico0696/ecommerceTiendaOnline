import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Input, Text } from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mensajeError } from '../../../infrastructure/api/clienteApi';
import { useAuthStore } from '../../store/auth.store';
import { useViveroStore } from '../../store/vivero.store';
import { AuthStackParams } from '../../routes/tipos';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const vivero = useViveroStore((s) => s.vivero);
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    setError('');
    setCargando(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text category="h1" style={estilos.titulo}>{vivero?.nombre ?? 'Vivero'}</Text>
        <Text appearance="hint" style={estilos.sub}>Ingresá para ver el catálogo, pedir y chatear con nosotros.</Text>
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={estilos.campo} />
        <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={estilos.campo} />
        {error ? <Text status="danger" category="c1" style={estilos.error}>{error}</Text> : null}
        <Button onPress={entrar} disabled={cargando || !email || !password}>{cargando ? 'Ingresando…' : 'Ingresar'}</Button>
        <View style={estilos.pie}>
          <Text appearance="hint">¿Primera vez? </Text>
          <Text status="primary" onPress={() => navigation.navigate('Registro')}>Crear cuenta</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F6F7F4' },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  titulo: { marginBottom: 4 },
  sub: { marginBottom: 24 },
  campo: { marginBottom: 12 },
  error: { marginBottom: 12 },
  pie: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
});
