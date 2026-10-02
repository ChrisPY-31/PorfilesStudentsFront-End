import React, { useMemo, useState } from 'react';
import { IoSearchOutline, IoKeyOutline, IoLockClosedOutline, IoLockOpenOutline, IoAlertCircleOutline, IoRefreshOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { useAppSelector } from '../Hooks/store';
import { useGetUsersAdminQuery, useToggleBloqueoCuentaMutation } from '../services/UserSlice';
import { obtenerMensajeError } from '../helpers';
import ResetPasswordModal from './ResetPasswordModal';

const POR_PAGINA = 10;

const ROLES = {
  STUDENT: { etiqueta: 'Estudiante', color: 'bg-green-50 text-green-700 border-green-200' },
  TEACHER: { etiqueta: 'Docente', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  RECRUITER: { etiqueta: 'Reclutador', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ADMIN: { etiqueta: 'Administrador', color: 'bg-gray-100 text-gray-700 border-gray-300' },
};

const FILTROS_ROL = [
  { value: '', label: 'Todos' },
  { value: 'STUDENT', label: 'Estudiantes' },
  { value: 'TEACHER', label: 'Docentes' },
  { value: 'RECRUITER', label: 'Reclutadores' },
  { value: 'ADMIN', label: 'Administradores' },
];

const FILTROS_ESTADO = [
  { value: '', label: 'Todos los estados' },
  { value: 'activa', label: 'Activas' },
  { value: 'bloqueada', label: 'Bloqueadas' },
];

const estadoCuenta = (cuenta) => {
  if (!cuenta.enabled) return { clave: 'deshabilitada', etiqueta: 'Deshabilitada', color: 'bg-gray-100 text-gray-600', punto: 'bg-gray-400' };
  if (!cuenta.accountNonLocked) return { clave: 'bloqueada', etiqueta: 'Bloqueada', color: 'bg-red-50 text-red-700', punto: 'bg-red-500' };
  return { clave: 'activa', etiqueta: 'Activa', color: 'bg-green-50 text-green-700', punto: 'bg-green-500' };
};

const BotonFila = ({ icono: Icono, etiqueta, onClick, disabled, peligro }) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    title={etiqueta}
    aria-label={etiqueta}
    className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${peligro ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
  >
    <Icono className='size-5' />
  </button>
);

// Cuentas del sistema (solo ADMIN): buscar, filtrar, bloquear y restablecer contraseña
const ManagerUsers = () => {
  const { userToken, username: miUsername } = useAppSelector(state => state.users);
  const { data: cuentas = [], isLoading, isError, error, refetch, isFetching } = useGetUsersAdminQuery({ token: userToken }, { skip: !userToken });
  const [toggleBloqueo, { isLoading: bloqueando }] = useToggleBloqueoCuentaMutation();

  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cuentaReset, setCuentaReset] = useState(null);
  const [cuentaBloqueo, setCuentaBloqueo] = useState(null);

  const conteoPorRol = useMemo(() => {
    const conteo = {};
    cuentas.forEach(c => c.roles?.forEach(r => { conteo[r] = (conteo[r] ?? 0) + 1; }));
    return conteo;
  }, [cuentas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return cuentas
      .filter(c => !texto || c.username?.toLowerCase().includes(texto) || c.email?.toLowerCase().includes(texto))
      .filter(c => !rol || c.roles?.includes(rol))
      .filter(c => !estado || estadoCuenta(c).clave === estado)
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [cuentas, busqueda, rol, estado]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarFiltro = (setter) => (valor) => { setter(valor); setPagina(1); };

  const confirmarBloqueo = async () => {
    try {
      const res = await toggleBloqueo({ username: cuentaBloqueo.username, token: userToken }).unwrap();
      toast.success(res?.message ?? 'Estado de la cuenta actualizado');
      setCuentaBloqueo(null);
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo cambiar el estado de la cuenta'));
    }
  };

  return (
    <div className='flex-1 p-6 md:p-8 bg-gray-50 min-w-0'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-wrap items-end justify-between gap-3 mb-6'>
          <div>
            <h2 className='font-display text-2xl font-bold text-gray-900'>Usuarios</h2>
            <p className='text-sm text-gray-500'>{cuentas.length} cuentas registradas</p>
          </div>
          <button
            type='button'
            onClick={refetch}
            disabled={isFetching}
            className='flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50'
          >
            <IoRefreshOutline className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className='bg-white rounded-2xl border border-gray-200 p-4 mb-4 space-y-3'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <IoSearchOutline className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400' />
              <input
                type='search'
                value={busqueda}
                onChange={e => cambiarFiltro(setBusqueda)(e.target.value)}
                placeholder='Buscar por usuario o correo'
                className='w-full h-11 pl-10 pr-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-green-500'
              />
            </div>
            <select
              value={estado}
              onChange={e => cambiarFiltro(setEstado)(e.target.value)}
              className='h-11 px-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-green-500'
            >
              {FILTROS_ESTADO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className='flex flex-wrap gap-2'>
            {FILTROS_ROL.map(f => {
              const activo = rol === f.value;
              const total = f.value ? (conteoPorRol[f.value] ?? 0) : cuentas.length;
              return (
                <button
                  key={f.value}
                  type='button'
                  onClick={() => cambiarFiltro(setRol)(f.value)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${activo ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                  {f.label} <span className={activo ? 'text-green-100' : 'text-gray-400'}>{total}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla */}
        <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
          {isLoading ? (
            <p className='p-10 text-center text-sm text-gray-500'>Cargando cuentas...</p>
          ) : isError ? (
            <div className='p-10 flex flex-col items-center gap-3 text-center'>
              <IoAlertCircleOutline className='size-8 text-red-500' />
              <p className='text-sm text-gray-700'>{obtenerMensajeError(error, 'No se pudieron cargar las cuentas')}</p>
              <button type='button' onClick={refetch} className='px-4 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700'>Reintentar</button>
            </div>
          ) : visibles.length === 0 ? (
            <p className='p-10 text-center text-sm text-gray-500'>No hay cuentas que coincidan con los filtros.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <tr>
                    <th className='px-5 py-3'>Cuenta</th>
                    <th className='px-5 py-3'>Rol</th>
                    <th className='px-5 py-3'>Estado</th>
                    <th className='px-5 py-3 text-right'>Acciones</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {visibles.map(cuenta => {
                    const est = estadoCuenta(cuenta);
                    const esAdmin = cuenta.roles?.includes('ADMIN');
                    const esYo = cuenta.username === miUsername;
                    const bloqueada = !cuenta.accountNonLocked;
                    return (
                      <tr key={cuenta.id} className='hover:bg-gray-50'>
                        <td className='px-5 py-3'>
                          <div className='flex items-center gap-3 min-w-0'>
                            <span className='shrink-0 grid place-items-center size-9 rounded-full bg-gray-100 text-gray-600 font-semibold uppercase'>
                              {cuenta.username?.[0]}
                            </span>
                            <div className='min-w-0'>
                              <p className='font-medium text-gray-900 truncate'>{cuenta.username}{esYo && <span className='ml-2 text-xs text-gray-400'>(tú)</span>}</p>
                              <p className='text-gray-500 truncate'>{cuenta.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-5 py-3'>
                          <div className='flex flex-wrap gap-1'>
                            {cuenta.roles?.map(r => (
                              <span key={r} className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${ROLES[r]?.color ?? ROLES.ADMIN.color}`}>
                                {ROLES[r]?.etiqueta ?? r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className='px-5 py-3'>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${est.color}`}>
                            <span className={`size-1.5 rounded-full ${est.punto}`} /> {est.etiqueta}
                          </span>
                        </td>
                        <td className='px-5 py-3'>
                          {esAdmin ? (
                            <p className='text-right text-xs text-gray-400'>—</p>
                          ) : (
                            <div className='flex justify-end gap-1'>
                              <BotonFila icono={IoKeyOutline} etiqueta='Restablecer contraseña' onClick={() => setCuentaReset(cuenta)} />
                              <BotonFila
                                icono={bloqueada ? IoLockOpenOutline : IoLockClosedOutline}
                                etiqueta={bloqueada ? 'Desbloquear cuenta' : 'Bloquear cuenta'}
                                onClick={() => setCuentaBloqueo(cuenta)}
                                peligro={!bloqueada}
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginacion */}
          {filtradas.length > POR_PAGINA && (
            <div className='flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50 text-sm'>
              <p className='text-gray-500'>
                {(paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, filtradas.length)} de {filtradas.length}
              </p>
              <div className='flex gap-2'>
                <button type='button' onClick={() => setPagina(paginaActual - 1)} disabled={paginaActual === 1}
                  className='px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40'>
                  Anterior
                </button>
                <button type='button' onClick={() => setPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}
                  className='px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40'>
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {cuentaReset && <ResetPasswordModal cuenta={cuentaReset} onClose={() => setCuentaReset(null)} />}

      {/* Confirmacion de bloqueo */}
      {cuentaBloqueo && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6'>
            {cuentaBloqueo.accountNonLocked ? (
              <>
                <h3 className='text-lg font-bold text-gray-900'>¿Bloquear a {cuentaBloqueo.username}?</h3>
                <p className='mt-2 text-sm text-gray-600'>No podrá usar la plataforma hasta que la desbloquees.</p>
              </>
            ) : (
              <>
                <h3 className='text-lg font-bold text-gray-900'>¿Desbloquear a {cuentaBloqueo.username}?</h3>
                <p className='mt-2 text-sm text-gray-600'>Podrá volver a usar la plataforma normalmente.</p>
              </>
            )}
            <div className='mt-6 flex justify-end gap-2'>
              <button type='button' onClick={() => setCuentaBloqueo(null)} disabled={bloqueando}
                className='px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50'>
                Cancelar
              </button>
              <button type='button' onClick={confirmarBloqueo} disabled={bloqueando}
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 ${cuentaBloqueo.accountNonLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {bloqueando ? 'Guardando...' : cuentaBloqueo.accountNonLocked ? 'Bloquear' : 'Desbloquear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerUsers;
