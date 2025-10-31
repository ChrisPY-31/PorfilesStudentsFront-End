import React, { useState } from 'react'
import { proyectos } from '../Estudiantes'


const Proyects = ({ proyectos }) => {
  console.log(proyectos)

  return (
    <div className='w-[80%] mx-auto'>
      {proyectos.map((proyecto) => (
        <div className='flex justify-between gap-3 shadow-2xl my-10 p-4 h-[325px] max-h-max rounded-xl' key={proyecto.id}>
          <div className='w-3/4 flex flex-col justify-around'>
            <h3 className='text-2xl font-bold'>{proyecto.nombre}</h3>
            <p>{proyecto.descripcion}</p>
            <div className='flex gap-2'>
              <p>{proyecto.fechaInicio}</p> {"  - "}
              <p>{proyecto.fechaFin}</p>
            </div>

            <div>
              <h4>Tecnologias</h4>
              <div className='flex gap-4'>
                {
                  proyecto.Technologias?.map(tecnology => (
                    <p key={tecnology.id}>{tecnology.nombre}</p>
                  ))
                }
              </div>
            </div>

            <div>
              {
                proyecto.Colaboradores ? (
                  <div>
                    <h4>Colaboradores</h4>
                    <div className='flex gap-5'>
                      {
                        proyecto.Colaboradores?.map(colaborador => (
                          <img className='size-10 rounded-full' src={colaborador.imagen} alt={colaborador.nombre} key={colaborador.id} />
                        ))
                      }
                    </div>
                  </div>) : ""
              }

            </div>

            <div className='flex gap-5'>
              {proyecto.redes?.map(red => (
                <div className='flex gap-2 items-center' key={red.id}>
                  <a href={red.link} target="_blank" rel="noopener noreferrer" key={red.id}>
                    <red.icon className='size-6' />
                  </a>
                  <p>{red.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className='w-1/4'>
            <img className='h-full object-contain w-full rounded-xl' 
            src={`${proyecto.imagen ? proyecto.imagen : 'https://porfolio-christian.vercel.app/assets/Oro-C1fVqxTA.jpeg'}`} alt="" />
          </div>
        </div>
      ))}

    </div>
  )
}

export default Proyects