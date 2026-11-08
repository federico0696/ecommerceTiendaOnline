/** Parámetros de cada navegador. Un solo lugar para que las pantallas tipen `navigation` y `route`. */
export type AuthStackParams = {
  Login: undefined;
  Registro: undefined;
};

export type CatalogoStackParams = {
  Catalogo: { categoriaId?: string; buscar?: string } | undefined;
  Producto: { slug: string; nombre: string };
};

export type TabsParams = {
  InicioTab: undefined;
  CatalogoTab: undefined;
  CarritoTab: undefined;
  ChatTab: undefined;
  PerfilTab: undefined;
};
