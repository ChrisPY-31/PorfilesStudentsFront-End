import React, { useEffect, useRef, useState } from 'react'
import { IoEllipsisHorizontal, IoPencilOutline, IoTrashOutline, IoLogoGithub, IoOpenOutline, IoCalendarOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../Hooks/store'
import { useUserAccount } from '../Hooks/useUserAccount'
import { useDeleteProjectStudentMutation } from '../services/projectsUser'
import { formatearMesAnio, obtenerMensajeError } from '../helpers'

const FOTO_DEFAULT = 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'

// `autor` es opcional: se muestra en la pagina de exploracion de proyectos
const ProyectsCard = ({ proyecto, myAccount, onEdit, autor }) => {
    const { nombre, descripcion, imagen, fechaInicio, fechaFin, github, deploy, menciones = [], tecnologias = [] } = proyecto
    const { username, userToken } = useAppSelector(state => state.users)
    const { getUserByUsername, getIdUser } = useUserAccount()
    const navigate = useNavigate()
    const [deleteProject, { isLoading: eliminando }] = useDeleteProjectStudentMutation()
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

    const periodo = fechaInicio
        ? `${formatearMesAnio(fechaInicio)} – ${fechaFin ? formatearMesAnio(fechaFin) : 'actual'}`
        : ''

    const verPerfil = () => {
        navigate(`/Person/${autor.id}`)
        localStorage.setItem('idPerson', autor.id)
        getIdUser(autor.id)
    }

    const handleEliminar = async () => {
        try {
            await deleteProject({ token: userToken, idProject: proyecto.idProject }).unwrap()
            await getUserByUsername(username, userToken).catch(() => {})
            toast.success('Proyecto eliminado')
        } catch (err) {
            toast.error(obtenerMensajeError(err, 'No se pudo eliminar el proyecto'))
            setConfirmarEliminar(false)
        }
    }

    return (
        <article className='flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
            {imagen && (
                <div className='md:w-64 shrink-0 aspect-video md:aspect-auto bg-gray-100'>
                    <img className='size-full object-cover' src={imagen} alt={`Imagen de ${nombre}`} />
                </div>
            )}

            <div className='flex-1 min-w-0 p-5 flex flex-col gap-3'>
                {autor && (
                    <button type='button' onClick={verPerfil} className='flex items-center gap-2 self-start group'>
                        <img className='size-7 rounded-full object-cover' src={autor.imagen || FOTO_DEFAULT} alt='' />
                        <span className='text-sm font-medium text-gray-700 group-hover:text-green-700 group-hover:underline'>
                            {autor.nombre} {autor.apellido}
                        </span>
                    </button>
                )}
                <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                        <h3 className='text-xl font-bold text-gray-900 break-words'>{nombre}</h3>
                        {periodo && (
                            <p className='flex items-center gap-1 mt-0.5 text-xs text-gray-500'>
                                <IoCalendarOutline className='size-3.5' /> {periodo}
                            </p>
                        )}
                    </div>

                    {myAccount && (
                        <div ref={menuRef} className='relative'>
                            <button
                                type='button'
                                onClick={() => setMenuAbierto(v => !v)}
                                className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100'
                                aria-label='Opciones del proyecto'
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

                {descripcion && <p className='text-sm text-gray-700 whitespace-pre-line break-words'>{descripcion}</p>}

                {tecnologias?.length > 0 && (
                    <div className='flex flex-wrap gap-1.5'>
                        {tecnologias.map(t => (
                            <span key={t.idTecnologia} className='px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium'>
                                {t.nombre}
                            </span>
                        ))}
                    </div>
                )}

                <div className='mt-auto flex flex-wrap items-center justify-between gap-3 pt-1'>
                    {menciones?.length > 0 ? (
                        <div className='flex items-center gap-2'>
                            <div className='flex -space-x-2'>
                                {menciones.slice(0, 5).map(m => (
                                    <img
                                        key={m.id}
                                        className='size-8 rounded-full object-cover border-2 border-white'
                                        src={m.imagen || FOTO_DEFAULT}
                                        alt={`${m.nombre} ${m.apellido}`}
                                        title={`${m.nombre} ${m.apellido}`}
                                    />
                                ))}
                            </div>
                            <span className='text-xs text-gray-500'>
                                {menciones.length === 1 ? `Con ${menciones[0].nombre}` : `${menciones.length} colaboradores`}
                            </span>
                        </div>
                    ) : <span />}

                    <div className='flex gap-2'>
                        {github && (
                            <a href={github} target='_blank' rel='noopener noreferrer'
                                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50'>
                                <IoLogoGithub className='size-4' /> Código
                            </a>
                        )}
                        {deploy && (
                            <a href={deploy} target='_blank' rel='noopener noreferrer'
                                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700'>
                                <IoOpenOutline className='size-4' /> Ver demo
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {confirmarEliminar && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
                    <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6'>
                        <h3 className='text-lg font-bold text-gray-900'>¿Eliminar "{nombre}"?</h3>
                        <p className='text-sm text-gray-500 mt-1'>El proyecto se borrará de tu perfil. No se puede deshacer.</p>
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

export default ProyectsCard
