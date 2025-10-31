import React from 'react'
import { SlPencil } from 'react-icons/sl'

const Person = ({ nombre, apellido, imagen, curriculum, especialidad, semestre, ubicacion, carrera }) => {
  return (
    <div className='relative  rounded-xl' >
      <div className='bg-[url(https://cdn.pixabay.com/photo/2017/06/14/01/43/background-2400765_1280.jpg)] w-full h-[200px] rounded-t-lg'>
      </div>
      <div className='p-4'>
        <SlPencil className='right-5 mt-4 size-5 absolute cursor-pointer' />

        <img className='size-30 rounded-full absolute border-5 border-white top-[110px]' src={imagen} alt="" />
        <div className='mt-5 flex flex-col gap-2'>
          <div>
            <h4 className='text-xl font-semibold'>{`${nombre} ${apellido}`}</h4>
            <div className='flex justify-between'>
              <p>{especialidad}</p>
              {carrera && <p>Ingeniero en {carrera}</p>
              }
            </div>
          </div>
          <div>
            {ubicacion ? (
              <span className='text-gray-400'>{`${ubicacion?.ciudad} ${ubicacion?.pais}`} </span>)
              :""
            }
          </div>
          <a className='text-blue-700' href={`${curriculum}`}>{curriculum}</a>
        </div>

      </div>
    </div>
  )
}

export default Person