import React from 'react'
import ContactsCard from './ContactsCard'
import { IoCloseSharp } from 'react-icons/io5'
import { IoMdAdd } from 'react-icons/io'
import { SlPencil } from 'react-icons/sl'
import { useAppSelector } from '../Hooks/store'
import { useGetContactTypesQuery } from '../services/UserSlice'

const MenuContact = ({ nombreUser, contactos = [], onClose, myAccount, onAgregarContacto, onEditarContactos }) => {
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
    return (
        <div className='absolute inset-0 z-50 flex justify-center items-center bg-gray-300/50'>
            <div className='bg-white w-1/3 h-[50%] rounded-xl mx-auto'>
                <div className=''>
                    <div className='flex justify-between items-center p-3 border-b border-gray-300'>
                        <h3 className='text-xl font-semibold'>{nombreUser}</h3>
                        <IoCloseSharp className='size-7 cursor-pointer' onClick={handleCloseMenu} />
                    </div>
                    <div className='flex justify-between items-center px-4 pt-4'>
                        <h4 className='text-xl '>Informacion de contacto</h4>
                        <div className='flex gap-2'>
                            {myAccount && tieneContactos && <SlPencil className='size-5  cursor-pointer'
                                title="Editar contactos"
                                onClick={onEditarContactos}
                            />}
                            {myAccount && puedeAgregar && <IoMdAdd className='size-6 cursor-pointer'
                                title="Agregar contacto"
                                onClick={onAgregarContacto}
                            />}
                        </div>

                    </div>
                    <div className='p-4 '>

                        {
                            tieneContactos ?
                                contactos?.map((contact) => {
                                    return <ContactsCard
                                        key={contact.contactos.idContacto}
                                        id={contact.contactos.id}
                                        nombre={contact.contactos.red}
                                        url={contact.url}
                                        socialMedia={contact.contactos.red}
                                    />
                                })
                                :
                                myAccount ?
                                    <h4 className='text-center'>No tienes contactos agrega</h4>
                                    : <h4 className='text-center '>El usuario no tiene contactos</h4>
                        }
                    </div>
                </div>

            </div>
        </div>
    )
}

export default MenuContact