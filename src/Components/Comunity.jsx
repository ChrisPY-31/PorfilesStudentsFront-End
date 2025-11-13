import { useGetPublicationsQuery } from "../services/publication";
import { useEffect, useState } from "react";
import { GrGallery } from "react-icons/gr";
import CreatePublicationForm from "./CreatePublicationForm";
import { useGetAccountUserByUsernameQuery } from "../services/UserSlice";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import CreatePost from "./CreatePost";
const Comunity = () => {

  const [publications, setPublications] = useState([])
  const [publicationMenu, setPublicationMenu] = useState(false)
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const { data, isLoading, error } = useGetPublicationsQuery();
  const { user } = useAppSelector(state => state.users)

  useEffect(() => {
    if (data) {
      setPublications(data)
    }
  }, [data])


  if (isLoading) return console.log("cargando")
  if (error) return console.log("errorrrr chavalin")

  return (
    <div className="w-[70%] mx-auto mt-4 ">
      <div className="flex justify-around gap-4 ">
        <div className="h-[250px] w-1/4 rounded-2xl relative shadow ">
          <div className="imagen__home h-[75px] rounded-t-xl bg-contain "></div>
          <div className="p-4">
            <img className='rounded-full flex items-center justify-center shadow-md absolute top-10 size-18' 
            src={`${user?.imagen ? user.imagen :'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true' }`} alt="foto de perfil" />
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
              nombre={publication.persona?.nombre}
              apellido={publication.persona?.apellido}
              imagenPersona={publication.persona?.imagen}
              especialidad={publication.persona?.especialidad}
              descripcion={publication.descripcion}
              imagenPublicacion={publication.imagen}
            />
          ))}

        </div>

        <div className="bg-gray-500 w-1/4 rounded-2xl h-[100px]">
          profesores
        </div>

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