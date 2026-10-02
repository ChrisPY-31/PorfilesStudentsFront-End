import React, { useMemo, useState } from 'react';
import { IoPeopleOutline, IoSchoolOutline, IoLibraryOutline, IoBriefcaseOutline, IoLockClosedOutline, IoAlertCircleOutline, IoRefreshOutline, IoChevronForward } from 'react-icons/io5';
import { useAppSelector } from '../Hooks/store';
import { useGetCareersQuery, useGetEstudiantesResumenQuery, useGetUsersAdminQuery } from '../services/UserSlice';
import { obtenerMensajeError } from '../helpers';

const formatoNumero = new Intl.NumberFormat('es-MX');
const SIN_CARRERA = 'Sin carrera asignada';

// Cifra suelta: no necesita grafica
const Tarjeta = ({ icono: Icono, etiqueta, valor, detalle, acento = 'bg-gray-100 text-gray-600', onClick }) => {
  const Contenedor = onClick ? 'button' : 'div';
  return (
    <Contenedor
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`text-left bg-white rounded-2xl border border-gray-200 p-5 ${onClick ? 'hover:border-gray-300 hover:shadow-sm transition-all' : ''}`}
    >
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm font-medium text-gray-600'>{etiqueta}</p>
        <span className={`grid place-items-center size-9 rounded-xl ${acento}`}>
          <Icono className='size-5' />
        </span>
      </div>
      <p className='mt-3 font-display text-3xl font-semibold text-gray-900 tabular-nums'>{valor}</p>
      {detalle && <p className='mt-1 text-xs text-gray-500 flex items-center gap-1'>{detalle}</p>}
    </Contenedor>
  );
};

// Barras horizontales: un solo color, valor en la punta, tooltip al pasar el mouse
const BarrasPorCarrera = ({ filas, total }) => {
  const [activa, setActiva] = useState(null);
  const maximo = Math.max(1, ...filas.map(f => f.cantidad));

  return (
    <ul className='space-y-3' onMouseLeave={() => setActiva(null)}>
      {filas.map(fila => {
        const porcentaje = total ? Math.round((fila.cantidad / total) * 100) : 0;
        const ancho = (fila.cantidad / maximo) * 100;
        const enfocada = activa === fila.nombre;
        return (
          <li
            key={fila.nombre}
            className='relative grid grid-cols-[minmax(0,11rem)_1fr] sm:grid-cols-[minmax(0,15rem)_1fr] items-center gap-3 py-1 rounded-lg'
            onMouseEnter={() => setActiva(fila.nombre)}
            onFocus={() => setActiva(fila.nombre)}
            onBlur={() => setActiva(null)}
            tabIndex={0}
            aria-label={`${fila.nombre}: ${fila.cantidad} estudiantes, ${porcentaje}%`}
          >
            <span className={`text-sm truncate ${fila.nombre === SIN_CARRERA ? 'italic text-gray-500' : 'text-gray-700'}`} title={fila.nombre}>
              {fila.nombre}
            </span>
            <div className='flex items-center gap-2 min-w-0'>
              {/* Barra de 20px, punta redondeada y base recta */}
              <div
                className={`h-5 rounded-r ${fila.nombre === SIN_CARRERA ? 'bg-gray-400' : 'bg-green-600'} transition-opacity ${activa && !enfocada ? 'opacity-40' : ''}`}
                style={{ width: `${ancho}%`, minWidth: fila.cantidad ? 4 : 0 }}
              />
              <span className='text-sm font-semibold text-gray-900 tabular-nums'>{formatoNumero.format(fila.cantidad)}</span>
            </div>
            {enfocada && (
              <div className='absolute right-0 -top-9 z-10 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs shadow-lg pointer-events-none whitespace-nowrap'>
                <span className='font-semibold'>{fila.nombre}</span> · {formatoNumero.format(fila.cantidad)} estudiantes ({porcentaje}%)
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const ManagerDashboard = ({ onVerUsuarios }) => {
  const { userToken } = useAppSelector(state => state.users);
  const omitir = { skip: !userToken };
  const cuentasQ = useGetUsersAdminQuery({ token: userToken }, omitir);
  const estudiantesQ = useGetEstudiantesResumenQuery({ token: userToken }, omitir);
  const carrerasQ = useGetCareersQuery({ token: userToken }, omitir);
  const [verTabla, setVerTabla] = useState(false);

  const cuentas = useMemo(() => cuentasQ.data ?? [], [cuentasQ.data]);
  const conteo = useMemo(() => {
    const porRol = { STUDENT: 0, TEACHER: 0, RECRUITER: 0, ADMIN: 0 };
    let bloqueadas = 0;
    cuentas.forEach(c => {
      c.roles?.forEach(r => { porRol[r] = (porRol[r] ?? 0) + 1; });
      if (!c.accountNonLocked) bloqueadas++;
    });
    return { porRol, bloqueadas };
  }, [cuentas]);

  // Todas las carreras del catalogo (aunque tengan 0) + los alumnos sin carrera
  const porCarrera = useMemo(() => {
    const estudiantes = estudiantesQ.data?.estudiantes ?? [];
    const mapa = new Map((carrerasQ.data ?? []).map(c => [c.carrera, 0]));
    estudiantes.forEach(e => {
      const nombre = e.carrera?.carrera ?? SIN_CARRERA;
      mapa.set(nombre, (mapa.get(nombre) ?? 0) + 1);
    });
    return [...mapa.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .filter(f => f.nombre !== SIN_CARRERA || f.cantidad > 0)
      .sort((a, b) => (a.nombre === SIN_CARRERA) - (b.nombre === SIN_CARRERA) || b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre));
  }, [estudiantesQ.data, carrerasQ.data]);

  const totalEstudiantes = estudiantesQ.data?.estudiantes.length ?? 0;
  const incompleto = (estudiantesQ.data?.total ?? 0) > totalEstudiantes;
  const cargando = cuentasQ.isLoading || estudiantesQ.isLoading || carrerasQ.isLoading;
  const conError = [cuentasQ, estudiantesQ, carrerasQ].find(q => q.isError);
  const recargar = () => { cuentasQ.refetch(); estudiantesQ.refetch(); carrerasQ.refetch(); };
  const valor = (n) => (cargando ? '—' : formatoNumero.format(n));

  return (
    <div className='flex-1 p-6 md:p-8 bg-gray-50 min-w-0'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='font-display text-2xl font-bold text-gray-900'>Dashboard</h2>
            <p className='text-sm text-gray-500'>Resumen de las cuentas y los estudiantes de la plataforma</p>
          </div>
          <button
            type='button'
            onClick={recargar}
            className='flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100'
          >
            <IoRefreshOutline className={`size-4 ${cuentasQ.isFetching || estudiantesQ.isFetching ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        {conError && (
          <div className='flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-800'>
            <IoAlertCircleOutline className='size-5 shrink-0' />
            <p className='flex-1'>{obtenerMensajeError(conError.error, 'No se pudieron cargar algunos datos del dashboard')}</p>
            <button type='button' onClick={recargar} className='font-semibold underline'>Reintentar</button>
          </div>
        )}

        {/* Cifras */}
        <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
          <Tarjeta icono={IoPeopleOutline} etiqueta='Cuentas' valor={valor(cuentas.length)} detalle={`${conteo.porRol.ADMIN} administradores`} />
          <Tarjeta icono={IoSchoolOutline} etiqueta='Estudiantes' valor={valor(conteo.porRol.STUDENT)} acento='bg-green-50 text-green-700' />
          <Tarjeta icono={IoLibraryOutline} etiqueta='Docentes' valor={valor(conteo.porRol.TEACHER)} acento='bg-blue-50 text-blue-700' />
          <Tarjeta icono={IoBriefcaseOutline} etiqueta='Reclutadores' valor={valor(conteo.porRol.RECRUITER)} acento='bg-purple-50 text-purple-700' />
          <Tarjeta
            icono={IoLockClosedOutline}
            etiqueta='Cuentas bloqueadas'
            valor={valor(conteo.bloqueadas)}
            acento={conteo.bloqueadas ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}
            detalle={<>Ver usuarios <IoChevronForward className='size-3' /></>}
            onClick={onVerUsuarios}
          />
        </div>

        {/* Estudiantes por carrera */}
        <section className='bg-white rounded-2xl border border-gray-200 p-6'>
          <div className='flex flex-wrap items-start justify-between gap-3 mb-5'>
            <div>
              <h3 className='font-display text-lg font-semibold text-gray-900'>Estudiantes por carrera</h3>
              <p className='text-sm text-gray-500'>{valor(totalEstudiantes)} estudiantes con perfil</p>
            </div>
            <button
              type='button'
              onClick={() => setVerTabla(v => !v)}
              className='text-sm font-medium text-green-700 hover:underline'
            >
              {verTabla ? 'Ver gráfica' : 'Ver como tabla'}
            </button>
          </div>

          {cargando ? (
            <p className='py-8 text-center text-sm text-gray-500'>Cargando...</p>
          ) : porCarrera.length === 0 ? (
            <p className='py-8 text-center text-sm text-gray-500'>Todavía no hay carreras ni estudiantes registrados.</p>
          ) : verTabla ? (
            <table className='w-full text-sm'>
              <thead className='text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200'>
                <tr><th className='py-2'>Carrera</th><th className='py-2 text-right'>Estudiantes</th><th className='py-2 text-right'>%</th></tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {porCarrera.map(f => (
                  <tr key={f.nombre}>
                    <td className='py-2 text-gray-700'>{f.nombre}</td>
                    <td className='py-2 text-right tabular-nums text-gray-900'>{formatoNumero.format(f.cantidad)}</td>
                    <td className='py-2 text-right tabular-nums text-gray-500'>{totalEstudiantes ? Math.round((f.cantidad / totalEstudiantes) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <BarrasPorCarrera filas={porCarrera} total={totalEstudiantes} />
          )}

          {incompleto && (
            <p className='mt-4 text-xs text-amber-700'>
              Se muestran los primeros {formatoNumero.format(totalEstudiantes)} de {formatoNumero.format(estudiantesQ.data.total)} estudiantes.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManagerDashboard;
