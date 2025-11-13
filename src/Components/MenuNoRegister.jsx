import React from 'react'

const MenuNoRegister = ({ onOpenForm, titulo, mensaje, descripcion, buttonMensaje, myAccount , tipo}) => {

    return (
        <div className='flex justify-between gap-3 border-2 border-gray-300 my-10 p-4 h-[225px] max-h-max rounded-xl border-dotted'>
            <div className='w-3/4 flex flex-col justify-around'>
                <h3 className='text-2xl font-bold  text-gray-400'>{titulo}</h3>
                <p className=' text-gray-500/50'>{mensaje}</p>
                <div className=' text-gray-500/50'>
                    <p>{descripcion}</p>
                </div>

                <div className='w-1/4'>
                    {(myAccount && tipo === "teacher") &&
                        <button
                            onClick={onOpenForm}
                            className='border-blue-500 border-2 p-1 rounded-2xl px-3 hover:bg-blue-300/30 cursor-pointer hover:border-blue-80 text-blue-500 font-semibold w-[200px]'>{buttonMensaje}</button>

                    }
                    {(myAccount && tipo === "student") &&
                        <button
                            onClick={onOpenForm}
                            className='border-blue-500 border-2 p-1 rounded-2xl px-3 hover:bg-blue-300/30 cursor-pointer hover:border-blue-80 text-blue-500 font-semibold w-[200px]'>{buttonMensaje}</button>

                    }
                </div>
            </div>
        </div>
    )
}

export default MenuNoRegister