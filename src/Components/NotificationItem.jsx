import React from 'react'
import { IoRibbonOutline, IoCodeSlashOutline, IoNotificationsOutline } from 'react-icons/io5'
import { tiempoRelativo } from '../helpers'

// Icono y color por tipo; los tipos que no conocemos usan la campana
const ESTILOS = {
  RECOMMENDATION: { icon: IoRibbonOutline, clase: 'bg-green-100 text-green-700', etiqueta: 'Recomendación' },
  PROJECT_MENTION: { icon: IoCodeSlashOutline, clase: 'bg-blue-100 text-blue-700', etiqueta: 'Mención en proyecto' },
}
const ESTILO_DEFAULT = { icon: IoNotificationsOutline, clase: 'bg-gray-100 text-gray-600', etiqueta: 'Aviso' }

const NotificationItem = ({ notificacion, onClick, compacta = false }) => {
  const { message, read, createdAt, type } = notificacion
  const { icon: Icono, clase, etiqueta } = ESTILOS[type] ?? ESTILO_DEFAULT

  return (
    <button
      type='button'
      onClick={() => onClick(notificacion)}
      className={`w-full flex items-start gap-3 text-left transition-colors ${compacta ? 'px-4 py-3' : 'p-4 rounded-xl'} ${read ? 'hover:bg-gray-50' : 'bg-green-50/60 hover:bg-green-50'}`}
    >
      <div className={`shrink-0 flex items-center justify-center rounded-full ${clase} ${compacta ? 'size-9' : 'size-11'}`}>
        <Icono className={compacta ? 'size-4' : 'size-5'} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className={`text-sm break-words ${read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{message}</p>
        <p className='mt-0.5 text-xs text-gray-500'>{etiqueta} · {tiempoRelativo(createdAt)}</p>
      </div>
      {!read && <span className='shrink-0 mt-1.5 size-2.5 rounded-full bg-green-600' aria-label='No leída' />}
    </button>
  )
}

export default NotificationItem
