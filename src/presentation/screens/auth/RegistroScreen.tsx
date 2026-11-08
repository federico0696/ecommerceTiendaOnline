import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mensajeError } from '../../../infrastructure/api/clienteApi';
import { useAuthStore } from '../../store/auth.store';
import { AuthStackParams } from '../../routes/tipos';

type Props = NativeStackScreenProps<AuthStackParams, 'Registro'>;

export const RegistroScreen = ({ navigation }: Props) => {
  const registrar = useAuthStore((s) => s.registrar);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const crear = async () => {
    setError('');
    if (password.length < 8) return setError('La contraseña tiene que tener al menos 8 caracteres');
    setCargando(true);
    try {
      await registrar(nombre.trim(), email.trim(), password);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text category="h3" style={estilos.titulo}>Crear cuenta</Text>
        <Input label="Nombre" value={nombre} onChangeText={setNombre} style={estilos.campo} />
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={estilos.campo} />
        <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry caption="Mínimo 8 caracteres" style={estilos.campo} />
        {error ? <Text status="danger" category="c1" style={estilos.error}>{error}</Text> : null}
        <Button onPress={crear} disabled={cargando || !nombre || !email || !password}>{cargando ? 'Creando…' : 'Crear cuenta'}</Button>
        <Button appearance="ghost" onPress={() => navigation.goBack()} style={estilos.volver}>Ya tengo cuenta</Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F6F7F4' },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  titulo: { marginBottom: 20 },
  campo: { marginBottom: 12 },
  error: { marginBottom: 12 },
  volver: { marginTop: 8 },
});
