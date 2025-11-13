import React, { useState } from 'react'
import { SlPencil } from 'react-icons/sl'

const Person = ({ nombre, apellido, imagen, curriculum, especialidad, semestre, ubicacion, carrera, myAccount, setUpdateAccount, contactos, openMenuContact }) => {

  let renderWeb = contactos?.filter(contacto => {
    return contacto.contactos.red === "WEB"
  })

  const handleOpenMenu = () => {
    document.body.className = "overflow-hidden"
    openMenuContact()
  }
  return (
    <div className='relative  rounded-xl' >
      <div className='bg-[url(https://cdn.pixabay.com/photo/2017/06/14/01/43/background-2400765_1280.jpg)] w-full h-[200px] rounded-t-lg'>
      </div>
      <div className='p-4'>
        {myAccount && <SlPencil className='right-5 mt-4 size-5 absolute cursor-pointer'
          onClick={() => setUpdateAccount(true)}
        />}

        <img className='size-32 rounded-full absolute border-5 border-white top-[110px]' src={`${imagen ? imagen :'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true' }`} alt="foto de perfil" />
        <div className='mt-5 flex flex-col gap-2'>
          <div>
            <h4 className='text-xl font-semibold'>{`${nombre} ${apellido}`}</h4>
            <div className='flex justify-between'>
              <p>{especialidad}</p>
              {carrera && <p>Ingeniero en {carrera}</p>}
            </div>
          </div>
          <div className='flex gap-4'>
            {ubicacion ? (
              <span className='text-gray-400 text-[14px]'>{`${ubicacion?.ciudad} ${ubicacion?.pais}`} </span>)
              : ""
            }
            {
              <p
                onClick={handleOpenMenu}
                className='text-[14px] text-blue-600 hover:underline cursor-pointer'>Informacion de contacto</p>
            }
          </div>
          <div className='flex justify-between items-center'>
            <div>

              {
                renderWeb?.length > 0 && renderWeb.map(web => <a className='text-blue-700 text-[14px] hover:underline' href={web.url} target="_blank">{web.url}</a>)
              }
            </div>
            {
              curriculum &&
              <button
                className='bg-blue-600 text-white px-5 py-1 rounded-xl cursor-not-allowed' disabled>
                Descargar curriculum
              </button>

            }

          </div>
        </div>

      </div>
    </div>
  )
}

export default Person