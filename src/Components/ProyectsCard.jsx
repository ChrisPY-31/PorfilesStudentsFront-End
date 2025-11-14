import React from 'react'
import { SlPencil } from 'react-icons/sl'
import { formatearFecha } from '../helpers'

const ProyectsCard = ({ nombre, descripcion, imagen, fechaInicio, fechaFin, github, deploy, menciones, tecnologias, myAccount, openMenu, onEdit }) => {

    const handleClick = () => {
        openMenu()
        onEdit()
    }

    return (
        <div className='flex justify-between gap-3 border border-gray-300 my-10 p-4 h-[325px] max-h-max rounded-xl'>
            {myAccount && <SlPencil className='size-5  cursor-pointer absolute right-44'
                onClick={handleClick}
            />}
            <div className='w-3/4 flex flex-col justify-around'>
                <h3 className='text-2xl font-bold'>{nombre}</h3>
                <p>{descripcion}</p>
                <div className='flex gap-2'>
                    <p>{formatearFecha(fechaInicio)}</p>
                </div>

                <div>
                    <h4>Tecnologias</h4>
                    <div className='flex gap-4'>
                        {
                            tecnologias?.map(tecnology => (
                                <p key={tecnology.id}>{tecnology.nombre}</p>
                            ))
                        }
                    </div>
                </div>

                <div>
                    {
                        menciones ? (
                            <div className='h-[100px]'>
                                <h4>Colaboradores</h4>
                                <div className='flex gap-5'>
                                    {
                                        menciones?.map(mencion => (
                                            <img className='size-10 rounded-full' src={mencion.imagen ? mencion.imagen : "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true"} alt={mencion.nombre} key={mencion.id} />
                                        ))
                                    }
                                </div>
                            </div>) : ""
                    }
                </div>
            </div>
            {imagen &&
                <div className='w-1/4'>
                    <a href={`${deploy}`} target='_blank'>
                        <img className='h-full object-contain w-full rounded-xl'
                            src={`${imagen && imagen}`} alt="" />
                    </a>
                </div>
            }
        </div>
    )
}

export default ProyectsCard