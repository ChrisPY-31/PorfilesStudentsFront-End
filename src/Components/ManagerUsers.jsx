import React, { useEffect, useState } from 'react';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { useGetAllUsersQuery } from '../services/UserSlice';
import { useUserBlockedMutation } from '../services/autenticateUser';
import { useAppSelector } from '../Hooks/store';
import { toast } from 'sonner';

const ManagerUsers = () => {
  const [users, setUsers] = useState([]);
  const { data } = useGetAllUsersQuery();
  const [userBlocked, { isSuccess, isError, data: bloqueo }] = useUserBlockedMutation();
  const { userToken } = useAppSelector(state => state.users)

  useEffect(() => {
    if (isSuccess) {
      if (bloqueo.message === 'Cuenta desbloqueada con exito') {

      }
      if (bloqueo.message === "Cuenta bloqueada tempralmente"){
        
      }
      console.log(bloqueo)
      toast.success("Estudiante bloqueado con exito");
      return
    }
    if (isError) {
      S
      toast.error("Error del servidor intentelo mas tarde")
    }
  }, [isSuccess, isError])


  const toggleUserStatus = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'Inactivo' ? 'Activo' : 'Inactivo' }
        : user
    ));

    userBlocked({ userToken, userId })

  };


  useEffect(() => {
    if (data) {
      setUsers(data.content)
    }
  }, [data])

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto mt-1">

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-500 text-white">
            <div className="grid grid-cols-12 gap-4 p-3 font-bold">
              <div className="col-span-5 px-3 py-2">Nombre</div>
              <div className="col-span-3 px-3 py-2">Rol</div>
              <div className="col-span-2 px-3 py-2">Estado</div>
              <div className="col-span-2 px-3 py-2 text-center">Acción</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`grid grid-cols-12 gap-4 p-2 items-center hover:bg-green-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                  }`}
              >
                <div className="col-span-5 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-800">{user.nombre} {user.apellido}</span>
                  </div>
                </div>

                <div className="col-span-3 px-3 py-2">
                  <span className="text-gray-600">Estudiante</span>
                </div>

                <div className="col-span-2 px-3 py-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.status === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Activo' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    {user.status}
                  </span>
                </div>

                <div className="col-span-2 px-3 py-2">
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium border cursor-pointer ${user.status === 'Inactivo'
                        ? 'text-green-600 hover:bg-red-50 border-red-200'
                        : 'text-red-600 hover:bg-green-50 border-green-200'
                        }`}
                    >
                      {user.status === 'Inactivo' ? (
                        <>
                          <FaLock className="text-lg" />
                          <span>Activar</span>
                        </>
                      ) : (
                        <>
                          <FaUnlock className="text-lg" />
                          <span>Bloquear</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                {/* Mostrando {users.length} estudiantes */}
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  Anterior
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerUsers;
