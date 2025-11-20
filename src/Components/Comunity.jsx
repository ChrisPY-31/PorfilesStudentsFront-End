import { useGetPublicationsQuery, useInteractionPublicationMutation } from "../services/publication";
import { useEffect, useState } from "react";
import { GrGallery } from "react-icons/gr";
import CreatePublicationForm from "./CreatePublicationForm";
import { useGetAccountUserByUsernameQuery, useGetTeachersQuery } from "../services/UserSlice";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import CreatePost from "./CreatePost";
import { toast } from "sonner";
import StudentCard from "./StudentCard";
const Comunity = () => {

  const [publications, setPublications] = useState([])
  const [publicationMenu, setPublicationMenu] = useState(false)
  const [comentario, setComentario] = useState(false)
  const [teachers, setTeachers] = useState([])
  const { data, isLoading, error } = useGetPublicationsQuery();
  const { data: getAllteachers } = useGetTeachersQuery()
  const { user } = useAppSelector(state => state.users)
  const [interactionpublication] = useInteractionPublicationMutation();
  const { userId, userToken } = useAppSelector(state => state.users)



  useEffect(() => {
    if (data) {
      setPublications(data)
    }
  }, [data])

  useEffect(() => {
    if (getAllteachers) {
      setTeachers(getAllteachers)
    }
  }, [getAllteachers])

  if (isLoading) return;
  if (error) return;


  const handleClickRecomendation = async (idPublication) => {
    const interaction = {
      id: {
        idPublication: idPublication,
        idPerson: userId
      },
      meGusta: true,
      comentario: "",

    }
    console.log(interaction)

    await interactionpublication({ userToken, interaction })
  }

  const onChangeComent = async (comentario, idPublication) => {
    const interaction = {
      id: {
        idPublication: idPublication,
        idPerson: userId
      },
      meGusta: true,
      comentario: comentario,

    }
    console.log(interaction)
    await interactionpublication({ userToken, interaction })

  }

  return (
    <div className="w-[70%] mx-auto mt-4 ">
      <div className="flex justify-around gap-4 ">
        <div className="h-[250px] w-1/4 rounded-2xl relative shadow ">
          <div className="imagen__home h-[75px] rounded-t-xl bg-contain "></div>
          <div className="p-4">
            <img className='rounded-full flex items-center justify-center shadow-md absolute top-10 size-18'
              src={`${user?.imagen ? user.imagen : 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'}`} alt="foto de perfil" />
            <div className="mt-6 ">
              <h2 className="font-semibold text-gray-900 text-lg">{user.nombre} {user.apellido}</h2>
              <p className="text-gray-600">{user?.especialidad}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 h-[85dvh] px-6 py-4 rounded-2xl shadow overflow-y-scroll ">

          <div className="h-[100px] bg-white p-4 rounded-2xl shadow">
            <input
              className="w-full p-2 rounded-2xl shadow outline-none"
              type="text" placeholder="Crear publicacion"
              onClick={() => setPublicationMenu(true)}
            />

          </div>
          {publications.map((publication) => (
            <CreatePublicationForm
              key={publication.id}
              id={publication.id}
              nombre={publication.persona?.nombre}
              apellido={publication.persona?.apellido}
              imagenPersona={publication.persona?.imagen}
              especialidad={publication.persona?.especialidad}
              descripcion={publication.descripcion}
              imagenPublicacion={publication.imagen}
              handleClickRecomendation={handleClickRecomendation}
              setComentario={setComentario}
              comentario={comentario}
              onChangeComent={onChangeComent}
              numDeComent={publication?.interacciones.length}
              interacciones={publication?.interacciones}
            />
          ))}

        </div>

        {teachers?.lenght === 0 ?
          <div></div>
          :
          <div className="w-1/4 rounded-2xl border border-gray-300 ">
            <div className="px-4">
              <h3 className="text-center text-2xl font-semibold ">Maestros</h3>
              {teachers.map(teacher => {
                return <StudentCard
                  key={teacher.id}
                  id={teacher.id}
                  nombre={teacher.nombre}
                  apellido={teacher.apellido}
                  imagen={teacher.imagen}
                />
              })}
            </div>
          </div>
        }

      </div>
      {publicationMenu &&
        <CreatePost
          imagen={user?.imagen}
          onClose={() => setPublicationMenu(false)} />
      }
    </div>
  )
}

export default Comunity