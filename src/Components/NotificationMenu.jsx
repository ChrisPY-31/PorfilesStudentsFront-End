import React from 'react'

const NotificationMenu = ({ recomendaciones }) => {

    console.log(recomendaciones)

    return (
        <div className='absolute top-15 right-0 w-[300px] h-[400px] p-4 bg-white rounded shadow-lg z-50'>
            <h2 className='font-semibold text-xl mb-2'>Notificaciones</h2>
            <div className='overflow-y-auto h-[350px]'>
                {recomendaciones?.map(recomendacion => (
                    <div className='flex gap-3 items-center'>
                        <img 
                        className='size-8 rounded-full'
                        src={recomendacion?.maestro?.imagen ? recomendacion?.maestro?.imagen : 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'} alt="" />
                        El maestro {recomendacion.maestro.nombre} {recomendacion.maestro.apellido} te recomendo
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NotificationMenu
