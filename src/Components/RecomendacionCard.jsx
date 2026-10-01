import React, { useEffect, useRef, useState } from 'react'
import { IoEllipsisHorizontal, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useAppSelector } from '../Hooks/store'
import { useDeleteRecomendationMutation } from '../services/recomentationStudent'
import { formatearFechaCorta, obtenerMensajeError } from '../helpers'

const FOTO_DEFAULT = 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'

/**
 * modo "recibida": la ve el estudiante, muestra al maestro que lo recomendo
 * modo "dada": la ve el maestro en su perfil, muestra al alumno que recomendo
 * puedeGestionar: el maestro autenticado es el autor (puede editar y eliminar)
 */
const RecomendacionCard = ({ recomendacion, modo = 'recibida', puedeGestionar, onEdit, onGuardado }) => {
  const { comentario, fechaRecomendacion, maestro, estudiante } = recomendacion
  const persona = modo === 'dada' ? estudiante : maestro
  const { userToken } = useAppSelector(state => state.users)
  const [eliminar, { isLoading: eliminando }] = useDeleteRecomendationMutation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuAbierto) return
    const cerrar = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [menuAbierto])

  const handleEliminar = async () => {
    try {
      await eliminar({ idStudent: estudiante?.id ?? recomendacion.id?.idStudent, token: userToken }).unwrap()
      await onGuardado?.()
      toast.success('Recomendación eliminada')
    } catch (err) {
      toast.error(obtenerMensajeError(err, 'No se pudo eliminar la recomendación'))
      setConfirmarEliminar(false)
    }
  }

  return (
    <article className='p-5 bg-white border border-gray-200 rounded-2xl shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3 min-w-0'>
          <img className='size-12 shrink-0 rounded-full object-cover' src={persona?.imagen || FOTO_DEFAULT} alt='' />
          <div className='min-w-0'>
            <p className='text-xs text-gray-500'>{modo === 'dada' ? 'Recomendaste a' : 'Te recomendó'}</p>
            <h3 className='font-semibold text-gray-900 truncate'>{persona?.nombre} {persona?.apellido}</h3>
            {fechaRecomendacion && <p className='text-xs text-gray-400'>{formatearFechaCorta(fechaRecomendacion)}</p>}
          </div>
        </div>

        {puedeGestionar && (
          <div ref={menuRef} className='relative'>
            <button
              type='button'
              onClick={() => setMenuAbierto(v => !v)}
              className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100'
              aria-label='Opciones de la recomendación'
            >
              <IoEllipsisHorizontal className='size-5' />
            </button>
            {menuAbierto && (
              <div className='absolute right-0 mt-1 w-40 py-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10'>
                <button
                  type='button'
                  onClick={() => { setMenuAbierto(false); onEdit() }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                >
                  <IoPencilOutline className='size-4' /> Editar
                </button>
                <button
                  type='button'
                  onClick={() => { setMenuAbierto(false); setConfirmarEliminar(true) }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                >
                  <IoTrashOutline className='size-4' /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <blockquote className='mt-4 pl-4 border-l-4 border-green-200 text-gray-700 whitespace-pre-line break-words'>
        {comentario}
      </blockquote>

      {confirmarEliminar && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6'>
            <h3 className='text-lg font-bold text-gray-900'>¿Eliminar tu recomendación?</h3>
            <p className='text-sm text-gray-500 mt-1'>
              Ya no aparecerá en el perfil de {estudiante?.nombre ?? 'este estudiante'}.
            </p>
            <div className='flex justify-end gap-3 mt-6'>
              <button
                type='button'
                onClick={() => setConfirmarEliminar(false)}
                disabled={eliminando}
                className='px-4 py-2 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={handleEliminar}
                disabled={eliminando}
                className='px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50'
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default RecomendacionCard
