import React, { useState } from 'react'
import { IoNotificationsOffOutline, IoCheckmarkDoneOutline } from 'react-icons/io5'
import NotificationItem from '../Components/NotificationItem'
import { useNotifications } from '../Hooks/useNotifications'
import { obtenerMensajeError } from '../helpers'

const DIA_MS = 24 * 60 * 60 * 1000

// Agrupa en Hoy / Esta semana / Anteriores conservando el orden
const agrupar = (lista) => {
  const inicioHoy = new Date()
  inicioHoy.setHours(0, 0, 0, 0)
  const grupos = [
    { titulo: 'Hoy', items: [] },
    { titulo: 'Esta semana', items: [] },
    { titulo: 'Anteriores', items: [] },
  ]
  lista.forEach(n => {
    const fecha = new Date(n.createdAt)
    if (fecha >= inicioHoy) grupos[0].items.push(n)
    else if (inicioHoy - fecha < 7 * DIA_MS) grupos[1].items.push(n)
    else grupos[2].items.push(n)
  })
  return grupos.filter(g => g.items.length > 0)
}

const Notifications = () => {
  const { notificaciones, noLeidas, isLoading, error, refetch, abrir, marcarTodas } = useNotifications()
  const [filtro, setFiltro] = useState('todas')

  const visibles = filtro === 'noLeidas' ? noLeidas : notificaciones
  const grupos = agrupar(visibles)

  return (
    <div className='w-full max-w-2xl mx-auto px-4 mt-8 pb-12'>
      <div className='flex flex-wrap items-center justify-between gap-3 mb-5'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Notificaciones</h1>
          <p className='text-gray-500 mt-1'>
            {noLeidas.length > 0 ? `Tienes ${noLeidas.length} sin leer` : 'Estás al día'}
          </p>
        </div>
        {noLeidas.length > 0 && (
          <button
            type='button'
            onClick={marcarTodas}
            className='flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50'
          >
            <IoCheckmarkDoneOutline className='size-4' /> Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filtro */}
      <div className='inline-flex p-1 mb-6 bg-gray-100 rounded-xl'>
        {[
          { valor: 'todas', label: 'Todas' },
          { valor: 'noLeidas', label: `No leídas${noLeidas.length ? ` (${noLeidas.length})` : ''}` },
        ].map(({ valor, label }) => (
          <button
            key={valor}
            type='button'
            onClick={() => setFiltro(valor)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filtro === valor ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className='space-y-3'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex gap-3 p-4 animate-pulse'>
              <div className='size-11 rounded-full bg-gray-200' />
              <div className='flex-1 space-y-2'>
                <div className='h-3 w-full rounded bg-gray-200' />
                <div className='h-3 w-1/4 rounded bg-gray-200' />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className='p-6 text-center border border-gray-200 rounded-2xl'>
          <p className='text-gray-700'>{obtenerMensajeError(error, 'No se pudieron cargar las notificaciones')}</p>
          <button
            type='button'
            onClick={refetch}
            className='mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700'
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && visibles.length === 0 && (
        <div className='flex flex-col items-center gap-2 py-16 border-2 border-dashed border-gray-200 rounded-2xl text-center'>
          <IoNotificationsOffOutline className='size-10 text-gray-300' />
          <p className='text-gray-500'>
            {filtro === 'noLeidas' ? 'No tienes notificaciones sin leer.' : 'Aún no tienes notificaciones.'}
          </p>
        </div>
      )}

      <div className='space-y-6'>
        {grupos.map(grupo => (
          <section key={grupo.titulo}>
            <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500'>{grupo.titulo}</h2>
            <div className='space-y-1'>
              {grupo.items.map(n => (
                <NotificationItem key={n.id} notificacion={n} onClick={abrir} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Notifications
