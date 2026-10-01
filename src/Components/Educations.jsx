import React, { useEffect, useRef, useState } from 'react'
import { IoSchoolOutline, IoRibbonOutline, IoEllipsisHorizontal, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useAppSelector } from '../Hooks/store'
import { useUserAccount } from '../Hooks/useUserAccount'
import { useDeleteEducationUserMutation } from '../services/UserSlice'
import { TIPOS_EDUCACION, formatearMesAnio, obtenerMensajeError } from '../helpers'

// Cursos y diplomados llevan otro icono y color que los grados
const ESTILO_TIPO = {
    BACHELOR: { icon: IoSchoolOutline, clase: 'bg-blue-50 text-blue-600' },
    MASTER: { icon: IoSchoolOutline, clase: 'bg-purple-50 text-purple-600' },
    PHD: { icon: IoSchoolOutline, clase: 'bg-rose-50 text-rose-600' },
    DIPLOMA: { icon: IoRibbonOutline, clase: 'bg-orange-50 text-orange-600' },
    COURSE: { icon: IoRibbonOutline, clase: 'bg-green-50 text-green-600' }
}

const Educations = ({ educacion, myAccount, onEdit }) => {
    const { idEducacion, institucion, grado, fechaInicio, fechaFin, descripcion, educacionTipo } = educacion
    const { username, userToken } = useAppSelector(state => state.users)
    const { getUserByUsername } = useUserAccount()
    const [deleteEducation, { isLoading: eliminando }] = useDeleteEducationUserMutation()
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

    const { icon: Icono, clase } = ESTILO_TIPO[educacionTipo] ?? ESTILO_TIPO.BACHELOR
    const tipo = TIPOS_EDUCACION.find(t => t.value === educacionTipo)?.label
    const periodo = fechaInicio
        ? `${formatearMesAnio(fechaInicio)} – ${fechaFin ? formatearMesAnio(fechaFin) : 'actual'}`
        : ''

    const handleEliminar = async () => {
        try {
            await deleteEducation({ idEducacion, token: userToken }).unwrap()
            await getUserByUsername(username, userToken).catch(() => {})
            toast.success('Educación eliminada')
        } catch (err) {
            toast.error(obtenerMensajeError(err, 'No se pudo eliminar la educación'))
            setConfirmarEliminar(false)
        }
    }

    return (
        <div className='flex gap-4 py-4 border-b border-gray-100 last:border-b-0'>
            <div className={`shrink-0 size-12 flex items-center justify-center rounded-xl ${clase}`}>
                <Icono className='size-6' />
            </div>

            <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                        <h4 className='font-semibold text-gray-900 break-words'>{grado}</h4>
                        <p className='text-sm text-gray-700'>{institucion}</p>
                        <p className='text-xs text-gray-500 mt-0.5'>{[tipo, periodo].filter(Boolean).join(' · ')}</p>
                    </div>

                    {myAccount && (
                        <div ref={menuRef} className='relative'>
                            <button
                                type='button'
                                onClick={() => setMenuAbierto(v => !v)}
                                className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100'
                                aria-label='Opciones de la educación'
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

                {descripcion && <p className='mt-2 text-sm text-gray-600 whitespace-pre-line break-words'>{descripcion}</p>}
            </div>

            {confirmarEliminar && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
                    <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6'>
                        <h3 className='text-lg font-bold text-gray-900'>¿Eliminar esta educación?</h3>
                        <p className='text-sm text-gray-500 mt-1'>{grado} · {institucion}</p>
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
        </div>
    )
}

export default Educations
