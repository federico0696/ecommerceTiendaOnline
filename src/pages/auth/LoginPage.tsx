import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Leaf } from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../../api/servicios';
import { mensajeError } from '../../api/cliente';
import { sesionIniciada } from '../../app/slices/auth.slice';
import { Boton, Campo } from '../../components/ui';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const r = await authApi.login(email, password);
      if (r.usuario.rol === 'cliente') throw new Error('Esta cuenta es de la app, no del panel');
      dispatch(sesionIniciada(r));
    } catch (err) {
      toast.error(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-verde-600 text-white"><Leaf /></span>
        <div>
          <h1 className="text-lg font-semibold">{import.meta.env.VITE_APP_NOMBRE}</h1>
          <p className="text-sm text-stone-500">Ingresá con tu cuenta del vivero</p>
        </div>
      </div>
      <Campo etiqueta="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Campo etiqueta="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      <Boton type="submit" className="w-full" disabled={cargando}>{cargando ? 'Ingresando…' : 'Ingresar'}</Boton>
    </form>
  );
};
