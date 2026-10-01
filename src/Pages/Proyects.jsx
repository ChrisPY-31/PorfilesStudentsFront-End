import React, { useState } from 'react'
import { IoAdd } from 'react-icons/io5'
import MenuNoRegister from '../Components/MenuNoRegister'
import CreateProjectForm from '../Components/CreateProjectForm'
import ProyectsCard from '../Components/ProyectsCard'

const Proyects = ({ proyectos, myAccount, tipo }) => {
  // null = cerrado, {} = nuevo, proyecto = editando
  const [proyectoEnForm, setProyectoEnForm] = useState(null)
  const puedeAgregar = myAccount && tipo === 'student'

  return (
    <div className='w-full max-w-4xl mx-auto px-4'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-3xl font-bold text-gray-900'>Proyectos</h2>
        {puedeAgregar && proyectos?.length > 0 && (
          <button
            type='button'
            onClick={() => setProyectoEnForm({})}
            className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-md hover:bg-green-700 transition-colors'
          >
            <IoAdd className='size-5' /> Agregar proyecto
          </button>
        )}
      </div>

      {proyectos?.length > 0 ? (
        <div className='space-y-5 pb-10'>
          {proyectos.map(proyecto => (
            <ProyectsCard
              key={proyecto.idProject}
              proyecto={proyecto}
              myAccount={myAccount}
              onEdit={() => setProyectoEnForm(proyecto)}
            />
          ))}
        </div>
      ) : (
        <MenuNoRegister
          myAccount={myAccount}
          onOpenForm={() => setProyectoEnForm({})}
          titulo='Proyectos'
          mensaje="Aqui van tus proyectos"
          descripcion="Muestra tus mejores proyectos en los que has trabajado o colaborado para que la gente pueda conocer mejor"
          buttonMensaje="Agregar proyecto"
          tipo={tipo}
        />
      )}

      {proyectoEnForm && (
        <CreateProjectForm
          proyecto={proyectoEnForm}
          onClose={() => setProyectoEnForm(null)}
        />
      )}
    </div>
  )
}

export default Proyects
