import React, { useState } from 'react'
import { estudianteById } from '../Estudiantes'
import Person from './Person';
import { SlPencil } from 'react-icons/sl';
import Contactos from './Contactos';
import Educations from './Educations';

const PorfileUser = ({ user }) => {

    const { nombre,
        apellido,
        imagen,
        curriculum,
        especialidad,
        semestre,
        ubicacion,
        carrera,
        descripcion,
        redContactos,
        educaciones
    } = user;

    console.log(user)

    return (
        <div className='w-[60%] mx-auto '>
            <Person
                nombre={nombre}
                apellido={apellido}
                imagen={imagen}
                curriculum={curriculum}
                especialidad={especialidad}
                semestre={semestre}
                ubicacion={ubicacion}
                carrera={carrera?.carrera}
            />

            <div className='flex gap-3'>
                <div className='w-3/4'>
                    <div className='relative shadow-2xl rounded-xl mt-4 p-4 min-h-[125px] '>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl'>Acerca de: </h3>
                            <SlPencil className='size-5  cursor-pointer' />
                        </div>
                        <p>{descripcion}</p>
                    </div>
                    <Educations educaciones={educaciones}/>
                </div>

                <div className='w-1/4'>
                    <div className='relative shadow-2xl rounded-xl mt-4 p-4 min-h-[100px] '>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl'>Habilidades </h3>
                            <SlPencil className='size-5  cursor-pointer' />
                        </div>
                        <ul>
                            <li>React</li>
                            <li>Redux</li>
                            <li>Tailwind</li>
                            <li>React</li>
                        </ul>
                    </div>

                    <div className='relative shadow-2xl rounded-xl mt-4 p-4 min-h-[100px] '>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl'>Contactos </h3>
                            <SlPencil className='size-5  cursor-pointer' />
                        </div>
                        <Contactos contactos={redContactos} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PorfileUser