import React from 'react'
import RecomendacionCard from './RecomendacionCard'

const Recommendations = ({ recomendaciones }) => {
  return (
    <div className='w-[60%] mx-auto '>
      <h2 className='text-center text-3xl'>Recomendaciones de Docentes</h2>
      {recomendaciones.map((recomendacion , index)=> {
        return <RecomendacionCard
          key={index}
          comentario={recomendacion.comentario}
          fecha={recomendacion.fechaRecomendacion}
          nombreMaestro={recomendacion.maestro.nombre}
          apellidoMaestro={recomendacion.maestro.apellido}
          image={recomendacion.maestro.imagen}
        />
      })}

    </div>
  )
}

export default Recommendations