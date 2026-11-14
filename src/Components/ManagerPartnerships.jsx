import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IoSearchOutline, IoAlertCircleOutline, IoBusinessOutline, IoCalendarOutline, IoTimeOutline, IoDocumentTextOutline,
  IoCloseSharp, IoPowerOutline, IoRefreshOutline, IoWarningOutline, IoOpenOutline
} from 'react-icons/io5';
import { toast } from 'sonner';
import { SlPencil } from 'react-icons/sl';
import PartnershipForm from './PartnershipForm';
import { useAppSelector } from '../Hooks/store';
import { useGetPartnershipsQuery, useChangePartnershipStatusMutation } from '../services/partnerships';
import { useGetCompaniesQuery } from '../services/company';
import { obtenerMensajeError } from '../helpers';
import {
  ESTADOS_CONVENIO, estadoConvenio, diasParaVencer, vencePronto, formatearFechaCorta, DIAS_AVISO_VENCIMIENTO
} from '../helpers/convenios';
import { hoyISO } from '../helpers/vacantes';

const PESTANAS = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'vigentes', etiqueta: 'Vigentes' },
  { valor: 'no-vigentes', etiqueta: 'No vigentes' },
];

const Resumen = ({ etiqueta, valor, detalle, acento }) => (
  <div className='bg-white rounded-2xl border border-gray-200 p-4'>
    <p className='text-xs font-medium text-gray-500'>{etiqueta}</p>
    <p className={`mt-1 font-display text-2xl font-bold ${acento ?? 'text-gray-900'}`}>{valor}</p>
    {detalle && <p className='mt-0.5 text-xs text-gray-500'>{detalle}</p>}
  </div>
);

// Lo que pasa al desactivar (UserDetailsServiceImpl, CompanyProfileServiceImpl, PostJobServiceImpl, PersonaServiceImpl)
const EFECTOS_DESACTIVAR = [
  'La cuenta de empresa y sus reclutadores ya no podrán iniciar sesión.',
  'Su página dejará de verse y saldrá de la lista de convenios de Inicio.',
  'Sus vacantes dejarán de verse y no podrá publicar nuevas.',
  'No se borra nada: al reactivarlo todo vuelve a estar disponible.',
];

// Confirmacion para activar o desactivar. Al reactivar un convenio vencido se ofrece editar las fechas
const ConfirmarEstado = ({ convenio, onCerrar, onEditarFechas }) => {
  const { userToken } = useAppSelector(state => state.users);
  const [cambiarEstado, { isLoading }] = useChangePartnershipStatusMutation();
  const activar = !convenio.activo;
  const yaVencio = activar && convenio.fechaFinal && convenio.fechaFinal < hoyISO();

  const confirmar = async (editarDespues) => {
    try {
      await cambiarEstado({ id: convenio.idCorporacion, activo: activar, token: userToken }).unwrap();
      toast.success(activar ? `Convenio con ${convenio.nombreEmpresa} activado` : `Convenio con ${convenio.nombreEmpresa} desactivado`);
      if (editarDespues) onEditarFechas({ ...convenio, activo: true });
      else onCerrar();
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo cambiar el estado del convenio'));
    }
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div role='dialog' aria-modal='true' className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
        <div className='p-6'>
          <div className='flex items-start gap-3'>
            <div className={`p-2.5 rounded-full shrink-0 ${activar ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {activar ? <IoRefreshOutline className='size-6' /> : <IoPowerOutline className='size-6' />}
            </div>
            <div className='min-w-0'>
              <h3 className='text-lg font-bold text-gray-900'>
                {activar ? 'Activar' : 'Desactivar'} el convenio con {convenio.nombreEmpresa}
              </h3>
              {activar
                ? <p className='mt-1 text-sm text-gray-600'>La empresa y sus reclutadores podrán volver a entrar, y su página y vacantes se verán de nuevo.</p>
                : <ul className='mt-2 space-y-1.5 text-sm text-gray-600 list-disc pl-4'>
                  {EFECTOS_DESACTIVAR.map(t => <li key={t}>{t}</li>)}
                </ul>}
            </div>
          </div>

          {yaVencio && (
            <div className='mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800'>
              <IoWarningOutline className='size-5 shrink-0' />
              <p>
                Este convenio terminó el {formatearFechaCorta(convenio.fechaFinal)}. Aunque lo actives seguirá <b>vencido</b> hasta
                que extiendas la fecha de término.
              </p>
            </div>
          )}
        </div>

        <div className='flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50'>
          <button
            type='button'
            onClick={onCerrar}
            disabled={isLoading}
            className='px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm disabled:opacity-50'
          >
            Cancelar
          </button>
          {yaVencio && (
            <button
              type='button'
              onClick={() => confirmar(false)}
              disabled={isLoading}
              className='px-4 py-2.5 border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 font-semibold text-sm disabled:opacity-50'
            >
              Solo activar
            </button>
          )}
          <button
            type='button'
            onClick={() => confirmar(yaVencio)}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 ${activar ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isLoading ? 'Guardando...' : yaVencio ? 'Activar y extender fechas' : activar ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const textoVencimiento = (dias) =>
  dias === 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `Vence en ${dias} días`;

// Convenios con empresas (solo ADMIN): lista con estado, busqueda y pestañas por vigencia
const ManagerPartnerships = () => {
  const { userToken } = useAppSelector(state => state.users);
  const { data, isLoading, isError, error, refetch } = useGetPartnershipsQuery({ token: userToken }, { skip: !userToken });
  // Logos: solo vienen en el perfil publico (convenios vigentes)
  const { data: empresas } = useGetCompaniesQuery();

  const [busqueda, setBusqueda] = useState('');
  const [pestana, setPestana] = useState('todos');
  const [enEdicion, setEnEdicion] = useState(null); // convenio que se esta editando
  const [cambiandoEstado, setCambiandoEstado] = useState(null); // convenio a activar/desactivar

  const convenios = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const logos = useMemo(
    () => new Map((Array.isArray(empresas) ? empresas : []).map(e => [e.idCorporacion, e.logo])),
    [empresas]
  );

  const conteo = useMemo(() => {
    const vigentes = convenios.filter(c => c.vigente).length;
    return {
      total: convenios.length,
      vigentes,
      noVigentes: convenios.length - vigentes,
      vencenPronto: convenios.filter(vencePronto).length,
    };
  }, [convenios]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return convenios
      .filter(c => pestana === 'todos' || (pestana === 'vigentes' ? c.vigente : !c.vigente))
      .filter(c => !texto || [c.nombreEmpresa, c.categoria, c.tipoAcuerdo].some(v => v?.toLowerCase().includes(texto)))
      .sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa, 'es'));
  }, [convenios, busqueda, pestana]);

  const totalPestana = { todos: conteo.total, vigentes: conteo.vigentes, 'no-vigentes': conteo.noVigentes };

  return (
    <div className='flex-1 p-6 md:p-8 bg-gray-50 min-w-0'>
      <div className='max-w-4xl mx-auto space-y-4'>
        <div>
          <h2 className='font-display text-2xl font-bold text-gray-900'>Convenios</h2>
          <p className='text-sm text-gray-500'>Empresas con convenio con la universidad. Solo las vigentes aparecen para los estudiantes.</p>
        </div>

        {/* Resumen */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          <Resumen etiqueta='Total' valor={isLoading ? '–' : conteo.total} />
          <Resumen etiqueta='Vigentes' valor={isLoading ? '–' : conteo.vigentes} acento='text-green-700' />
          <Resumen etiqueta='No vigentes' valor={isLoading ? '–' : conteo.noVigentes} detalle='Inactivos, vencidos o por iniciar' />
          <Resumen
            etiqueta='Vencen pronto'
            valor={isLoading ? '–' : conteo.vencenPronto}
            detalle={`En los próximos ${DIAS_AVISO_VENCIMIENTO} días`}
            acento={conteo.vencenPronto ? 'text-amber-600' : undefined}
          />
        </div>

        {/* Lista */}
        <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
          <div className='p-4 border-b border-gray-100 space-y-3'>
            <div className='relative'>
              <IoSearchOutline className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400' />
              <input
                type='search'
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder='Buscar por empresa, categoría o tipo de acuerdo'
                className='w-full h-10 pl-10 pr-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-green-500'
              />
            </div>
            <div className='flex flex-wrap gap-2'>
              {PESTANAS.map(p => (
                <button
                  key={p.valor}
                  type='button'
                  onClick={() => setPestana(p.valor)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${pestana === p.valor
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'}`}
                >
                  {p.etiqueta}
                  {!isLoading && <span className={`ml-1.5 ${pestana === p.valor ? 'text-green-100' : 'text-gray-400'}`}>{totalPestana[p.valor]}</span>}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <ul className='divide-y divide-gray-100 animate-pulse'>
              {[...Array(4)].map((_, i) => (
                <li key={i} className='flex items-center gap-4 p-4'>
                  <div className='size-12 rounded-xl bg-gray-200' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-48 rounded bg-gray-200' />
                    <div className='h-3 w-64 rounded bg-gray-200' />
                  </div>
                </li>
              ))}
            </ul>
          ) : isError ? (
            <div className='p-10 flex flex-col items-center gap-3 text-center'>
              <IoAlertCircleOutline className='size-8 text-red-500' />
              <p className='text-sm text-gray-700'>{obtenerMensajeError(error, 'No se pudieron cargar los convenios')}</p>
              <button type='button' onClick={refetch} className='px-4 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700'>Reintentar</button>
            </div>
          ) : visibles.length === 0 ? (
            <p className='p-10 text-center text-sm text-gray-500'>
              {convenios.length === 0
                ? 'Todavía no hay convenios registrados.'
                : busqueda.trim() ? 'Ningún convenio coincide con la búsqueda.' : 'No hay convenios en esta pestaña.'}
            </p>
          ) : (
            <ul className='divide-y divide-gray-100'>
              {visibles.map(convenio => {
                const estado = ESTADOS_CONVENIO[estadoConvenio(convenio)];
                const logo = logos.get(convenio.idCorporacion);
                const dias = diasParaVencer(convenio);
                return (
                  <li key={convenio.idCorporacion} className='flex items-start gap-4 p-4'>
                    <div className='size-12 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden'>
                      {logo
                        ? <img src={logo} alt={`Logo de ${convenio.nombreEmpresa}`} className='size-full object-contain' />
                        : <div className='size-full flex items-center justify-center bg-gray-100 text-gray-400'>
                          <IoBusinessOutline className='size-6' />
                        </div>}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-semibold text-gray-900'>{convenio.nombreEmpresa}</p>
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${estado.color}`}>{estado.etiqueta}</span>
                        {vencePronto(convenio) && (
                          <span className='flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700'>
                            <IoTimeOutline className='size-3.5' /> {textoVencimiento(dias)}
                          </span>
                        )}
                      </div>
                      {convenio.categoria && <p className='mt-0.5 text-sm text-gray-600'>{convenio.categoria}</p>}
                      <div className='mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500'>
                        <span className='flex items-center gap-1.5'>
                          <IoCalendarOutline className='size-4' />
                          {formatearFechaCorta(convenio.fechaInicio)} – {convenio.fechaFinal ? formatearFechaCorta(convenio.fechaFinal) : 'Sin fecha de término'}
                        </span>
                        {convenio.tipoAcuerdo && (
                          <span className='flex items-center gap-1.5'>
                            <IoDocumentTextOutline className='size-4' /> {convenio.tipoAcuerdo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-1 shrink-0'>
                    {/* Solo los vigentes tienen pagina publica (los demas dan 404). Pestaña nueva para no salir del panel */}
                    {convenio.vigente && (
                      <Link
                        to={`/Empresa/${convenio.idCorporacion}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`Ver la página de ${convenio.nombreEmpresa}`}
                        title='Ver página de la empresa'
                        className='p-2 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors'
                      >
                        <IoOpenOutline className='size-4' />
                      </Link>
                    )}
                    <button
                      type='button'
                      onClick={() => setCambiandoEstado(convenio)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${convenio.activo
                        ? 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                        : 'border-green-600 text-green-700 hover:bg-green-50'}`}
                    >
                      {convenio.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type='button'
                      onClick={() => setEnEdicion(convenio)}
                      aria-label={`Editar convenio con ${convenio.nombreEmpresa}`}
                      title='Editar'
                      className='p-2 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors'
                    >
                      <SlPencil className='size-4' />
                    </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {cambiandoEstado && (
        <ConfirmarEstado
          convenio={cambiandoEstado}
          onCerrar={() => setCambiandoEstado(null)}
          onEditarFechas={(convenio) => { setCambiandoEstado(null); setEnEdicion(convenio); }}
        />
      )}

      {enEdicion && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-extrabold text-gray-900'>Editar convenio</h2>
              <button
                type='button'
                onClick={() => setEnEdicion(null)}
                className='p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors'
                aria-label='Cerrar'
              >
                <IoCloseSharp className='size-6' />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto px-6 py-5'>
              {/* key: cada convenio arranca con sus propios valores */}
              <PartnershipForm
                key={enEdicion.idCorporacion}
                convenio={enEdicion}
                onGuardado={() => setEnEdicion(null)}
                onCancelar={() => setEnEdicion(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPartnerships;
