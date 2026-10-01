import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoSchoolOutline, IoLocationOutline, IoFolderOpenOutline, IoRibbonOutline } from 'react-icons/io5'
import { useUserAccount } from '../Hooks/useUserAccount'
import { useAppSelector } from '../Hooks/store'
import { useGetUserByIdQuery } from '../services/UserSlice'

const FOTO_DEFAULT = 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'
const MAX_TECNOLOGIAS = 6

// Tarjeta de un estudiante en la busqueda
const StudentResultCard = ({ estudiante }) => {
  const navigate = useNavigate()
  const { getIdUser } = useUserAccount()
  const { userToken } = useAppSelector(state => state.users)
  const { id, nombre, apellido, imagen, carrera } = estudiante

  // TEMPORAL: GET /students no trae tecnologias, ubicacion, semestre ni contadores, asi que se
  // completan con el perfil (GET /person/{id}). Si el back ya los manda en la lista, se usan esos
  const { data, isLoading: cargandoPerfil } = useGetUserByIdQuery({ id, token: userToken }, { skip: !userToken })
  const perfil = data?.object
  const especialidad = estudiante.especialidad ?? perfil?.especialidad
  const descripcion = estudiante.descripcion ?? perfil?.descripcion
  const semestre = estudiante.semestre ?? perfil?.semestre
  const ubicacion = estudiante.ubicacion ?? perfil?.ubicacion
  const tecnologias = estudiante.tecnologias ?? perfil?.habilidades?.filter(h => h.tipo === 'TECNOLOGIA') ?? []
  const totalProyectos = estudiante.totalProyectos ?? perfil?.proyectos?.length
  const totalRecomendaciones = estudiante.totalRecomendaciones ?? perfil?.recomendaciones?.length

  const verPerfil = () => {
    navigate(`/Person/${id}`)
    localStorage.setItem('idPerson', id)
    getIdUser(id)
  }

  const extraTecnologias = (tecnologias?.length ?? 0) - MAX_TECNOLOGIAS

  return (
    <article className='group flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-green-300 transition-all'>
      <div className='flex flex-col flex-1 p-6'>
        {/* Foto + nombre */}
        <div className='flex items-center gap-4'>
          <img className='size-16 shrink-0 rounded-full object-cover' src={imagen || FOTO_DEFAULT} alt='' />
          <div className='flex-1 min-w-0'>
            <h3 className='text-lg font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors'>{nombre} {apellido}</h3>
            {especialidad && <p className='mt-0.5 text-sm text-gray-700 truncate'>{especialidad}</p>}
          </div>
          {semestre && (
            <span className='shrink-0 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700'>{semestre}° semestre</span>
          )}
        </div>

        {/* Datos */}
        <div className='mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500'>
          {carrera?.carrera && (
            <span className='flex items-center gap-1.5'><IoSchoolOutline className='size-4 shrink-0' /> {carrera.carrera}</span>
          )}
          {ubicacion?.estado && (
            <span className='flex items-center gap-1.5'><IoLocationOutline className='size-4 shrink-0' /> {ubicacion.estado}</span>
          )}
        </div>

        {/* Acerca de (recortado a 3 lineas) */}
        {descripcion && (
          <p className='mt-4 text-sm text-gray-600 leading-relaxed line-clamp-3'>{descripcion}</p>
        )}

        {/* Tecnologias */}
        {cargandoPerfil && (
          <div className='mt-4 flex gap-1.5 animate-pulse'>
            <div className='h-6 w-16 rounded-full bg-gray-200' />
            <div className='h-6 w-20 rounded-full bg-gray-200' />
            <div className='h-6 w-14 rounded-full bg-gray-200' />
          </div>
        )}
        {tecnologias?.length > 0 && (
          <div className='mt-4'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400'>Tecnologías</p>
            <div className='flex flex-wrap gap-1.5'>
              {tecnologias.slice(0, MAX_TECNOLOGIAS).map(t => (
                <span key={t.idTecnologia ?? t.id} className='px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium'>
                  {t.nombre}
                </span>
              ))}
              {extraTecnologias > 0 && <span className='px-2 py-1 text-xs font-medium text-gray-500'>+{extraTecnologias} más</span>}
            </div>
          </div>
        )}

        {/* Pie */}
        <div className='mt-auto pt-5'>
          <div className='flex items-center justify-between gap-3 pt-4 border-t border-gray-100'>
            <div className='flex gap-4 text-xs text-gray-500'>
              {totalProyectos !== undefined && (
                <span className='flex items-center gap-1'><IoFolderOpenOutline className='size-4' /> {totalProyectos} {totalProyectos === 1 ? 'proyecto' : 'proyectos'}</span>
              )}
              {totalRecomendaciones !== undefined && (
                <span className='flex items-center gap-1'><IoRibbonOutline className='size-4' /> {totalRecomendaciones} {totalRecomendaciones === 1 ? 'recomendación' : 'recomendaciones'}</span>
              )}
            </div>
            <button
              type='button'
              onClick={verPerfil}
              className='shrink-0 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors'
            >
              Ver perfil
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default StudentResultCard
