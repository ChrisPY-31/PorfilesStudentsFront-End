import React from 'react'
import { Link } from 'react-router-dom'
import { IoNotificationsOffOutline } from 'react-icons/io5'
import NotificationItem from './NotificationItem'
import { useNotifications } from '../Hooks/useNotifications'

const MAX_EN_MENU = 5

const NotificationMenu = ({ onClose }) => {
  const { notificaciones, noLeidas, isLoading, abrir, marcarTodas } = useNotifications()

  const handleAbrir = (notificacion) => {
    abrir(notificacion)
    onClose()
  }

  return (
    <div className='absolute top-14 right-0 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
        <h2 className='font-bold text-gray-900'>Notificaciones</h2>
        {noLeidas.length > 0 && (
          <button type='button' onClick={marcarTodas} className='text-xs font-semibold text-green-700 hover:underline'>
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className='max-h-[380px] overflow-y-auto divide-y divide-gray-50'>
        {isLoading && [...Array(3)].map((_, i) => (
          <div key={i} className='flex gap-3 px-4 py-3 animate-pulse'>
            <div className='size-9 rounded-full bg-gray-200' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-full rounded bg-gray-200' />
              <div className='h-3 w-1/3 rounded bg-gray-200' />
            </div>
          </div>
        ))}

        {!isLoading && notificaciones.length === 0 && (
          <div className='flex flex-col items-center gap-2 py-10 text-center'>
            <IoNotificationsOffOutline className='size-8 text-gray-300' />
            <p className='text-sm text-gray-500'>No tienes notificaciones</p>
          </div>
        )}

        {notificaciones.slice(0, MAX_EN_MENU).map(n => (
          <NotificationItem key={n.id} notificacion={n} onClick={handleAbrir} compacta />
        ))}
      </div>

      <Link
        to='/Notificaciones'
        onClick={onClose}
        className='block px-4 py-3 text-center text-sm font-semibold text-green-700 border-t border-gray-100 hover:bg-gray-50'
      >
        Ver todas
      </Link>
    </div>
  )
}

export default NotificationMenu
