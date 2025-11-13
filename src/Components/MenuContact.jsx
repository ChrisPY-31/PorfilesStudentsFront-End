import React from 'react'
import ContactsCard from './ContactsCard'
import { IoCloseSharp } from 'react-icons/io5'
import { IoMdAdd } from 'react-icons/io'
import { SlPencil } from 'react-icons/sl'

const MenuContact = ({ nombreUser, contactos, isEditable, onClose, myAccount, setMenuRedesContacto }) => {
    console.log(contactos)

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
                            {myAccount && <SlPencil className='size-5  cursor-pointer'
                                onClick={() => {
                                    // setMenuRedesContacto(true)
                                    // setUpdateContact(contactos)
                                }
                                }
                            />}
                            {(myAccount) && (
                                contactos?.length === 4 ? '' :
                                    <IoMdAdd className='size-6 cursor-pointer'
                                        onClick={() => {
                                            setMenuRedesContacto(true)
                                            
                                        }}
                                    />
                            )}
                        </div>

                    </div>
                    <div className='p-4 '>

                        {
                            contactos.length > 0 ?
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