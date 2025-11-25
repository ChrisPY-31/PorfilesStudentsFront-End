//GRAFICOS CIRCULARES 
import React, { useEffect, useState } from 'react';
import ManagerUsers from './ManagerUsers';
import { API_KEY } from '../api/api';
import { useAppSelector } from '../Hooks/store';
import axios from 'axios';
const ManagerDashboard = () => {

  const { userToken } = useAppSelector(state => state.users)
  const [dashBoard, setDashBoard] = useState({})

  useEffect(() => {
    const getDataAdmin = async () => {

      const { data } = await axios.get(`${API_KEY}/Usuarios`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      setDashBoard(data.object)
    }
    getDataAdmin()
  }, [])


  return (
    <div className="flex-1 p-7 border-2 border-gray-200">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-3"> Dashboard </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-2">{dashBoard?.totalPersonas}</h3>
                <p className="text-gray-600">Total de usuarios</p>
              </div>
              <div className="relative w-15 h-15">
                <svg viewBox="0 0 36 36" className="w-18 h-18">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeDasharray="100" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 18 18)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center w-18 h-18">
                  <span className="text-sm font-bold text-blue-600">100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-2">{dashBoard.carreraSofware
                }</h3>
                <p className="text-gray-600">Estudiantes de software</p>
              </div>
              <div className="relative w-15 h-15">
                <svg viewBox="0 0 36 36" className="w-18 h-18">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeDasharray="100" strokeDashoffset="32" strokeLinecap="round" transform="rotate(-90 18 18)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center w-18 h-18">
                  <span className="text-sm font-bold text-green-600">68%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-2">{dashBoard.carreraComputacion}</h3>
                <p className="text-gray-600">Estudiantes Computacion</p>
              </div>
              <div className="relative w-15 h-15">
                <svg viewBox="0 0 36 36" className="w-18 h-18">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
                    strokeDasharray="100" strokeDashoffset="68" strokeLinecap="round" transform="rotate(-90 18 18)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center w-18 h-18">
                  <span className="text-sm font-bold text-yellow-600">32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ManagerUsers />
    </div>
  )
}

export default ManagerDashboard;