import React from 'react'

// Clases completas para que Tailwind las genere
const colores = {
  TECNOLOGIA: 'bg-green-50 text-green-700 border-green-200',
  APTITUD: 'bg-indigo-50 text-indigo-700 border-indigo-200'
}

const Habilities = ({ titulo, habilidades = [], tipo }) => {
  if (habilidades.length === 0) return null

  return (
    <div className='mt-3'>
      <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>{titulo}</p>
      <div className='flex flex-wrap gap-1.5'>
        {habilidades.map(habilidad => (
          <span
            key={`${habilidad.tipo}-${habilidad.id}`}
            className={`px-2.5 py-1 rounded-full border text-xs font-medium ${colores[tipo]}`}
          >
            {habilidad.nombre}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Habilities
