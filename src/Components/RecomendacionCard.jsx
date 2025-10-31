import React from 'react'

const RecomendacionCard = ({comentario , fecha , nombreMaestro , apellidoMaestro , imagen}) => {



  return (
    <div className='shadow p-2 flex gap-4 relative'>
            <img 
            className='size-24 rounded-full'
            src="https://todocodeacademy.com/wp-content/uploads/2023/04/luisinadepaula-150x150.jpeg" alt="" />
        <div>
            <span className='absolute right-2 text-gray-400'>{fecha}</span>
            <h3 className='text-xl font-semibold'>{`${nombreMaestro} ${apellidoMaestro} `}</h3>
            <p className='mt-2'>{comentario} </p>
        </div>
    </div>
  )
}

export default RecomendacionCard