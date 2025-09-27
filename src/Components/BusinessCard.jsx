import React from 'react'

const BusinessCard = ({ empresa }) => {
    return (
        <div className='flex-shrink-0 cursor-pointer '>
            <div className='relative h-[20px] w-full '>
                <img className='w-full h-full object-contain ' src={`${empresa.foto}`} alt={empresa.nombre} />
            </div>
        </div>
    )
}

export default BusinessCard