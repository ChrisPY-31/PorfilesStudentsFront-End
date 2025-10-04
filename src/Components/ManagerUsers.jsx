import React from 'react'

const ManagerUsers = () => {
  return (
         <div className=" mt-5">
       {/* Tabla de estudiantes */}
  <div className="bg-white p-4 rounded shadow">
    <h3 className="text-lg font-bold mb-4">Estudiantes</h3>
    
    <div className="flex font-bold bg-gray-200">
      <div className="flex-1 p-2">Nombre</div>
      <div className="flex-1 p-2">Rol</div>
      <div className="flex-1 p-2">Estado</div>
      <div className="flex-1 p-2">Acción</div>
    </div>

    {/* Filas  */}
    <div className="flex border-b border-gray-300">
      <div className="flex-1 p-2">Sofia Rodriguez</div>
      <div className="flex-1 p-2">Estudiante</div>
      <div className="flex-1 p-2">Activo</div>
      <div className="flex-1 p-2">Editar</div>
    </div>

    <div className="flex border-b border-gray-300">
      <div className="flex-1 p-2">Mateo Vargas</div>
      <div className="flex-1 p-2">Estudiante</div>
      <div className="flex-1 p-2">Activo</div>
      <div className="flex-1 p-2">Editar</div>
    </div>

    <div className="flex border-b border-gray-300">
      <div className="flex-1 p-2">Isabella Torres</div>
      <div className="flex-1 p-2">Estudiante</div>
      <div className="flex-1 p-2">Inactivo</div>
      <div className="flex-1 p-2">Editar</div>
    </div>
  </div>
  </div>
      

  )
}

export default ManagerUsers
