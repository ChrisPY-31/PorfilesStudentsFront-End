import React from 'react'

const Habilities = ({ id, nombre, nivel }) => {
  return (
    <div>
      <ul>
        <li className='text-[14px]'>{nombre}</li>
      </ul>
    </div>
  )
}

export default Habilities