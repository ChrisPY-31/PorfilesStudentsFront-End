import React from 'react'
import { FaUniversity } from 'react-icons/fa'
import { SlPencil } from 'react-icons/sl'

const Educations = ({ educaciones }) => {
    
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    

    return (
        <div className='relative shadow-2xl rounded-xl mt-4 p-4 min-h-[150px]'>
            <div className='flex justify-between items-center'>
                <h3 className='text-xl'>Educations </h3>
                <SlPencil className='size-5  cursor-pointer' />
            </div>
            {educaciones.length > 0 ? educaciones.map(educacion => {
                return (
                    <div className='flex items-center gap-4 my-2'>
                        <div>
                            <FaUniversity className='size-10' />
                        </div>
                        <div>
                            <h3 className='font-semibold'>{educacion.institucion}</h3>
                            <p>{educacion.grado}</p>
                            <span>{educacion.fechaInicio}</span>
                            <p>{`${educacion.descripcion ? educacion.descripcion : ''}`}</p>

                        </div>
                    </div>
                )
            }) : <div className='flex justify-center items-center'><h4>No hay registros.</h4></div>}
        </div>
    )
}

export default Educations