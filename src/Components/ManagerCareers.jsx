import React, { useMemo, useState } from 'react';
import { IoAdd, IoSearchOutline, IoTrashOutline, IoCheckmark, IoCloseSharp, IoAlertCircleOutline, IoSchoolOutline } from 'react-icons/io5';
import { SlPencil } from 'react-icons/sl';
import { toast } from 'sonner';
import { useAppSelector } from '../Hooks/store';
import {
  useGetCareersQuery,
  useGetEstudiantesResumenQuery,
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
} from '../services/UserSlice';
import { obtenerMensajeError } from '../helpers';

const MAX_NOMBRE = 100;
const normalizar = (texto) => texto.trim().replace(/\s+/g, ' ');

// Catalogo de carreras (solo ADMIN): crear, renombrar y eliminar las que no tienen alumnos
const ManagerCareers = () => {
  const { userToken } = useAppSelector(state => state.users);
  const omitir = { skip: !userToken };
  const { data: carreras = [], isLoading, isError, error, refetch } = useGetCareersQuery({ token: userToken }, omitir);
  const estudiantesQ = useGetEstudiantesResumenQuery({ token: userToken }, omitir);
  const [crearCarrera, { isLoading: creando }] = useCreateCareerMutation();
  const [actualizarCarrera, { isLoading: guardando }] = useUpdateCareerMutation();
  const [eliminarCarrera, { isLoading: eliminando }] = useDeleteCareerMutation();

  const [busqueda, setBusqueda] = useState('');
  const [nueva, setNueva] = useState('');
  const [errorNueva, setErrorNueva] = useState('');
  const [editando, setEditando] = useState(null); // { idCarrera, nombre }
  const [errorEdicion, setErrorEdicion] = useState('');
  const [porEliminar, setPorEliminar] = useState(null);

  // Alumnos por carrera. Si no se pudo contar a todos, no se permite eliminar (seria a ciegas)
  const alumnosPorCarrera = useMemo(() => {
    const conteo = new Map();
    (estudiantesQ.data?.estudiantes ?? []).forEach(e => {
      const id = e.carrera?.idCarrera;
      if (id != null) conteo.set(id, (conteo.get(id) ?? 0) + 1);
    });
    return conteo;
  }, [estudiantesQ.data]);
  const conteoConfiable = estudiantesQ.isSuccess && estudiantesQ.data.total <= estudiantesQ.data.estudiantes.length;

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return [...carreras]
      .filter(c => !texto || c.carrera.toLowerCase().includes(texto))
      .sort((a, b) => a.carrera.localeCompare(b.carrera));
  }, [carreras, busqueda]);

  // El back solo revisa duplicados al crear; al renombrar se valida aqui
  const validarNombre = (nombre, idActual) => {
    if (!nombre) return 'Escribe el nombre de la carrera';
    if (nombre.length > MAX_NOMBRE) return `Máximo ${MAX_NOMBRE} caracteres`;
    const repetida = carreras.some(c => c.idCarrera !== idActual && c.carrera.toLowerCase() === nombre.toLowerCase());
    return repetida ? 'Ya existe una carrera con ese nombre' : '';
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const nombre = normalizar(nueva);
    const problema = validarNombre(nombre, null);
    if (problema) { setErrorNueva(problema); return; }
    try {
      await crearCarrera({ carrera: nombre, token: userToken }).unwrap();
      toast.success(`Carrera "${nombre}" creada`);
      setNueva('');
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo crear la carrera'));
    }
  };

  const handleGuardarEdicion = async () => {
    const nombre = normalizar(editando.nombre);
    const original = carreras.find(c => c.idCarrera === editando.idCarrera)?.carrera;
    if (nombre === original) { setEditando(null); return; }
    const problema = validarNombre(nombre, editando.idCarrera);
    if (problema) { setErrorEdicion(problema); return; }
    try {
      await actualizarCarrera({ idCarrera: editando.idCarrera, carrera: nombre, token: userToken }).unwrap();
      toast.success('Carrera actualizada');
      setEditando(null);
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo actualizar la carrera'));
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarCarrera({ idCarrera: porEliminar.idCarrera, token: userToken }).unwrap();
      toast.success(`Carrera "${porEliminar.carrera}" eliminada`);
      setPorEliminar(null);
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo eliminar la carrera'));
    }
  };

  const motivoNoEliminar = (carrera) => {
    if (!conteoConfiable) return 'No se pudo verificar si tiene alumnos';
    const alumnos = alumnosPorCarrera.get(carrera.idCarrera) ?? 0;
    return alumnos > 0 ? `No se puede eliminar: tiene ${alumnos} ${alumnos === 1 ? 'alumno' : 'alumnos'}` : '';
  };

  return (
    <div className='flex-1 p-6 md:p-8 bg-gray-50 min-w-0'>
      <div className='max-w-3xl mx-auto space-y-4'>
        <div>
          <h2 className='font-display text-2xl font-bold text-gray-900'>Carreras</h2>
          <p className='text-sm text-gray-500'>{carreras.length} carreras en el catálogo. Solo se pueden eliminar las que no tienen alumnos.</p>
        </div>

        {/* Nueva carrera */}
        <form onSubmit={handleCrear} className='bg-white rounded-2xl border border-gray-200 p-4'>
          <label htmlFor='nueva-carrera' className='block text-sm font-medium text-gray-700 mb-1.5'>Agregar carrera</label>
          <div className='flex gap-2'>
            <input
              id='nueva-carrera'
              value={nueva}
              onChange={e => { setNueva(e.target.value); setErrorNueva(''); }}
              maxLength={MAX_NOMBRE}
              placeholder='Ej. Ingeniería en Ciberseguridad'
              className={`flex-1 h-11 px-3 rounded-xl border-2 text-sm outline-none ${errorNueva ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
            />
            <button
              type='submit'
              disabled={creando}
              className='flex items-center gap-1.5 px-4 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
            >
              <IoAdd className='size-5' /> {creando ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
          <p className='mt-1 min-h-5 text-sm text-red-600'>{errorNueva}</p>
        </form>

        {/* Lista */}
        <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
          <div className='p-4 border-b border-gray-100'>
            <div className='relative'>
              <IoSearchOutline className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400' />
              <input
                type='search'
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder='Buscar carrera'
                className='w-full h-10 pl-10 pr-3 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-green-500'
              />
            </div>
            {estudiantesQ.isError && (
              <p className='mt-3 flex items-center gap-2 text-xs text-amber-700'>
                <IoAlertCircleOutline className='size-4' /> No se pudo contar a los alumnos; eliminar está desactivado.
              </p>
            )}
          </div>

          {isLoading ? (
            <p className='p-10 text-center text-sm text-gray-500'>Cargando carreras...</p>
          ) : isError ? (
            <div className='p-10 flex flex-col items-center gap-3 text-center'>
              <IoAlertCircleOutline className='size-8 text-red-500' />
              <p className='text-sm text-gray-700'>{obtenerMensajeError(error, 'No se pudieron cargar las carreras')}</p>
              <button type='button' onClick={refetch} className='px-4 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700'>Reintentar</button>
            </div>
          ) : visibles.length === 0 ? (
            <p className='p-10 text-center text-sm text-gray-500'>
              {carreras.length ? 'Ninguna carrera coincide con la búsqueda.' : 'Todavía no hay carreras. Agrega la primera.'}
            </p>
          ) : (
            <ul className='divide-y divide-gray-100'>
              {visibles.map(carrera => {
                const enEdicion = editando?.idCarrera === carrera.idCarrera;
                const alumnos = alumnosPorCarrera.get(carrera.idCarrera) ?? 0;
                const bloqueo = motivoNoEliminar(carrera);
                return (
                  <li key={carrera.idCarrera} className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50'>
                    <span className='shrink-0 grid place-items-center size-9 rounded-xl bg-green-50 text-green-700'>
                      <IoSchoolOutline className='size-5' />
                    </span>

                    {enEdicion ? (
                      <div className='flex-1 min-w-0'>
                        <input
                          autoFocus
                          value={editando.nombre}
                          maxLength={MAX_NOMBRE}
                          onChange={e => { setEditando({ ...editando, nombre: e.target.value }); setErrorEdicion(''); }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleGuardarEdicion();
                            if (e.key === 'Escape') setEditando(null);
                          }}
                          aria-label='Nuevo nombre de la carrera'
                          className={`w-full h-9 px-3 rounded-lg border-2 text-sm outline-none ${errorEdicion ? 'border-red-400 bg-red-50' : 'border-green-500'}`}
                        />
                        {errorEdicion && <p className='mt-1 text-xs text-red-600'>{errorEdicion}</p>}
                      </div>
                    ) : (
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 truncate'>{carrera.carrera}</p>
                        <p className='text-xs text-gray-500'>
                          {estudiantesQ.isSuccess ? `${alumnos} ${alumnos === 1 ? 'alumno' : 'alumnos'}` : '—'}
                        </p>
                      </div>
                    )}

                    <div className='flex items-center gap-1'>
                      {enEdicion ? (
                        <>
                          <button type='button' onClick={handleGuardarEdicion} disabled={guardando} title='Guardar' aria-label='Guardar'
                            className='p-2 rounded-lg text-green-700 hover:bg-green-50 disabled:opacity-50'>
                            <IoCheckmark className='size-5' />
                          </button>
                          <button type='button' onClick={() => setEditando(null)} disabled={guardando} title='Cancelar' aria-label='Cancelar'
                            className='p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50'>
                            <IoCloseSharp className='size-5' />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type='button' onClick={() => { setEditando({ idCarrera: carrera.idCarrera, nombre: carrera.carrera }); setErrorEdicion(''); }}
                            title='Renombrar' aria-label={`Renombrar ${carrera.carrera}`}
                            className='p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100'>
                            <SlPencil className='size-4' />
                          </button>
                          <button type='button' onClick={() => setPorEliminar(carrera)} disabled={!!bloqueo}
                            title={bloqueo || 'Eliminar'} aria-label={bloqueo || `Eliminar ${carrera.carrera}`}
                            className='p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:cursor-not-allowed'>
                            <IoTrashOutline className='size-5' />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {porEliminar && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6'>
            <h3 className='text-lg font-bold text-gray-900'>¿Eliminar "{porEliminar.carrera}"?</h3>
            <p className='mt-2 text-sm text-gray-600'>No tiene alumnos. Dejará de aparecer al crear cuentas y en los filtros. Esta acción no se puede deshacer.</p>
            <div className='mt-6 flex justify-end gap-2'>
              <button type='button' onClick={() => setPorEliminar(null)} disabled={eliminando}
                className='px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50'>
                Cancelar
              </button>
              <button type='button' onClick={handleEliminar} disabled={eliminando}
                className='px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'>
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCareers;
