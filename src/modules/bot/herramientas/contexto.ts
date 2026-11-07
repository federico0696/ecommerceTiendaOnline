import { CatalogoService } from '../../catalogo/catalogo.service';
import { ClientesService } from '../../clientes/clientes.service';
import { ConversacionesService } from '../../conversaciones/conversaciones.service';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';
import { PedidosService } from '../../pedidos/pedidos.service';
import { Vivero } from '../../viveros/entities/vivero.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

/** Todo lo que una herramienta puede necesitar. Se arma una vez por turno del bot. */
export interface ContextoHerramienta {
  vivero: Vivero;
  cliente: Cliente;
  conversacion: Conversacion;
  servicios: {
    catalogo: CatalogoService;
    pedidos: PedidosService;
    clientes: ClientesService;
    conversaciones: ConversacionesService;
  };
}

/** Lo que devuelve una herramienta. `derivar` corta el ciclo y pasa la charla a un humano. */
export interface ResultadoHerramienta {
  /** Se serializa a JSON y vuelve al modelo. */
  datos: unknown;
  derivar?: { motivo: string; mensajeAlCliente: string };
  esError?: boolean;
}
