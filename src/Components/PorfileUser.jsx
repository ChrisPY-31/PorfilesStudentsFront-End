import React, { useState } from 'react'
import { estudianteById } from '../Estudiantes'

const PorfileUser = () => {

    const [usuario, setUsuario] = useState(estudianteById);

    return (
        <div className='w-[80%] mx-auto shadow-2xl rounded-xl p-10'>
            {usuario.map((user) => (
                <div key={user.id} className=''>
                    <div className='flex gap-5 items-center'>
                        <img className='size-32 bg-cover rounded-full' src={user.image} alt="" />
                        <div>
                            <p className='text-2xl'>{user.name} {user.lastName}</p>
                            <p>{user.carrera}</p>
                            <p>{user.especialidad}</p>
                        </div>
                        <div>
                            {user.Contactos.map((contacto, index) => (
                                <div key={index}>
                                    <a href={contacto.link} target="_blank" rel="noopener noreferrer">
                                        <img className='size-6' src={contacto.icon} alt={contacto.name} />
                                        <p>{contacto.tipo}</p>
                                        <p>{contacto.valor}</p>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>

                    </div>

                    <div>
                        <h3 className='text-2xl font-bold'>Sobre mi</h3>
                        <p>{user.description}</p>
                        <span>{user.aptitudes.slice(0, 3).join(', ')}</span>
                    </div>
                    <div>
                        <h3 className='text-2xl font-bold'>Educacion</h3>
                        {user.Educacion.map((edu, index) => (
                            <div key={index}>
                                <p>{edu.institucion}</p>
                                <p>{edu.grado} en {edu.campoEstudio}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        
                    </div>

                </div>
            ))}
        </div>
    )
}

export default PorfileUser