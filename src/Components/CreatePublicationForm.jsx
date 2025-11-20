import React, { useEffect, useState } from 'react'
import { AiOutlineLike } from 'react-icons/ai'
import { BiLike } from 'react-icons/bi'
import { LuMessageSquareText } from 'react-icons/lu'

const CreatePublicationForm = ({ id, nombre, apellido, imagenPersona, especialidad, descripcion, imagenPublicacion, handleClickRecomendation, setComentario, comentario, onChangeComent, numDeComent, interacciones }) => {

    const [añadirComentario, setAñadirComentario] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        onChangeComent(añadirComentario, id)
        setAñadirComentario('')
    }

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
                {imagenPublicacion ?
                    <img src={`${imagenPublicacion ? imagenPublicacion : ""}`} alt="imagen_persona" /> : null
                }
            </div>
            <div className='mt-2 '>
                <div className='flex justify-between w-[90%] mx-auto'>
                    <div className='flex gap-2'>
                        <AiOutlineLike className='size-5 items-center border-1 rounded-full bg-blue-600  text-white border-white ' />
                        <span>0</span>
                    </div>

                    <span>
                        {numDeComent} {" "}
                        comentarios
                    </span>
                </div>
            </div>

            <div className='flex justify-around border-t-1 mt-2'>
                <button
                    onClick={() => handleClickRecomendation(id)}
                    className='flex items-center p-2 cursor-pointer gap-1 hover:bg-emerald-500/7'>
                    <BiLike />
                    Recomendar
                </button>

                <button
                    onClick={() => setComentario(true)}
                    className='flex items-center p-2 cursor-pointer gap-1 hover:bg-emerald-500/7'>
                    <LuMessageSquareText />
                    Comentar
                </button>
            </div>
            {comentario && <div className='min-h-36'>
                <form className='relative' onSubmit={(e) => handleSubmit(e)}>
                    <div className={`${añadirComentario.length > 0 ? 'py-8 w-full  rounded-xl shadow outline-none' : "w-full rounded-xl shadow outline-none"} p-2 h-10`}>
                        <input
                            value={añadirComentario}
                            onChange={(e) => setAñadirComentario(e.target.value)}
                            className='absolute top-0 outline-none w-full text-[14px]'
                            type="text" placeholder="Añadir un comentario"
                        />
                        {añadirComentario.length > 0 &&
                            <button
                                className='px-4 py-0 bg-blue-600 rounded-xl text-white font-semibold absolute right-3 bottom-2
                            cursor-pointer hover:bg-blue-800
                            '>comentar</button>
                        }

                    </div>
                    <div>
                        {interacciones?.map(interacion => {
                            return <div>
                                {interacion.comentario}
                            </div>
                        })}
                    </div>
                </form>
            </div>}
        </div>
    )
}

export default CreatePublicationForm