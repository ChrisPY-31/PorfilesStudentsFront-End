import React, { useState } from 'react'
import { SlPencil } from 'react-icons/sl'
import { IoCameraOutline, IoSchoolOutline, IoBookOutline, IoLocationOutline, IoGlobeOutline } from 'react-icons/io5'
import PhotoForm from './PhotoForm'

const Person = ({ nombre, apellido, imagen, curriculum, especialidad, semestre, ubicacion, carrera, myAccount, setUpdateAccount, contactos, openMenuContact, user }) => {

  const [menuFoto, setMenuFoto] = useState(false)

  let renderWeb = contactos?.filter(contacto => {
    return contacto.contactos.red === "WEB"
  })

  const handleOpenMenu = () => {
    document.body.className = "overflow-hidden"
    openMenuContact()
  }
  return (
    <section className='relative bg-white rounded-2xl border border-gray-200 overflow-hidden'>
      <div className='h-40 md:h-48 bg-[url(https://cdn.pixabay.com/photo/2017/06/14/01/43/background-2400765_1280.jpg)] bg-cover bg-center' />

      <div className='px-6 pb-6'>
        {/* Foto + boton editar */}
        <div className='flex items-end justify-between -mt-16'>
          <div className='relative size-32 rounded-full ring-4 ring-white bg-white overflow-hidden group'>
            <img className='size-full object-cover' src={imagen || 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'} alt="foto de perfil" />
            {myAccount && (
              <button
                type="button"
                onClick={() => setMenuFoto(true)}
                aria-label="Cambiar foto de perfil"
                className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
              >
                <IoCameraOutline className='size-6 mb-1' />
                Cambiar foto
              </button>
            )}
          </div>

          {myAccount && (
            <button
              type='button'
              onClick={() => setUpdateAccount(true)}
              className='flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors'
            >
              <SlPencil className='size-4' /> Editar perfil
            </button>
          )}
        </div>

        {/* Nombre y especialidad */}
        <div className='mt-4'>
          <h1 className='text-2xl font-bold text-gray-900'>{`${nombre} ${apellido}`}</h1>
          {especialidad && <p className='mt-1 text-gray-700'>{especialidad}</p>}
        </div>

        {/* Datos */}
        <div className='mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500'>
          {carrera && (
            <span className='flex items-center gap-1.5'><IoSchoolOutline className='size-4' /> {carrera}</span>
          )}
          {semestre && (
            <span className='flex items-center gap-1.5'><IoBookOutline className='size-4' /> {semestre}° semestre</span>
          )}
          {ubicacion?.estado && (
            <span className='flex items-center gap-1.5'><IoLocationOutline className='size-4' /> {ubicacion.estado}</span>
          )}
          {renderWeb?.map(web => (
            <a
              key={web.url}
              href={web.url}
              target="_blank"
              rel="noopener noreferrer"
              className='flex items-center gap-1.5 text-blue-600 hover:underline'
            >
              <IoGlobeOutline className='size-4' /> {web.url.replace(/^https?:\/\//, '')}
            </a>
          ))}
        </div>

        {/* Acciones */}
        <div className='mt-5 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={handleOpenMenu}
            className='px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors'
          >
            Información de contacto
          </button>
          {curriculum && (
            <button
              type='button'
              disabled
              className='px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-400 cursor-not-allowed'
            >
              Descargar currículum
            </button>
          )}
        </div>
      </div>
      {menuFoto && <PhotoForm tipo={user?.tipo} onCancel={() => setMenuFoto(false)} />}
    </section>
  )
}

export default Person