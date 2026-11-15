import React, { useEffect, useState } from 'react';
import Paginacion from './Paginacion';
import { POR_PAGINA } from '../helpers/paginacion';
import { Link } from 'react-router-dom';
import {
  IoCloseSharp, IoBusinessOutline, IoCalendarOutline, IoDocumentTextOutline, IoOpenOutline, IoAlertCircleOutline,
  IoPersonCircleOutline, IoMailOutline, IoAtOutline, IoPeopleOutline, IoInformationCircleOutline, IoPersonAddOutline
} from 'react-icons/io5';
import { SlPencil } from 'react-icons/sl';
import { toast } from 'sonner';
import { useAppSelector } from '../Hooks/store';
import {
  useGetCompanyAdminsQuery,
  useChangeCompanyAdminStatusMutation,
  useGetPartnershipRecruitersQuery,
  useChangeRecruiterStatusAdminMutation,
} from '../services/partnerships';
import { obtenerMensajeError } from '../helpers';
import { ESTADOS_CONVENIO, estadoConvenio, formatearFechaCorta } from '../helpers/convenios';

const Insignia = ({ activa }) => (
  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${activa
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
    {activa ? 'Activa' : 'Desactivada'}
  </span>
);

const Seccion = ({ titulo, icono: Icono, conteo, children }) => (
  <section className='rounded-2xl border border-gray-200'>
    <h3 className='flex items-center gap-2 px-4 py-3 border-b border-gray-100 font-semibold text-gray-900'>
      <Icono className='size-5 text-gray-400' /> {titulo}
      {conteo != null && <span className='text-sm font-normal text-gray-400'>{conteo}</span>}
    </h3>
    <div className='p-4'>{children}</div>
  </section>
);

const Cargando = () => (
  <div className='space-y-2 animate-pulse'>
    <div className='h-4 w-40 rounded bg-gray-200' />
    <div className='h-3 w-56 rounded bg-gray-200' />
  </div>
);

const ErrorCarga = ({ error, texto, onReintentar }) => (
  <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600'>
    <IoAlertCircleOutline className='size-5 text-red-500' />
    {obtenerMensajeError(error, texto)}
    <button type='button' onClick={onReintentar} className='font-semibold text-green-700 hover:underline'>Reintentar</button>
  </div>
);

// Datos de una persona (cuenta de empresa o reclutador)
const DatosCuenta = ({ cuenta }) => (
  <div className='min-w-0'>
    <p className='font-semibold text-gray-900'>{cuenta.nombre} {cuenta.apellido}</p>
    {cuenta.puesto && <p className='text-sm text-gray-600'>{cuenta.puesto}</p>}
    <div className='mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500'>
      <span className='flex items-center gap-1'><IoAtOutline className='size-3.5' /><span className='font-mono'>{cuenta.username}</span></span>
      {cuenta.email && <span className='flex items-center gap-1 break-all'><IoMailOutline className='size-3.5' />{cuenta.email}</span>}
    </div>
  </div>
);

// Confirmacion encima del detalle
const Confirmar = ({ titulo, texto, accion, peligro, cargando, onConfirmar, onCancelar }) => (
  <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4'>
    <div role='dialog' aria-modal='true' className='w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6'>
      <h4 className='text-lg font-bold text-gray-900'>{titulo}</h4>
      <p className='mt-2 text-sm text-gray-600'>{texto}</p>
      <div className='mt-5 flex justify-end gap-3'>
        <button type='button' onClick={onCancelar} disabled={cargando}
          className='px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50'>
          Cancelar
        </button>
        <button type='button' onClick={onConfirmar} disabled={cargando}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 ${peligro ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
          {cargando ? 'Guardando...' : accion}
        </button>
      </div>
    </div>
  </div>
);

const BotonEstado = ({ activa, onClick, deshabilitado, motivo }) => (
  <button
    type='button'
    onClick={onClick}
    disabled={deshabilitado}
    title={deshabilitado ? motivo : undefined}
    className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${activa
      ? 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
      : 'border-green-600 text-green-700 hover:bg-green-50'}`}
  >
    {activa ? 'Desactivar' : 'Activar'}
  </button>
);

// Detalle de un convenio (solo ADMIN): datos, su cuenta de empresa y sus reclutadores.
// onEditar / onCambiarEstado abren los modales de la lista; onCrearCuenta lleva a crear la cuenta de empresa
const PartnershipDetail = ({ convenio, logo, onCerrar, onEditar, onCambiarEstado, onCrearCuenta }) => {
  const { userToken } = useAppSelector(state => state.users);
  const idCorporacion = convenio.idCorporacion;
  const estado = ESTADOS_CONVENIO[estadoConvenio(convenio)];

  const omitir = { skip: !userToken };
  // Cuenta activa (a lo mas una), cuentas anteriores y reclutadores: paginados en el back (20)
  const [paginaAnteriores, setPaginaAnteriores] = useState(0);
  const [paginaReclutadores, setPaginaReclutadores] = useState(0);
  const activaQ = useGetCompanyAdminsQuery({ token: userToken, idCorporacion, activa: true, size: 1 }, omitir);
  const anterioresQ = useGetCompanyAdminsQuery({ token: userToken, idCorporacion, activa: false, page: paginaAnteriores }, omitir);
  const reclutadoresQ = useGetPartnershipRecruitersQuery({ token: userToken, idCorporacion, page: paginaReclutadores }, omitir);
  const reclutadoresActivosQ = useGetPartnershipRecruitersQuery({ token: userToken, idCorporacion, activo: true, size: 1 }, omitir);
  const [cambiarCuenta, { isLoading: cambiandoCuenta }] = useChangeCompanyAdminStatusMutation();
  const [cambiarReclutador, { isLoading: cambiandoReclutador }] = useChangeRecruiterStatusAdminMutation();

  // { tipo: 'cuenta' | 'reclutador', persona, activar }
  const [porConfirmar, setPorConfirmar] = useState(null);

  const activa = activaQ.data?.content?.[0];
  const anteriores = anterioresQ.data?.content ?? [];
  const totalAnteriores = anterioresQ.data?.totalElements ?? 0;
  // El back ya los manda: primero los activos y luego por nombre
  const reclutadores = reclutadoresQ.data?.content ?? [];
  const totalReclutadores = reclutadoresQ.data?.totalElements ?? 0;
  const reclutadoresActivos = reclutadoresActivosQ.data?.totalElements ?? 0;
  const cuentasQ = { isLoading: activaQ.isLoading || anterioresQ.isLoading, isError: activaQ.isError || anterioresQ.isError,
    error: activaQ.error ?? anterioresQ.error, refetch: () => { activaQ.refetch(); anterioresQ.refetch(); } };

  // Si una pagina se vacia (p. ej. al reactivar la ultima cuenta anterior) se regresa a la anterior
  useEffect(() => {
    const paginas = anterioresQ.data?.totalPages ?? 0;
    if (anterioresQ.data && paginaAnteriores > 0 && paginaAnteriores >= paginas) setPaginaAnteriores(Math.max(0, paginas - 1));
  }, [anterioresQ.data, paginaAnteriores]);

  const confirmar = async () => {
    const { tipo, persona, activar } = porConfirmar;
    const nombre = `${persona.nombre} ${persona.apellido}`.trim();
    try {
      if (tipo === 'cuenta') await cambiarCuenta({ id: persona.id, activo: activar, token: userToken }).unwrap();
      else await cambiarReclutador({ id: persona.id, activo: activar, idCorporacion, token: userToken }).unwrap();
      toast.success(`${tipo === 'cuenta' ? 'Cuenta de empresa' : 'Reclutador'} ${nombre} ${activar ? 'activado' : 'desactivado'}`);
      setPorConfirmar(null);
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo cambiar el estado'));
    }
  };

  const textoConfirmacion = () => {
    const { tipo, activar } = porConfirmar;
    if (tipo === 'cuenta') {
      return activar
        ? 'La persona podrá volver a entrar y administrar la página, vacantes y reclutadores de la empresa.'
        : 'Ya no podrá iniciar sesión ni administrar la empresa. Si tiene una sesión abierta, puede seguir hasta 30 minutos. Después podrás crear otra cuenta para el convenio.';
    }
    return activar
      ? 'El reclutador podrá volver a entrar, publicar vacantes y responder mensajes.'
      : 'Ya no podrá iniciar sesión ni aparecer en la plataforma. La cuenta de la empresa también puede reactivarlo.';
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div role='dialog' aria-modal='true' className='w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden'>

        {/* Encabezado */}
        <div className='flex items-start gap-4 px-6 pt-5 pb-4 border-b border-gray-100'>
          <div className='size-14 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden'>
            {logo
              ? <img src={logo} alt={`Logo de ${convenio.nombreEmpresa}`} className='size-full object-contain' />
              : <div className='size-full flex items-center justify-center bg-gray-100 text-gray-400'><IoBusinessOutline className='size-7' /></div>}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='text-xl font-extrabold text-gray-900'>{convenio.nombreEmpresa}</h2>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${estado.color}`}>{estado.etiqueta}</span>
            </div>
            {convenio.categoria && <p className='text-sm text-gray-600'>{convenio.categoria}</p>}
            <div className='mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500'>
              <span className='flex items-center gap-1.5'>
                <IoCalendarOutline className='size-4' />
                {formatearFechaCorta(convenio.fechaInicio)} – {convenio.fechaFinal ? formatearFechaCorta(convenio.fechaFinal) : 'Sin fecha de término'}
              </span>
              {convenio.tipoAcuerdo && <span className='flex items-center gap-1.5'><IoDocumentTextOutline className='size-4' />{convenio.tipoAcuerdo}</span>}
            </div>
          </div>
          <button type='button' onClick={onCerrar} aria-label='Cerrar'
            className='p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors'>
            <IoCloseSharp className='size-6' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>
          {/* Acciones del convenio */}
          <div className='flex flex-wrap gap-2'>
            <button type='button' onClick={() => onEditar(convenio)}
              className='flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50'>
              <SlPencil className='size-4' /> Editar convenio
            </button>
            <button type='button' onClick={() => onCambiarEstado(convenio)}
              className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${convenio.activo
                ? 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                : 'border-green-600 text-green-700 hover:bg-green-50'}`}>
              {convenio.activo ? 'Desactivar convenio' : 'Activar convenio'}
            </button>
            {convenio.vigente && (
              <Link to={`/Empresa/${idCorporacion}`} target='_blank' rel='noopener noreferrer'
                className='flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50'>
                <IoOpenOutline className='size-4' /> Ver página
              </Link>
            )}
          </div>

          {!convenio.activo && (
            <p className='flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600'>
              <IoInformationCircleOutline className='size-5 shrink-0 text-gray-400' />
              El convenio está desactivado: la cuenta de empresa y los reclutadores no pueden iniciar sesión aunque aparezcan como activos.
            </p>
          )}

          {/* Cuenta de empresa */}
          <Seccion titulo='Cuenta de empresa' icono={IoPersonCircleOutline}>
            {cuentasQ.isLoading ? <Cargando /> : cuentasQ.isError ? (
              <ErrorCarga error={cuentasQ.error} texto='No se pudo cargar la cuenta de empresa' onReintentar={cuentasQ.refetch} />
            ) : (
              <div className='space-y-4'>
                {activa ? (
                  <div className='flex items-start gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='mb-1'><Insignia activa /></div>
                      <DatosCuenta cuenta={activa} />
                    </div>
                    <BotonEstado activa onClick={() => setPorConfirmar({ tipo: 'cuenta', persona: activa, activar: false })} />
                  </div>
                ) : (
                  <div className='flex flex-wrap items-center gap-3'>
                    <p className='flex-1 min-w-0 text-sm text-gray-500'>
                      {totalAnteriores ? 'No tiene una cuenta de empresa activa.' : 'Todavía no tiene cuenta de empresa.'}{' '}
                      La cuenta de empresa administra su página, vacantes y reclutadores.
                    </p>
                    {onCrearCuenta && (
                      <button
                        type='button'
                        onClick={() => onCrearCuenta(convenio)}
                        disabled={!convenio.activo}
                        title={!convenio.activo ? 'Activa el convenio para crearle una cuenta' : undefined}
                        className='flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      >
                        <IoPersonAddOutline className='size-4' /> Crear cuenta de empresa
                      </button>
                    )}
                  </div>
                )}

                {anteriores.length > 0 && (
                  <div className='pt-3 border-t border-gray-100'>
                    <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400'>Cuentas anteriores ({totalAnteriores})</p>
                    <ul className='space-y-3'>
                      {anteriores.map(cuenta => (
                        <li key={cuenta.id} className='flex items-start gap-3'>
                          <div className='flex-1 min-w-0'><DatosCuenta cuenta={cuenta} /></div>
                          <BotonEstado
                            activa={false}
                            onClick={() => setPorConfirmar({ tipo: 'cuenta', persona: cuenta, activar: true })}
                            deshabilitado={!!activa}
                            motivo='El convenio ya tiene una cuenta activa: desactívala primero'
                          />
                        </li>
                      ))}
                    </ul>
                    <Paginacion
                      className='mt-3'
                      pagina={paginaAnteriores}
                      totalPaginas={anterioresQ.data?.totalPages ?? 0}
                      total={totalAnteriores}
                      porPagina={POR_PAGINA}
                      onCambiar={setPaginaAnteriores}
                      cargando={anterioresQ.isFetching}
                    />
                  </div>
                )}
              </div>
            )}
          </Seccion>

          {/* Reclutadores */}
          <Seccion
            titulo='Reclutadores'
            icono={IoPeopleOutline}
            conteo={reclutadoresQ.isSuccess && totalReclutadores ? `${reclutadoresActivos} de ${totalReclutadores} activos` : null}
          >
            {reclutadoresQ.isLoading ? <Cargando /> : reclutadoresQ.isError ? (
              <ErrorCarga error={reclutadoresQ.error} texto='No se pudieron cargar los reclutadores' onReintentar={reclutadoresQ.refetch} />
            ) : reclutadores.length === 0 ? (
              <p className='text-sm text-gray-500'>La empresa aún no ha creado reclutadores. Los crea la cuenta de empresa.</p>
            ) : (
              <ul className='divide-y divide-gray-100 -my-3'>
                {reclutadores.map(r => (
                  <li key={r.id} className='flex items-start gap-3 py-3'>
                    <div className='flex-1 min-w-0'>
                      {!r.cuentaActiva && <div className='mb-1'><Insignia activa={false} /></div>}
                      <DatosCuenta cuenta={r} />
                    </div>
                    <BotonEstado
                      activa={r.cuentaActiva}
                      onClick={() => setPorConfirmar({ tipo: 'reclutador', persona: r, activar: !r.cuentaActiva })}
                      deshabilitado={!r.cuentaActiva && !convenio.activo}
                      motivo='Activa el convenio para reactivar reclutadores'
                    />
                  </li>
                ))}
              </ul>
            )}
            <Paginacion
              className='mt-4'
              pagina={paginaReclutadores}
              totalPaginas={reclutadoresQ.data?.totalPages ?? 0}
              total={totalReclutadores}
              porPagina={POR_PAGINA}
              onCambiar={setPaginaReclutadores}
              cargando={reclutadoresQ.isFetching}
            />
          </Seccion>
        </div>
      </div>

      {porConfirmar && (
        <Confirmar
          titulo={`${porConfirmar.activar ? 'Activar' : 'Desactivar'} a ${porConfirmar.persona.nombre} ${porConfirmar.persona.apellido}`}
          texto={textoConfirmacion()}
          accion={porConfirmar.activar ? 'Activar' : 'Desactivar'}
          peligro={!porConfirmar.activar}
          cargando={cambiandoCuenta || cambiandoReclutador}
          onConfirmar={confirmar}
          onCancelar={() => setPorConfirmar(null)}
        />
      )}
    </div>
  );
};

export default PartnershipDetail;
