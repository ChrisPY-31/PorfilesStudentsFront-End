import React, { useState } from 'react'
import MenuNoRegister from './MenuNoRegister'
import CreateProjectForm from './CreateProjectForm'
import { SlPencil } from 'react-icons/sl'
import { FaPlus } from 'react-icons/fa'
import ProyectsCard from './ProyectsCard'
const Proyects = ({ proyectos, myAccount, tipo }) => {
  const [myformProyect, setMyFormProyect] = useState(false)
  const [updateProject, setUpdateProject] = useState({})

  return (
    <div className='w-[80%] mx-auto'>
      <h2 className='text-center text-3xl'>Proyectos</h2>
      <div>
        {(myAccount && proyectos?.length > 0)  &&
          <h4 className='flex items-center gap-2 '>Deseas agregar proyectos
            <FaPlus className='cursor-pointer'
              onClick={() => {
                setMyFormProyect(true)
                document.body.className = "overflow-hidden"
              }} />
          </h4>}
      </div>
      {
        proyectos?.length > 0 ?
          proyectos?.map((proyecto) => (
            <ProyectsCard
              key={proyecto.idProject}
              nombre={proyecto.nombre}
              descripcion={proyecto.descripcion}
              imagen={proyecto.imagen}
              fechaInicio={proyecto.fechaInicio}
              fechaFin={proyecto.fechaFin}
              github={proyecto.github}
              deploy={proyecto.deploy}
              menciones={proyecto.menciones}
              tecnologias={proyecto.tecnologias}
              myAccount={myAccount}
              openMenu={() => setMyFormProyect(true)}
              onEdit={() => setUpdateProject(proyecto)}
            />
          ))
          : <MenuNoRegister
            myAccount={myAccount}
            onOpenForm={() => setMyFormProyect(true)}
            titulo='Proyectos'
            mensaje="Aqui van tus proyectos"
            descripcion="Muestra tus mejores proyectos en los que has trabajado o colaborado para que la gente pueda conocer mejor"
            buttonMensaje="Añadir Experiencia"
            tipo={tipo}
          />
      }
      {myformProyect && <CreateProjectForm
        onClose={() => setMyFormProyect(false)}
        updateProject={updateProject}
        setUpdateProject={setUpdateProject}

      />}

    </div>
  )
}

export default Proyects