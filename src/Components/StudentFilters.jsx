import React, { useEffect, useRef, useState } from 'react'
import {
  IoSearchOutline, IoChevronDown, IoCloseSharp, IoCheckmark,
  IoSchoolOutline, IoBookOutline, IoLocationOutline, IoCodeSlashOutline,
  IoFolderOpenOutline, IoRibbonOutline, IoSwapVertical
} from 'react-icons/io5'

const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const ORDENES = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'nombre', label: 'Nombre (A–Z)' },
  { value: 'recomendaciones', label: 'Más recomendados' },
]

// Boton con menu desplegable; se cierra al dar clic fuera
const Desplegable = ({ icono: Icono, label, activo, contador, children, ancho = 'w-64' }) => {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e) => { if (!ref.current?.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [abierto])

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setAbierto(v => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${activo
          ? 'border-green-600 bg-green-50 text-green-700'
          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          }`}
      >
        <Icono className='size-4' />
        {label}
        {contador > 0 && (
          <span className='min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-green-600 text-white text-[11px] font-bold'>{contador}</span>
        )}
        <IoChevronDown className={`size-4 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div className={`absolute left-0 mt-2 ${ancho} p-3 bg-white rounded-2xl shadow-xl border border-gray-100 z-30`}>
          {children(() => setAbierto(false))}
        </div>
      )}
    </div>
  )
}

const Interruptor = ({ icono: Icono, label, activo, onChange }) => (
  <button
    type='button'
    role='switch'
    aria-checked={activo}
    onClick={() => onChange(!activo)}
    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${activo
      ? 'border-green-600 bg-green-50 text-green-700'
      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
      }`}
  >
    <Icono className='size-4' />
    {label}
    <span className={`relative inline-flex h-4 w-7 rounded-full transition-colors ${activo ? 'bg-green-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-transform ${activo ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
    </span>
  </button>
)

const OpcionLista = ({ seleccionada, onClick, children }) => (
  <button
    type='button'
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${seleccionada ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
  >
    {children}
    {seleccionada && <IoCheckmark className='size-4 shrink-0' />}
  </button>
)

/**
 * filtros: { q, carrera, semestre, ubicacion, tecnologias: number[], proyectos, recomendados, orden }
 * onChange(parcial): actualiza solo los campos que cambian
 */
const StudentFilters = ({ filtros, onChange, onLimpiar, carreras, ubicaciones, tecnologias }) => {
  const [busquedaTec, setBusquedaTec] = useState('')

  const nombreCarrera = carreras.find(c => c.idCarrera === filtros.carrera)?.carrera
  const nombreUbicacion = ubicaciones.find(u => u.idUbicacion === filtros.ubicacion)?.estado
  const tecSeleccionadas = tecnologias.filter(t => filtros.tecnologias.includes(t.idTecnologia))
  const tecVisibles = tecnologias.filter(t => t.nombre.toLowerCase().includes(busquedaTec.trim().toLowerCase()))

  const toggleTecnologia = (id) => onChange({
    tecnologias: filtros.tecnologias.includes(id)
      ? filtros.tecnologias.filter(x => x !== id)
      : [...filtros.tecnologias, id]
  })

  // Chips de filtros activos (la busqueda y el orden no cuentan)
  const activos = [
    nombreCarrera && { key: 'carrera', label: nombreCarrera, quitar: () => onChange({ carrera: null }) },
    filtros.semestre && { key: 'semestre', label: `${filtros.semestre}° semestre`, quitar: () => onChange({ semestre: null }) },
    nombreUbicacion && { key: 'ubicacion', label: nombreUbicacion, quitar: () => onChange({ ubicacion: null }) },
    ...tecSeleccionadas.map(t => ({ key: `tec-${t.idTecnologia}`, label: t.nombre, quitar: () => toggleTecnologia(t.idTecnologia) })),
    filtros.proyectos && { key: 'proyectos', label: 'Con proyectos', quitar: () => onChange({ proyectos: false }) },
    filtros.recomendados && { key: 'recomendados', label: 'Recomendados', quitar: () => onChange({ recomendados: false }) },
  ].filter(Boolean)

  return (
    <div className='space-y-4'>
      {/* Buscador + orden */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <IoSearchOutline className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400' />
          <input
            value={filtros.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder='Busca por nombre o apellido...'
            className='w-full pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all'
          />
          {filtros.q && (
            <button
              type='button'
              onClick={() => onChange({ q: '' })}
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              aria-label='Borrar búsqueda'
            >
              <IoCloseSharp className='size-4' />
            </button>
          )}
        </div>
        <label className='relative flex items-center'>
          <IoSwapVertical className='absolute left-3.5 size-4 text-gray-500 pointer-events-none' />
          <select
            value={filtros.orden}
            onChange={(e) => onChange({ orden: e.target.value })}
            className='appearance-none pl-10 pr-10 py-3 bg-white border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-green-500 cursor-pointer'
          >
            {ORDENES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <IoChevronDown className='absolute right-3.5 size-4 text-gray-500 pointer-events-none' />
        </label>
      </div>

      {/* Filtros */}
      <div className='flex flex-wrap items-center gap-2'>
        <Desplegable icono={IoSchoolOutline} label='Carrera' activo={!!filtros.carrera} ancho='w-72'>
          {(cerrar) => (
            <div className='max-h-72 overflow-y-auto space-y-0.5'>
              {carreras.length === 0 && <p className='px-3 py-2 text-sm text-gray-400'>Cargando carreras...</p>}
              {carreras.map(c => (
                <OpcionLista
                  key={c.idCarrera}
                  seleccionada={filtros.carrera === c.idCarrera}
                  onClick={() => { onChange({ carrera: filtros.carrera === c.idCarrera ? null : c.idCarrera }); cerrar() }}
                >
                  {c.carrera}
                </OpcionLista>
              ))}
            </div>
          )}
        </Desplegable>

        <Desplegable icono={IoBookOutline} label='Semestre' activo={!!filtros.semestre} ancho='w-60'>
          {(cerrar) => (
            <div className='grid grid-cols-5 gap-1.5'>
              {SEMESTRES.map(n => (
                <button
                  key={n}
                  type='button'
                  onClick={() => { onChange({ semestre: filtros.semestre === n ? null : n }); cerrar() }}
                  className={`h-9 rounded-lg text-sm font-semibold transition-colors ${filtros.semestre === n ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  {n}°
                </button>
              ))}
            </div>
          )}
        </Desplegable>

        <Desplegable icono={IoLocationOutline} label='Ubicación' activo={!!filtros.ubicacion} ancho='w-64'>
          {(cerrar) => (
            <div className='max-h-72 overflow-y-auto space-y-0.5'>
              {ubicaciones.map(u => (
                <OpcionLista
                  key={u.idUbicacion}
                  seleccionada={filtros.ubicacion === u.idUbicacion}
                  onClick={() => { onChange({ ubicacion: filtros.ubicacion === u.idUbicacion ? null : u.idUbicacion }); cerrar() }}
                >
                  {u.estado}
                </OpcionLista>
              ))}
            </div>
          )}
        </Desplegable>

        <Desplegable icono={IoCodeSlashOutline} label='Tecnologías' activo={filtros.tecnologias.length > 0} contador={filtros.tecnologias.length} ancho='w-80'>
          {() => (
            <div>
              <div className='relative mb-2'>
                <IoSearchOutline className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400' />
                <input
                  value={busquedaTec}
                  onChange={(e) => setBusquedaTec(e.target.value)}
                  placeholder='Buscar tecnología...'
                  className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500'
                />
              </div>
              <div className='flex flex-wrap gap-1.5 max-h-56 overflow-y-auto'>
                {tecVisibles.map(t => {
                  const activa = filtros.tecnologias.includes(t.idTecnologia)
                  return (
                    <button
                      key={t.idTecnologia}
                      type='button'
                      onClick={() => toggleTecnologia(t.idTecnologia)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${activa
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                        }`}
                    >
                      {activa && <IoCheckmark className='size-3.5' />}
                      {t.nombre}
                    </button>
                  )
                })}
              </div>
              <p className='mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500'>Muestra alumnos que dominen todas las elegidas.</p>
            </div>
          )}
        </Desplegable>

        <span className='hidden sm:block h-6 w-px bg-gray-200 mx-1' />

        <Interruptor icono={IoFolderOpenOutline} label='Con proyectos' activo={filtros.proyectos} onChange={(v) => onChange({ proyectos: v })} />
        <Interruptor icono={IoRibbonOutline} label='Recomendados' activo={filtros.recomendados} onChange={(v) => onChange({ recomendados: v })} />
      </div>

      {/* Filtros activos */}
      {activos.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          {activos.map(f => (
            <span key={f.key} className='flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700'>
              {f.label}
              <button type='button' onClick={f.quitar} className='p-0.5 rounded-full hover:bg-gray-200' aria-label={`Quitar ${f.label}`}>
                <IoCloseSharp className='size-3.5' />
              </button>
            </span>
          ))}
          <button type='button' onClick={onLimpiar} className='ml-1 text-xs font-semibold text-green-700 hover:underline'>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}

export default StudentFilters
