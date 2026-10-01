import React, { useMemo, useState } from 'react'
import { IoSearchOutline, IoCloseSharp } from 'react-icons/io5'
import { useAppSelector } from '../Hooks/store'
import { useGetAllProjectsQuery, useGetStudentsForMentionsQuery } from '../services/projectsUser'
import ProyectsCard from '../Components/ProyectsCard'
import { obtenerMensajeError } from '../helpers'

const AllProjects = () => {
  const { userToken } = useAppSelector(state => state.users)
  // Se vuelve a pedir en cada visita para ver los proyectos recien creados
  const { data: proyectos = [], isLoading, error, refetch } = useGetAllProjectsQuery({ token: userToken }, { refetchOnMountOrArgChange: true })
  // ProjectDto solo trae idEstudiante: el autor se busca en la lista de estudiantes
  const { data: estudiantes = [] } = useGetStudentsForMentionsQuery()

  const [busqueda, setBusqueda] = useState('')
  const [tecnologia, setTecnologia] = useState(null)

  const autores = useMemo(() => new Map(estudiantes.map(e => [e.id, e])), [estudiantes])

  // Solo las tecnologias que aparecen en algun proyecto, de la mas usada a la menos
  const tecnologiasUsadas = useMemo(() => {
    const conteo = new Map()
    proyectos.forEach(p => p.tecnologias?.forEach(t => {
      const actual = conteo.get(t.idTecnologia) ?? { ...t, total: 0 }
      conteo.set(t.idTecnologia, { ...actual, total: actual.total + 1 })
    }))
    return [...conteo.values()].sort((a, b) => b.total - a.total)
  }, [proyectos])

  const texto = busqueda.trim().toLowerCase()
  const filtrados = [...proyectos]
    .sort((a, b) => (b.idProject ?? 0) - (a.idProject ?? 0))
    .filter(p => !tecnologia || p.tecnologias?.some(t => t.idTecnologia === tecnologia))
    .filter(p => {
      if (!texto) return true
      const autor = autores.get(p.idEstudiante)
      return [p.nombre, p.descripcion, autor && `${autor.nombre} ${autor.apellido}`, ...(p.tecnologias ?? []).map(t => t.nombre)]
        .some(campo => campo?.toLowerCase().includes(texto))
    })

  return (
    <div className='w-full max-w-4xl mx-auto px-4 mt-8 pb-12'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Proyectos</h1>
        <p className='text-gray-500 mt-1'>Descubre lo que están construyendo los estudiantes.</p>
      </div>

      {/* Buscador */}
      <div className='relative'>
        <IoSearchOutline className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400' />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder='Busca por nombre, tecnología o estudiante...'
          className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all'
        />
      </div>

      {/* Filtro por tecnologia */}
      {tecnologiasUsadas.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-4'>
          {tecnologiasUsadas.map(t => {
            const activa = tecnologia === t.idTecnologia
            return (
              <button
                key={t.idTecnologia}
                type='button'
                onClick={() => setTecnologia(activa ? null : t.idTecnologia)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium transition-colors ${activa
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                  }`}
              >
                {t.nombre}
                <span className={activa ? 'text-green-100' : 'text-gray-400'}>{t.total}</span>
                {activa && <IoCloseSharp className='size-3.5' />}
              </button>
            )
          })}
        </div>
      )}

      <div className='mt-6 space-y-5'>
        {isLoading && [...Array(3)].map((_, i) => (
          <div key={i} className='flex gap-4 p-5 border border-gray-200 rounded-2xl animate-pulse'>
            <div className='hidden md:block w-64 h-36 rounded-xl bg-gray-200' />
            <div className='flex-1 space-y-3'>
              <div className='h-4 w-1/3 rounded bg-gray-200' />
              <div className='h-3 w-full rounded bg-gray-200' />
              <div className='h-3 w-2/3 rounded bg-gray-200' />
            </div>
          </div>
        ))}

        {error && (
          <div className='p-6 text-center border border-gray-200 rounded-2xl'>
            <p className='text-gray-700'>{obtenerMensajeError(error, 'No se pudieron cargar los proyectos')}</p>
            <button
              type='button'
              onClick={refetch}
              className='mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700'
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && filtrados.length === 0 && (
          <p className='py-12 text-center text-gray-400'>
            {proyectos.length === 0 ? 'Todavía no hay proyectos publicados.' : 'Ningún proyecto coincide con tu búsqueda.'}
          </p>
        )}

        {filtrados.map(proyecto => (
          <ProyectsCard
            key={proyecto.idProject}
            proyecto={proyecto}
            autor={autores.get(proyecto.idEstudiante)}
          />
        ))}
      </div>
    </div>
  )
}

export default AllProjects
