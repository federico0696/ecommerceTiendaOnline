import EncryptedStorage from 'react-native-encrypted-storage';

/** Tokens y datos sensibles: siempre cifrados, nunca en AsyncStorage. */
export const almacenSeguro = {
  async leer(clave: string): Promise<string | null> {
    try { return await EncryptedStorage.getItem(clave); } catch { return null; }
  },
  async guardar(clave: string, valor: string): Promise<void> {
    try { await EncryptedStorage.setItem(clave, valor); } catch { /* en emuladores sin keystore puede fallar; no rompe la app */ }
  },
  async borrar(clave: string): Promise<void> {
    try { await EncryptedStorage.removeItem(clave); } catch { /* idem */ }
  },
};
