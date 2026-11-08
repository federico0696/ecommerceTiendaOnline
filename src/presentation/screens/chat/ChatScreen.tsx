import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Input, Text } from '@ui-kitten/components';
import { useRoute } from '@react-navigation/native';
import { Mensaje } from '../../../domain/entities';
import { Burbuja } from '../../components/Burbuja';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chat.service';
import { useViveroStore } from '../../store/vivero.store';
import { colores } from '../../theme/tema';

/**
 * Chat con el vivero. Primero contesta el asistente; si deriva, siguen las personas.
 * Los mensajes del vivero llegan por socket; el envío devuelve la respuesta del bot en la misma llamada.
 */
export const ChatScreen = () => {
  const route = useRoute<any>();
  const vivero = useViveroStore((s) => s.vivero);
  const nombreBot = vivero?.nombreBot ?? 'Asistente';
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [modo, setModo] = useState<'bot' | 'humano'>('bot');
  const [texto, setTexto] = useState(route.params?.pregunta ?? '');
  const [enviando, setEnviando] = useState(false);
  const [escribiendo, setEscribiendo] = useState<string | null>(null);
  const lista = useRef<FlatList<Mensaje>>(null);

  const agregar = useCallback((m: Mensaje) => setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])), []);

  useEffect(() => {
    chatService.conversacion().then(async (c) => {
      setModo(c.modo);
      setMensajes(await chatService.mensajes(c.id));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (route.params?.pregunta) setTexto(route.params.pregunta);
  }, [route.params?.pregunta]);

  useSocket({
    'mensaje:nuevo': (p: { mensaje: Mensaje }) => agregar(p.mensaje),
    'empleado:escribiendo': (p: { nombre: string }) => {
      setEscribiendo(p.nombre);
      setTimeout(() => setEscribiendo(null), 3000);
    },
  });

  const enviar = async () => {
    const t = texto.trim();
    if (!t || enviando) return;
    setTexto('');
    setEnviando(true);
    try {
      const r = await chatService.enviar(t);
      agregar(r.mensaje);
      if (r.respuesta) agregar(r.respuesta);
      setModo(r.modo);
    } catch {
      agregar({ id: `err-${Date.now()}`, emisor: 'sistema', contenido: 'No se pudo enviar. Probá de nuevo.', creadoEn: new Date().toISOString() });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={estilos.estado}>
        <Text category="c1" appearance="hint">
          {modo === 'bot' ? `Te atiende ${nombreBot}. Pedí "hablar con una persona" cuando quieras.` : 'Te atiende una persona del vivero.'}
        </Text>
      </View>
      <FlatList
        ref={lista}
        data={mensajes}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Burbuja mensaje={item} nombreBot={nombreBot} />}
        contentContainerStyle={estilos.lista}
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text appearance="hint" style={estilos.vacio}>Contanos qué estás buscando o qué planta querés cuidar mejor.</Text>}
      />
      {escribiendo && <Text category="c1" appearance="hint" style={estilos.escribiendo}>{escribiendo} está escribiendo…</Text>}
      <View style={estilos.barra}>
        <Input style={estilos.input} placeholder="Escribí tu mensaje…" value={texto} onChangeText={setTexto} multiline onSubmitEditing={enviar} />
        <Button onPress={enviar} disabled={!texto.trim() || enviando}>Enviar</Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  estado: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colores.borde },
  lista: { paddingVertical: 10, flexGrow: 1 },
  vacio: { textAlign: 'center', padding: 32 },
  escribiendo: { paddingHorizontal: 16, paddingBottom: 4 },
  barra: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colores.borde },
  input: { flex: 1 },
});
