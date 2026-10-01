import React from 'react'

// Pestañas del perfil (Perfil / Proyectos / Recomendaciones); `extra` va a la derecha
const PerfilTabs = ({ pestanas, activa, onChange, extra }) => (
  <div className='w-full max-w-5xl mx-auto px-4'>
    <div className='flex items-center justify-between gap-3 border-b border-gray-200'>
      <nav className='flex gap-1 -mb-px overflow-x-auto'>
        {pestanas.map(({ id, label }) => (
          <button
            key={id}
            type='button'
            onClick={() => onChange(id)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activa === id
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
          >
            {label}
          </button>
        ))}
      </nav>
      {extra}
    </div>
  </div>
)

export default PerfilTabs
