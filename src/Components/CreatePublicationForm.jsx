import React from 'react'
import { BiLike } from 'react-icons/bi'
import { LuMessageSquareText } from 'react-icons/lu'

const CreatePublicationForm = ({nombre , apellido ,imagenPersona , especialidad , descripcion , imagenPublicacion}) => {
    return (
        
        <div className='rounded my-3 min-h-[200px] px-4 py-1 shadow'>
            <div className='flex gap-2'>
                <img
                    className='size-12 rounded-full'
                    src={`${imagenPersona ? imagenPersona : "https://avatars.githubusercontent.com/u/1561955?v=4"}`} alt="" />
                <div>
                    <h3>{`${nombre} ${apellido}`}</h3>
                    <p>{especialidad}</p>
                </div>
            </div>
            <div className='text-[13px] my-2'>
                <p>{descripcion}</p>
            </div>
            <div>
                { imagenPublicacion ?
                <img src={`${imagenPublicacion ? imagenPublicacion : ""}`} alt="imagen_persona" />:null
                }
            </div>

            <div className='flex justify-around border-t-1 mt-2'>
                <button 
                className='flex items-center p-2 cursor-pointer gap-1 hover:bg-emerald-500/7'>
                    <BiLike/>
                    Recomendar
                </button>

                <button 
                className='flex items-center p-2 cursor-pointer gap-1 hover:bg-emerald-500/7'>
                    <LuMessageSquareText />
                    Comentar
                </button>
            </div>
        </div>
    )
}

export default CreatePublicationForm