import React from 'react'
import { SlPencil } from 'react-icons/sl'

const RecomendacionCard = ({ comentario, fecha, nombreMaestro, apellidoMaestro, imagen, estudiante, tipo }) => {

  console.log(imagen)

  return (
    <div className=' p-6 flex gap-5 relative my-4 border border-gray-300 rounded-xl'>
      {tipo === "teacher" && <SlPencil className='size-5  cursor-pointer absolute right-3 top-2' />}

      <img
        className='size-24 rounded-full'
        src={`${imagen ? imagen : "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true"} `} alt="" />
      <div>
        <span className='absolute right-2 text-gray-400'>{fecha}</span>
        <h3 className='text-xl font-semibold'>{`${nombreMaestro} ${apellidoMaestro} `}</h3>
        <p className='mt-2 text-[14px]'>{comentario} </p>
        {tipo === "teacher" &&
          <p className='text-[14px] mt-2 text-gray-500'>Recomendaste al alumno: {`${estudiante.nombre} ${estudiante.apellido}`}</p>

        }
      </div>
    </div>
  )
}

export default RecomendacionCard