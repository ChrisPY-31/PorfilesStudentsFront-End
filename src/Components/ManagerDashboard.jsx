import React from 'react'
import ManagerUsers from './ManagerUsers'

const ManagerDashboard = () => {
  return (
      <div className="flex-1 p-7 border-2 border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4"> Dashboard </h2>

          <div className="flex gap-4 mb-8">
            <div className="bg-white p-6 rounded flex-1 text-center min-h-[120px] flex flex-col justify-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">1,250</h3>
              <p>Total de usuarios</p>
            </div>
            <div className="bg-white p-6 rounded flex-1 text-center min-h-[120px] flex flex-col justify-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">850</h3>
              <p>Estudiantes registrados</p>
            </div>
            <div className="bg-white p-6 rounded flex-1 text-center min-h-[120px] flex flex-col justify-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">400</h3>
              <p>Estudiantes pendientes</p>
            </div>
          </div>
        </div>

        <ManagerUsers/> 
      </div> 
  )
}

export default ManagerDashboard
