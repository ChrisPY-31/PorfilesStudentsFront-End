import React, { useState } from 'react'
import { FaUniversity } from 'react-icons/fa'
import { SlPencil } from 'react-icons/sl'
import EducationForm from './EducationForm'
import { formatearFecha } from '../helpers'

const Educations = ({ id, institucion, grado, fechaInicio, fechaFin, descripcion, educacion, myAccount, openMenu, onEdit }) => {

    let nuevaFecha = formatearFecha(fechaInicio)

    const handleClick = () => {
        onEdit()
        openMenu()
    }

    const educationTipo = {
        COURSE: "Curso",
        MASTER: "Maestria",
        BACHELOR: "Licenciatura",
        DIPLOMA: "Diplomado",
        PHD: "Doctorado"
    }



    return (
        <div className='px-4 min-h-[125px] flex relative'>
            {myAccount && <SlPencil

                onClick={() => handleClick()}
                className='size-5  cursor-pointer absolute right-2 top-3 ' />}
            <div className='flex items-center gap-4 my-2'>
                <div>
                    <FaUniversity className='size-10' />
                </div>
                <div className='text-[14px]'>
                    <h3 className='font-semibold'>{institucion}</h3>
                    <p>{educationTipo[educacion]}</p>
                    <span className=' text-gray-400'>{nuevaFecha}</span>
                    <p className='text-[13px]'>{`${descripcion ? descripcion : ''}`}</p>

                </div>
            </div>
        </div>
    )
}

export default Educations