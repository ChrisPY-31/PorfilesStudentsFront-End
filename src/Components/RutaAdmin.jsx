import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../Hooks/store'
import { useGetloginAdminQuery } from '../services/autenticateUser'

/**
 * Solo deja pasar a quien el back reconoce como ADMIN (GET /manager responde 200).
 * Sin sesion -> inicio publico; con sesion sin permisos -> /Inicio.
 */
const RutaAdmin = ({ children }) => {
  const { userToken } = useAppSelector(state => state.users)
  const { isSuccess, isError } = useGetloginAdminQuery(userToken, { skip: !userToken })

  if (!userToken) return <Navigate to='/' replace />
  if (isError) return <Navigate to='/Inicio' replace />
  if (!isSuccess) {
    return (
      <div className='min-h-screen grid place-items-center text-sm text-gray-500'>
        Verificando permisos...
      </div>
    )
  }
  return children
}

export default RutaAdmin
