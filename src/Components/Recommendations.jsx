import React, { useEffect, useState } from 'react'
import { IoAdd, IoPencilOutline, IoRibbonOutline } from 'react-icons/io5'
import { useAppSelector } from '../Hooks/store'
import RecomendacionCard from './RecomendacionCard'
import CreateRecommendationForm from './CreateRecomendationForm'

/**
 * perfil: dueño del perfil que se esta viendo
 * esMiPerfil: el usuario autenticado es el dueño
 * onGuardado: recarga el perfil despues de crear/editar/eliminar
 * abrirRecomendar: abre el formulario al montar (boton "Recomendar" del perfil del alumno)
 */
const Recommendations = ({ recomendaciones = [], perfil, esMiPerfil = false, onGuardado, abrirRecomendar, onRecomendarAbierto }) => {
  const { userId, user: yo } = useAppSelector(state => state.users)
  // null = cerrado; { estudiante, comentarioActual } = abierto
  const [formulario, setFormulario] = useState(null)

  const lista = recomendaciones ?? []
  const perfilEsMaestro = perfil?.tipo === 'teacher'
  const soyMaestro = yo?.tipo === 'teacher'

  // Maestro viendo el perfil de un alumno: puede recomendarlo o editar la que ya le dio
  const puedoRecomendarAqui = soyMaestro && !esMiPerfil && perfil?.tipo === 'student'
  const miRecomendacion = puedoRecomendarAqui ? lista.find(r => r.maestro?.id === userId) : null
  const estudianteDelPerfil = perfil && {
    id: perfil.id, nombre: perfil.nombre, apellido: perfil.apellido, imagen: perfil.imagen, carrera: perfil.carrera
  }

  const abrirRecomendarAlumno = () => setFormulario({
    estudiante: estudianteDelPerfil,
    comentarioActual: miRecomendacion?.comentario
  })

  useEffect(() => {
    if (abrirRecomendar && puedoRecomendarAqui) {
      abrirRecomendarAlumno()
      onRecomendarAbierto?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abrirRecomendar])

  const ordenadas = [...lista].sort((a, b) => (b.fechaRecomendacion ?? '').localeCompare(a.fechaRecomendacion ?? ''))
  const yaRecomendados = new Set(lista.map(r => r.estudiante?.id ?? r.id?.idStudent))

  const titulo = perfilEsMaestro
    ? (esMiPerfil ? 'Recomendaciones que diste' : 'Recomendaciones que ha dado')
    : (esMiPerfil ? 'Recomendaciones recibidas' : 'Recomendaciones de docentes')

  const mensajeVacio = perfilEsMaestro
    ? (esMiPerfil ? 'Aún no has recomendado a ningún estudiante.' : 'Este docente aún no ha recomendado a nadie.')
    : (esMiPerfil
      ? 'Aún no tienes recomendaciones. Cuando un docente te recomiende, aparecerá aquí.'
      : 'Este estudiante aún no tiene recomendaciones.')

  return (
    <div className='w-full max-w-3xl mx-auto px-4 pb-10'>
      <div className='flex items-center justify-between gap-3 mb-6'>
        <h2 className='text-3xl font-bold text-gray-900'>{titulo}</h2>

        {perfilEsMaestro && esMiPerfil && (
          <button
            type='button'
            onClick={() => setFormulario({ estudiante: null })}
            className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-md hover:bg-green-700 transition-colors'
          >
            <IoAdd className='size-5' /> Nueva recomendación
          </button>
        )}

        {puedoRecomendarAqui && (
          <button
            type='button'
            onClick={abrirRecomendarAlumno}
            className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-md hover:bg-green-700 transition-colors'
          >
            {miRecomendacion ? <IoPencilOutline className='size-4' /> : <IoRibbonOutline className='size-4' />}
            {miRecomendacion ? 'Editar mi recomendación' : 'Recomendar'}
          </button>
        )}
      </div>

      {ordenadas.length > 0 ? (
        <div className='space-y-4'>
          {ordenadas.map(recomendacion => {
            const esMia = soyMaestro && recomendacion.maestro?.id === userId
            const idEstudiante = recomendacion.estudiante?.id ?? recomendacion.id?.idStudent
            return (
              <RecomendacionCard
                key={`${recomendacion.maestro?.id}-${idEstudiante}`}
                recomendacion={recomendacion}
                modo={perfilEsMaestro ? 'dada' : 'recibida'}
                puedeGestionar={esMia}
                onGuardado={onGuardado}
                onEdit={() => setFormulario({
                  estudiante: perfilEsMaestro ? recomendacion.estudiante : estudianteDelPerfil,
                  comentarioActual: recomendacion.comentario
                })}
              />
            )
          })}
        </div>
      ) : (
        <div className='flex flex-col items-center gap-2 py-12 border-2 border-dashed border-gray-200 rounded-2xl text-center'>
          <IoRibbonOutline className='size-10 text-gray-300' />
          <p className='text-gray-500 max-w-sm'>{mensajeVacio}</p>
        </div>
      )}

      {formulario && (
        <CreateRecommendationForm
          estudiante={formulario.estudiante}
          comentarioActual={formulario.comentarioActual}
          yaRecomendados={yaRecomendados}
          onGuardado={onGuardado}
          onClose={() => setFormulario(null)}
        />
      )}
    </div>
  )
}

export default Recommendations
