import React, { useState } from 'react';
import { FaLock, FaUnlock } from 'react-icons/fa';

const ManagerUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Sofia Rodriguez', role: 'Estudiante', status: 'Activo' },
    { id: 2, name: 'Mateo Vargas', role: 'Estudiante', status: 'Activo' },
    { id: 3, name: 'Isabella Torres', role: 'Estudiante', status: 'Inactivo' },
    { id: 4, name: 'Carlos Mendoza', role: 'Estudiante', status: 'Activo' },
    { id: 5, name: 'Valentina Cruz', role: 'Estudiante', status: 'Inactivo' },
  ]);

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Activo' ? 'Inactivo' : 'Activo' }
        : user
    ));
  };

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
                className={`grid grid-cols-12 gap-4 p-2 items-center hover:bg-green-50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                }`}
              >
                <div className="col-span-5 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </div>

                <div className="col-span-3 px-3 py-2">
                  <span className="text-gray-600">{user.role}</span>
                </div>

                <div className="col-span-2 px-3 py-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.status === 'Activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      user.status === 'Activo' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {user.status}
                  </span>
                </div>

                <div className="col-span-2 px-3 py-2">
  <div className="flex justify-center">
    <button
      onClick={() => toggleUserStatus(user.id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium border cursor-pointer ${
        user.status === 'Activo'
          ? 'text-red-600 hover:bg-red-50 border-red-200'
          : 'text-green-600 hover:bg-green-50 border-green-200'
      }`}
    >
      {user.status === 'Activo' ? (
        <>
          <FaLock className="text-lg" />
          <span>Bloquear</span>
        </>
      ) : (
        <>
          <FaUnlock className="text-lg" />
          <span>Activar</span>
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

// import React from 'react';
// import { FaLock, FaUnlock } from 'react-icons/fa';
// import { useSelector } from 'react-redux';

// const ManagerUsers = () => {
//   // Obtener estudiantes desde Redux en lugar del useState mock
//   const { students } = useSelector(state => state.students);

//   // Si quieres mantener la funcionalidad de activar/desactivar
//   const [localUsers, setLocalUsers] = React.useState([]);

//   // Sincronizar con los datos de Redux
//   React.useEffect(() => {
//     if (students.length > 0) {
//       // Mapear los estudiantes de Redux a tu formato
//       const mappedUsers = students.map(student => ({
//         id: student.id,
//         name: student.name,
//         role: 'Estudiante', 
//         status: 'Activo', // Por defecto todos activos
//         image: student.image, // Agregamos la imagen real
//         carrera: student.carrera // Agregamos la carrera
//       }));
//       setLocalUsers(mappedUsers);
//     }
//   }, [students]);

//   const toggleUserStatus = (userId) => {
//     setLocalUsers(localUsers.map(user => 
//       user.id === userId 
//         ? { ...user, status: user.status === 'Activo' ? 'Inactivo' : 'Activo' }
//         : user
//     ));
//   };

//   return (
//     <div className="bg-gray-50">
//       <div className="max-w-6xl mx-auto mt-1">
        
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="bg-green-600 text-white">
//             <div className="grid grid-cols-12 gap-4 p-3 font-bold">
//               <div className="col-span-5 px-3 py-2">Nombre</div>
//               <div className="col-span-3 px-3 py-2">Rol</div>
//               <div className="col-span-2 px-3 py-2">Estado</div>
//               <div className="col-span-2 px-3 py-2 text-center">Acción</div>
//             </div>
//           </div>

//           <div className="divide-y divide-gray-100">
//             {localUsers.map((user, index) => (
//               <div 
//                 key={user.id} 
//                 className={`grid grid-cols-12 gap-4 p-2 items-center hover:bg-green-50 transition-colors duration-150 ${
//                   index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
//                 }`}
//               >
//                 <div className="col-span-5 px-3 py-2">
//                   <div className="flex items-center gap-3">
//                     {/* Usar la imagen real en lugar del círculo con iniciales */}
//                     <img 
//                       src={user.image} 
//                       alt={user.name}
//                       className="w-8 h-8 rounded-full object-cover"
//                     />
//                     <div>
//                       <span className="font-medium text-gray-800 block">{user.name}</span>
//                       <span className="text-sm text-gray-500">{user.carrera}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="col-span-3 px-3 py-2">
//                   <span className="text-gray-600">{user.role}</span>
//                 </div>

//                 <div className="col-span-2 px-3 py-2">
//                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                     user.status === 'Activo' 
//                       ? 'bg-green-100 text-green-800' 
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     <span className={`w-2 h-2 rounded-full mr-2 ${
//                       user.status === 'Activo' ? 'bg-green-500' : 'bg-red-500'
//                     }`}></span>
//                     {user.status}
//                   </span>
//                 </div>

//                 <div className="col-span-2 px-3 py-2">
//                   <div className="flex justify-center">
//                     <button
//                       onClick={() => toggleUserStatus(user.id)}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium border cursor-pointer ${
//                         user.status === 'Activo'
//                           ? 'text-red-600 hover:bg-red-50 border-red-200'
//                           : 'text-green-600 hover:bg-green-50 border-green-200'
//                       }`}
//                     >
//                       {user.status === 'Activo' ? (
//                         <>
//                           <FaLock className="text-lg" />
//                           <span>Bloquear</span>
//                         </>
//                       ) : (
//                         <>
//                           <FaUnlock className="text-lg" />
//                           <span>Activar</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-600 text-sm">
//                 Mostrando {localUsers.length} estudiantes
//               </p>
//               <div className="flex gap-2">
//                 <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
//                   Anterior
//                 </button>
//                 <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer">
//                   Siguiente
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManagerUsers;