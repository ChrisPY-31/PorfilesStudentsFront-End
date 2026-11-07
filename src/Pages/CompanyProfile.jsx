import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SlPencil } from 'react-icons/sl'
import {
    IoCameraOutline, IoBusinessOutline, IoGlobeOutline, IoMailOutline, IoLocationOutline,
    IoPeopleOutline, IoLayersOutline, IoBriefcaseOutline, IoCheckmarkCircle, IoEllipseOutline,
    IoEyeOutline, IoOpenOutline, IoAlertCircleOutline
} from 'react-icons/io5'
import { useAppSelector } from '../Hooks/store'
import { useGetCompanyProfileQuery, useGetMyCompanyProfileQuery } from '../services/company'
import CompanyProfileForm from '../Components/CompanyProfileForm'
import CompanyImageForm from '../Components/CompanyImageForm'
import { obtenerMensajeError } from '../helpers'

// "https://www.nuuptech.com/" -> "nuuptech.com"
const dominio = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '')
    } catch {
        return url
    }
}

const Tarjeta = ({ titulo, accion, children }) => (
    <section className='bg-white rounded-2xl border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
            <h2 className='font-display text-lg font-bold text-gray-900'>{titulo}</h2>
            {accion}
        </div>
        {children}
    </section>
)

const Dato = ({ icono: Icono, etiqueta, children }) => (
    <div className='flex items-start gap-3'>
        <div className='p-2 rounded-lg bg-green-50 text-green-700 shrink-0'>
            <Icono className='size-4' />
        </div>
        <div className='min-w-0'>
            <p className='text-xs text-gray-500'>{etiqueta}</p>
            <div className='text-sm font-medium text-gray-900 break-words'>{children}</div>
        </div>
    </div>
)

// Lo que falta para que la pagina se vea completa (solo lo ve la empresa)
const PASOS = [
    { campo: 'logo', texto: 'Sube el logo', accion: 'logo' },
    { campo: 'banner', texto: 'Agrega una portada', accion: 'banner' },
    { campo: 'descripcion', texto: 'Describe a la empresa', accion: 'editar' },
    { campo: 'sector', texto: 'Indica el sector', accion: 'editar' },
    { campo: 'ubicacion', texto: 'Agrega la ubicación', accion: 'editar' },
    { campo: 'sitioWeb', texto: 'Agrega el sitio web', accion: 'editar' },
    { campo: 'correoContacto', texto: 'Agrega un correo de contacto', accion: 'editar' },
]

const Cargando = () => (
    <div className='max-w-6xl mx-auto px-4 mt-8 animate-pulse'>
        <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
            <div className='aspect-[3/1] max-h-72 w-full bg-gray-200' />
            <div className='px-6 pb-6'>
                <div className='-mt-12 size-28 rounded-2xl bg-gray-300 ring-4 ring-white' />
                <div className='mt-4 h-7 w-64 rounded bg-gray-200' />
                <div className='mt-3 h-4 w-40 rounded bg-gray-200' />
            </div>
        </div>
    </div>
)

const CompanyProfile = ({ miEmpresa = false }) => {
    const { id } = useParams()
    const { userToken } = useAppSelector(state => state.users)

    const mia = useGetMyCompanyProfileQuery({ token: userToken }, { skip: !miEmpresa || !userToken })
    const publica = useGetCompanyProfileQuery(id, { skip: miEmpresa || !id })
    const { data: perfil, isLoading, isError, error } = miEmpresa ? mia : publica

    const [editando, setEditando] = useState(false)
    const [imagen, setImagen] = useState(null) // 'logo' | 'banner'

    if (isLoading) return <Cargando />

    if (isError || !perfil) {
        return (
            <div className='max-w-xl mx-auto px-4 mt-16 text-center'>
                <div className='inline-flex p-4 rounded-full bg-red-50 text-red-500'>
                    <IoAlertCircleOutline className='size-8' />
                </div>
                <h1 className='mt-4 font-display text-xl font-bold text-gray-900'>
                    {error?.status === 404 ? 'Esta empresa no está disponible' : 'No se pudo cargar el perfil'}
                </h1>
                <p className='mt-2 text-sm text-gray-500'>
                    {error?.status === 404
                        ? 'Puede que el convenio con la universidad haya terminado.'
                        : obtenerMensajeError(error, 'Intenta de nuevo en unos minutos.')}
                </p>
            </div>
        )
    }

    const abrir = (accion) => (accion === 'editar' ? setEditando(true) : setImagen(accion))
    const pendientes = PASOS.filter(p => !perfil[p.campo])
    const completados = PASOS.length - pendientes.length
    const tieneDatos = perfil.sector || perfil.tamano || perfil.ubicacion || perfil.sitioWeb || perfil.correoContacto

    return (
        <div className='max-w-6xl mx-auto px-4 mt-8 mb-12 space-y-6'>
            {miEmpresa && (
                <div className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800'>
                    <IoEyeOutline className='size-5 shrink-0' />
                    Así verán los estudiantes la página de tu empresa. Lo que edites aquí se publica al instante.
                </div>
            )}

            {/* Portada */}
            <section className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
                <div className='relative group'>
                    {perfil.banner
                        ? <img src={perfil.banner} alt={`Portada de ${perfil.nombreEmpresa}`} className='aspect-[3/1] max-h-72 w-full object-cover' />
                        : <div className='aspect-[3/1] max-h-72 w-full bg-gradient-to-br from-green-700 via-green-600 to-emerald-400' />}
                    {miEmpresa && (
                        <button
                            type='button'
                            onClick={() => setImagen('banner')}
                            className='absolute top-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 hover:bg-black/70 text-white text-xs font-semibold backdrop-blur-sm transition-colors'
                        >
                            <IoCameraOutline className='size-4' />
                            {perfil.banner ? 'Cambiar portada' : 'Agregar portada'}
                        </button>
                    )}
                </div>

                <div className='px-6 pb-6'>
                    <div className='flex flex-wrap items-end justify-between gap-4 -mt-12 md:-mt-14'>
                        <div className='relative size-28 md:size-32 rounded-2xl ring-4 ring-white bg-white shadow-sm overflow-hidden group'>
                            {perfil.logo
                                ? <img src={perfil.logo} alt={`Logo de ${perfil.nombreEmpresa}`} className='size-full object-contain' />
                                : <div className='size-full flex items-center justify-center bg-gray-100 text-gray-400'>
                                    <IoBusinessOutline className='size-12' />
                                </div>}
                            {miEmpresa && (
                                <button
                                    type='button'
                                    onClick={() => setImagen('logo')}
                                    aria-label='Cambiar logo'
                                    className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                                >
                                    <IoCameraOutline className='size-6 mb-1' />
                                    {perfil.logo ? 'Cambiar logo' : 'Subir logo'}
                                </button>
                            )}
                        </div>

                        <div className='flex flex-wrap gap-2'>
                            {perfil.sitioWeb && (
                                <a
                                    href={perfil.sitioWeb}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-colors'
                                >
                                    <IoOpenOutline className='size-4' /> Visitar sitio web
                                </a>
                            )}
                            {miEmpresa && (
                                <button
                                    type='button'
                                    onClick={() => setEditando(true)}
                                    className='flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors'
                                >
                                    <SlPencil className='size-4' /> Editar perfil
                                </button>
                            )}
                        </div>
                    </div>

                    <div className='mt-4'>
                        <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                            <h1 className='font-display text-2xl md:text-3xl font-bold text-gray-900'>{perfil.nombreEmpresa}</h1>
                            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold'>
                                Empresa con convenio
                            </span>
                        </div>
                        {perfil.categoria && <p className='mt-1 text-gray-600'>{perfil.categoria}</p>}
                        <div className='mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500'>
                            {perfil.sector && <span className='flex items-center gap-1.5'><IoLayersOutline className='size-4' />{perfil.sector}</span>}
                            {perfil.ubicacion && <span className='flex items-center gap-1.5'><IoLocationOutline className='size-4' />{perfil.ubicacion}</span>}
                            {perfil.tamano && <span className='flex items-center gap-1.5'><IoPeopleOutline className='size-4' />{perfil.tamano}</span>}
                        </div>
                    </div>
                </div>
            </section>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='lg:col-span-2 space-y-6'>
                    <Tarjeta titulo='Acerca de'>
                        {perfil.descripcion
                            ? <p className='text-gray-700 leading-relaxed whitespace-pre-line'>{perfil.descripcion}</p>
                            : <div className='text-center py-6'>
                                <p className='text-sm text-gray-500'>
                                    {miEmpresa ? 'Cuéntales a los estudiantes quiénes son y qué hacen.' : 'Esta empresa aún no agrega una descripción.'}
                                </p>
                                {miEmpresa && (
                                    <button type='button' onClick={() => setEditando(true)} className='mt-3 text-sm font-semibold text-green-700 hover:underline'>
                                        Agregar descripción
                                    </button>
                                )}
                            </div>}
                    </Tarjeta>

                    {/* Las vacantes se conectan en la fase del reclutador */}
                    <Tarjeta titulo='Vacantes'>
                        <div className='flex flex-col items-center text-center py-6'>
                            <div className='p-3 rounded-full bg-gray-100 text-gray-400'>
                                <IoBriefcaseOutline className='size-6' />
                            </div>
                            <p className='mt-3 text-sm text-gray-500'>
                                Aquí aparecerán las vacantes de servicio social, prácticas y empleo que publique la empresa.
                            </p>
                        </div>
                    </Tarjeta>
                </div>

                <div className='space-y-6'>
                    {miEmpresa && pendientes.length > 0 && (
                        <Tarjeta titulo='Completa tu página'>
                            <div className='mb-4'>
                                <div className='flex justify-between text-xs text-gray-500 mb-1.5'>
                                    <span>{completados} de {PASOS.length} listos</span>
                                    <span>{Math.round((completados / PASOS.length) * 100)}%</span>
                                </div>
                                <div className='h-2 rounded-full bg-gray-100 overflow-hidden'>
                                    <div className='h-full rounded-full bg-green-500 transition-all' style={{ width: `${(completados / PASOS.length) * 100}%` }} />
                                </div>
                            </div>
                            <ul className='space-y-1'>
                                {PASOS.map(paso => {
                                    const listo = !!perfil[paso.campo]
                                    return (
                                        <li key={paso.campo}>
                                            <button
                                                type='button'
                                                onClick={() => abrir(paso.accion)}
                                                disabled={listo}
                                                className='w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-left hover:bg-gray-50 disabled:hover:bg-transparent disabled:cursor-default'
                                            >
                                                {listo
                                                    ? <IoCheckmarkCircle className='size-5 text-green-600 shrink-0' />
                                                    : <IoEllipseOutline className='size-5 text-gray-300 shrink-0' />}
                                                <span className={listo ? 'text-gray-400 line-through' : 'text-gray-700'}>{paso.texto}</span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </Tarjeta>
                    )}

                    <Tarjeta titulo='Información'>
                        {tieneDatos ? (
                            <div className='space-y-4'>
                                {perfil.sector && <Dato icono={IoLayersOutline} etiqueta='Sector'>{perfil.sector}</Dato>}
                                {perfil.tamano && <Dato icono={IoPeopleOutline} etiqueta='Tamaño'>{perfil.tamano}</Dato>}
                                {perfil.ubicacion && <Dato icono={IoLocationOutline} etiqueta='Ubicación'>{perfil.ubicacion}</Dato>}
                                {perfil.sitioWeb && (
                                    <Dato icono={IoGlobeOutline} etiqueta='Sitio web'>
                                        <a href={perfil.sitioWeb} target='_blank' rel='noopener noreferrer' className='text-green-700 hover:underline'>
                                            {dominio(perfil.sitioWeb)}
                                        </a>
                                    </Dato>
                                )}
                                {perfil.correoContacto && (
                                    <Dato icono={IoMailOutline} etiqueta='Contacto'>
                                        <a href={`mailto:${perfil.correoContacto}`} className='text-green-700 hover:underline'>
                                            {perfil.correoContacto}
                                        </a>
                                    </Dato>
                                )}
                            </div>
                        ) : (
                            <p className='text-sm text-gray-500'>Sin información de contacto todavía.</p>
                        )}
                    </Tarjeta>
                </div>
            </div>

            {editando && <CompanyProfileForm perfil={perfil} onClose={() => setEditando(false)} />}
            {imagen && <CompanyImageForm tipo={imagen} onClose={() => setImagen(null)} />}
        </div>
    )
}

export default CompanyProfile
