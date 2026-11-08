import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Mensaje } from '../../domain/entities';

/** Burbuja de chat. Cliente a la derecha, vivero (bot o persona) a la izquierda, sistema al centro. */
export const Burbuja = ({ mensaje, nombreBot }: { mensaje: Mensaje; nombreBot: string }) => {
  if (mensaje.emisor === 'sistema') {
    return <Text category="c1" appearance="hint" style={estilos.sistema}>{mensaje.contenido}</Text>;
  }
  const mio = mensaje.emisor === 'cliente';
  return (
    <View style={[estilos.fila, mio ? estilos.derecha : estilos.izquierda]}>
      <View style={[estilos.burbuja, mio ? estilos.mia : estilos.suya]}>
        {!mio && <Text category="c2" appearance="hint">{mensaje.emisor === 'bot' ? nombreBot : 'Vivero'}</Text>}
        <Text style={mio ? estilos.textoMio : undefined}>{mensaje.contenido}</Text>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', marginVertical: 3, paddingHorizontal: 12 },
  derecha: { justifyContent: 'flex-end' },
  izquierda: { justifyContent: 'flex-start' },
  burbuja: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  mia: { backgroundColor: '#2E7D32', borderBottomRightRadius: 4 },
  suya: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E3E6DF' },
  textoMio: { color: '#fff' },
  sistema: { textAlign: 'center', marginVertical: 6 },
});
