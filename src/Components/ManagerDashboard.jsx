import React, { useMemo, useState } from 'react';
import { IoPeopleOutline, IoSchoolOutline, IoLibraryOutline, IoBriefcaseOutline, IoBusinessOutline, IoLockClosedOutline, IoAlertCircleOutline, IoRefreshOutline, IoChevronForward } from 'react-icons/io5';
import { useAppSelector } from '../Hooks/store';
import { useGetEstudiantesSummaryQuery, useGetUsersSummaryQuery } from '../services/UserSlice';
import { useGetPartnershipsSummaryQuery } from '../services/partnerships';
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

const ManagerDashboard = ({ onVerUsuarios, onVerConvenios }) => {
  const { userToken } = useAppSelector(state => state.users);
  const omitir = { skip: !userToken };
  // Conteos del back: GET /users/summary y GET /students/summary
  const cuentasQ = useGetUsersSummaryQuery({ token: userToken }, omitir);
  const estudiantesQ = useGetEstudiantesSummaryQuery({ token: userToken }, omitir);
  const conveniosQ = useGetPartnershipsSummaryQuery({ token: userToken }, omitir);
  const [verTabla, setVerTabla] = useState(false);

  const totalCuentas = cuentasQ.data?.total ?? 0;
  const porRol = cuentasQ.data?.porRol ?? {};

  // Todas las carreras del catalogo (el back incluye las que tienen 0) + los alumnos sin carrera
  const porCarrera = useMemo(() => {
    const resumen = estudiantesQ.data;
    if (!resumen) return [];
    const filas = (resumen.porCarrera ?? []).map(c => ({ nombre: c.carrera, cantidad: c.cantidad }));
    if (resumen.sinCarrera > 0) filas.push({ nombre: SIN_CARRERA, cantidad: resumen.sinCarrera });
    return filas.sort((a, b) => (a.nombre === SIN_CARRERA) - (b.nombre === SIN_CARRERA) || b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre));
  }, [estudiantesQ.data]);

  const conveniosTotal = conveniosQ.data?.total ?? 0;
  const conveniosVigentes = conveniosQ.data?.vigentes ?? 0;

  const totalEstudiantes = estudiantesQ.data?.total ?? 0;
  const cargando = cuentasQ.isLoading || estudiantesQ.isLoading;
  const conError = [cuentasQ, estudiantesQ].find(q => q.isError);
  // Los convenios no bloquean el resto: si fallan, su tarjeta muestra el guion
  const recargar = () => { cuentasQ.refetch(); estudiantesQ.refetch(); conveniosQ.refetch(); };
  const valor = (n) => (cargando ? '—' : formatoNumero.format(n ?? 0));

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
        <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'>
          <Tarjeta icono={IoPeopleOutline} etiqueta='Cuentas' valor={valor(totalCuentas)}
            detalle={onVerUsuarios ? <>Ver usuarios <IoChevronForward className='size-3' /></> : null} onClick={onVerUsuarios} />
          <Tarjeta icono={IoSchoolOutline} etiqueta='Estudiantes' valor={valor(porRol.STUDENT)} acento='bg-green-50 text-green-700' />
          <Tarjeta icono={IoLibraryOutline} etiqueta='Docentes' valor={valor(porRol.TEACHER)} acento='bg-blue-50 text-blue-700' />
          <Tarjeta icono={IoBriefcaseOutline} etiqueta='Reclutadores' valor={valor(porRol.RECRUITER)} acento='bg-purple-50 text-purple-700' />
          <Tarjeta
            icono={IoBusinessOutline}
            etiqueta='Cuentas de empresa'
            valor={valor(porRol.COMPANY_ADMIN)}
            acento='bg-amber-50 text-amber-700'
            detalle={conveniosQ.isSuccess
              ? <>{formatoNumero.format(conveniosVigentes)} de {formatoNumero.format(conveniosTotal)} convenios vigentes {onVerConvenios && <IoChevronForward className='size-3' />}</>
              : null}
            onClick={onVerConvenios}
          />
          <Tarjeta
            icono={IoLockClosedOutline}
            etiqueta='Cuentas bloqueadas'
            valor={valor(cuentasQ.data?.bloqueadas)}
            acento='bg-gray-100 text-gray-500'
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

        </section>
      </div>
    </div>
  );
};

export default ManagerDashboard;
