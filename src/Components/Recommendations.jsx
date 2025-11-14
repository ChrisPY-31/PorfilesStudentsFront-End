import React, { useState } from 'react'
import RecomendacionCard from './RecomendacionCard'
import MenuNoRegister from './MenuNoRegister'
import CreateRecommendationForm from './CreateRecomendationForm';
import { formatearFecha } from '../helpers';
import { FaPlus } from 'react-icons/fa';

const Recommendations = ({ recomendaciones, myAccount, tipo, user }) => {

  const [menuCreateRecomendation, setMenuCreateRecomendation] = useState();


  return (
    <div className='w-[60%] mx-auto '>
      <h2 className='text-center text-3xl'>Recomendaciones de Docentes</h2>
      {(myAccount && tipo === "teacher")  && <div className='flex gap-2 mt-2'>
        <p>Deseas agregar una Recomendacion</p>
        <FaPlus className='cursor-pointer'
          onClick={()=>setMenuCreateRecomendation(true)}
        />
      </div>}
      {
        recomendaciones?.length === 0 && tipo === "teacher" ?
          tipo === "student" ?
            <MenuNoRegister
              onOpenForm={() => setMenuCreateRecomendation(true)}
              menuCreateRecomendation={setMenuCreateRecomendation}
              titulo="Recomendaciones"
              mensaje="Aqui estan recomendaciones"
              descripcion="Los maestros de pueden recomendar por algun trabajo trabajo o algun proyecto que les haya sorprendido"
              buttonMensaje='Añadir Recomendacion'
            />
            :
            <MenuNoRegister
              onOpenForm={() => setMenuCreateRecomendation(true)}
              menuCreateRecomendation={setMenuCreateRecomendation}
              titulo="Recomendaciones"
              mensaje="Aqui estan recomendaciones"
              descripcion="Los maestros de pueden recomendar por algun trabajo trabajo o algun proyecto que les haya sorprendido"
              buttonMensaje=''
            />
          :
          recomendaciones?.map((recomendacion, index) => {
            return <RecomendacionCard
              key={index}
              comentario={recomendacion.comentario}
              fecha={formatearFecha(recomendacion.fechaRecomendacion)}
              nombreMaestro={recomendacion.maestro.nombre}
              apellidoMaestro={recomendacion.maestro.apellido}
              imagen={recomendacion.maestro.imagen}
              estudiante={recomendacion.estudiante}
              tipo={tipo}
            />
          })}
      {menuCreateRecomendation && <CreateRecommendationForm onClose={() => setMenuCreateRecomendation(false)} user={user} />}

    </div>
  )
}

export default Recommendations