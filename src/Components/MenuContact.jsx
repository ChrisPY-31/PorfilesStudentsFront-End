import React, { useEffect } from 'react'
import ContactsCard from './ContactsCard'
import { IoCloseSharp, IoPersonCircleOutline, IoAtOutline } from 'react-icons/io5'
import { IoMdAdd } from 'react-icons/io'
import { SlPencil } from 'react-icons/sl'
import { useAppSelector } from '../Hooks/store'
import { useGetContactTypesQuery } from '../services/UserSlice'

const MenuContact = ({ nombreUser, imagen, contactos = [], onClose, myAccount, onAgregarContacto, onEditarContactos }) => {
    const { userToken } = useAppSelector(state => state.users)
    // Catalogo de redes del back: [{ idContacto, red }]
    const { data: tiposContacto = [] } = useGetContactTypesQuery({ token: userToken }, { skip: !myAccount })
    const tieneContactos = contactos.length > 0
    // Solo se puede tener un contacto por red, cuando estan todas ya no se puede agregar
    const puedeAgregar = tiposContacto.length > 0 && contactos.length < tiposContacto.length

    const handleCloseMenu = () => {
        document.body.className = ""
        onClose()
    }

    // Cerrar con Escape
    useEffect(() => {
        const alPresionar = (e) => e.key === 'Escape' && handleCloseMenu()
        window.addEventListener('keydown', alPresionar)
        return () => window.removeEventListener('keydown', alPresionar)
    })

    return (
        <div
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'
            onClick={handleCloseMenu}
        >
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='titulo-contacto'
                className='w-full max-w-md max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden'
                onClick={e => e.stopPropagation()}
            >
                {/* Encabezado con la persona */}
                <div className='relative px-6 pt-6 pb-5 bg-gradient-to-br from-green-50 to-white border-b border-gray-100'>
                    <button
                        type='button'
                        onClick={handleCloseMenu}
                        className='absolute top-4 right-4 p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors'
                        aria-label='Cerrar'
                    >
                        <IoCloseSharp className='size-6' />
                    </button>
                    <div className='flex items-center gap-4 pr-8'>
                        {imagen
                            ? <img src={imagen} alt={nombreUser} className='size-14 rounded-full object-cover ring-4 ring-white shadow' />
                            : <IoPersonCircleOutline className='size-14 text-gray-300' />}
                        <div className='min-w-0'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-green-700'>Información de contacto</p>
                            <h2 id='titulo-contacto' className='font-display text-xl font-bold text-gray-900 truncate'>{nombreUser}</h2>
                        </div>
                    </div>
                </div>

                {/* Lista */}
                <div className='flex-1 overflow-y-auto px-6 py-5'>
                    {tieneContactos
                        ? <ul className='space-y-2'>
                            {contactos.map(contact => (
                                <ContactsCard
                                    key={contact.contactos.idContacto}
                                    url={contact.url}
                                    socialMedia={contact.contactos.red}
                                />
                            ))}
                        </ul>
                        : <div className='flex flex-col items-center text-center py-8'>
                            <span className='grid place-items-center size-14 rounded-full bg-gray-100 text-gray-400 mb-3'>
                                <IoAtOutline className='size-7' />
                            </span>
                            <p className='font-medium text-gray-800'>
                                {myAccount ? 'Aún no tienes contactos' : 'Sin información de contacto'}
                            </p>
                            <p className='mt-1 text-sm text-gray-500'>
                                {myAccount
                                    ? 'Agrega tu correo, teléfono o redes para que puedan encontrarte.'
                                    : 'Este usuario todavía no ha agregado sus contactos.'}
                            </p>
                        </div>}
                </div>

                {/* Acciones del dueño del perfil */}
                {myAccount && (tieneContactos || puedeAgregar) && (
                    <div className='flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50'>
                        {tieneContactos && (
                            <button
                                type='button'
                                onClick={onEditarContactos}
                                className='flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'
                            >
                                <SlPencil className='size-3.5' /> Editar
                            </button>
                        )}
                        {puedeAgregar && (
                            <button
                                type='button'
                                onClick={onAgregarContacto}
                                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 transition-colors'
                            >
                                <IoMdAdd className='size-4' /> Agregar contacto
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MenuContact
