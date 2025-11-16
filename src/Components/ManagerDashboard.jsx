// import React from 'react';
// import ManagerUsers from './ManagerUsers';

// const ManagerDashboard = () => {
//   return (
//     <div className="flex-1 p-7 border-2 border-gray-200">
//       <div className="p-4">
//         <h2 className="text-xl font-bold mb-3"> Dashboard </h2>


//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           {/* Tarjeta de Total de Usuarios */}
//           <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-2xl font-bold mb-2">1,250</h3>
//                 <p className="text-gray-600">Total de usuarios</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="mt-4 flex items-center">
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
//               </div>
//             </div>
//           </div>

//           {/* Tarjeta de Estudiantes Registrados */}
//           <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-2xl font-bold mb-2">850</h3>
//                 <p className="text-gray-600">Estudiantes registrados</p>
//               </div>
//               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="mt-4">
//               <div className="flex items-center">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
//                 </div>
//                 <span className="ml-2 text-sm text-gray-600">68%</span>
//               </div>
//             </div>
//           </div>

//           {/* Tarjeta de Estudiantes Pendientes */}
//           <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-2xl font-bold mb-2">400</h3>
//                 <p className="text-gray-600">Estudiantes pendientes</p>
//               </div>
//               <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
//                 <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="mt-4">
//               <div className="flex items-center">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '32%' }}></div>
//                 </div>
//                 <span className="ml-2 text-sm text-gray-600">32%</span>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div> 

//       <ManagerUsers/> 
//     </div> 
//   )
// }

// export default ManagerDashboard;

//GRAFICOS CIRCULARES 
import React from 'react';
import ManagerUsers from './ManagerUsers';

const ManagerDashboard = () => {
  return (
    <div className="flex-1 p-7 border-2 border-gray-200">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-3"> Dashboard </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-2">1,250</h3>
                <p className="text-gray-600">Total de usuarios</p>
              </div>
              <div className="relative w-15 h-15">
                <svg viewBox="0 0 36 36" className="w-18 h-18">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3" 
                    strokeDasharray="100" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 18 18)"/>
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
                <h3 className="text-2xl font-bold mb-2">850</h3>
                <p className="text-gray-600">Estudiantes registrados</p>
              </div>
              <div className="relative w-15 h-15">
                <svg viewBox="0 0 36 36" className="w-18 h-18">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3" 
                    strokeDasharray="100" strokeDashoffset="32" strokeLinecap="round" transform="rotate(-90 18 18)"/>
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
                <h3 className="text-2xl font-bold mb-2">400</h3>
                <p className="text-gray-600">Estudiantes pendientes</p>
              </div>
              <div className="relative w-15 h-15">
                <svg viewBox="0 0 36 36" className="w-18 h-18">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3" 
                    strokeDasharray="100" strokeDashoffset="68" strokeLinecap="round" transform="rotate(-90 18 18)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center w-18 h-18">
                  <span className="text-sm font-bold text-yellow-600">32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div> 

      <ManagerUsers/> 
    </div> 
  )
}

export default ManagerDashboard;