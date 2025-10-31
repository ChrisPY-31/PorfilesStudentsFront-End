import { useGetPublicationsQuery } from "../services/publication";
import { useUserPublications } from "../Hooks/useUserPublications"
import { useEffect, useState } from "react";
import { GrGallery } from "react-icons/gr";
import CreatePublicationForm from "./CreatePublicationForm";
const Comunity = () => {

  const { data, isLoading, error } = useGetPublicationsQuery();
  const [publications, setPublications] = useState([])

  useEffect(() => {
    if (data) {
      setPublications(data)
    }
  }, [data])

  if (isLoading) return console.log("cargando")
  if (error) return console.log("errorrrr chavalin")

  console.log(publications)

  return (
    <div className="w-[70%] mx-auto mt-4">
      <div className="flex justify-around gap-4">
        <div className="h-[100px] bg-red-300 w-1/4 rounded-2xl ">
          perfil usuario
        </div>

        <div className="flex-1">

          <div className="h-[100px] bg-white p-4 rounded-2xl shadow">
            <input
              className="w-full p-2 rounded-2xl shadow outline-none"
              type="text" placeholder="Crear publicacion" />
            <div className="">
              <span className="hover:bg-green-400"><GrGallery className="inline mx-1" />Foto</span>
            </div>
          </div>
          {publications.map((publication) => (
            <CreatePublicationForm
              nombre = {publication.persona?.nombre}
              apellido = {publication.persona?.apellido}
              imagenPersona = {publication.persona?.imagen}
              especialidad = {publication.persona?.especialidad}
              descripcion = {publication.descripcion}
              imagenPublicacion = {publication.imagen}
            />
          ))}
        </div>

        <div className="bg-gray-500 w-1/4 rounded-2xl h-[100px]">
          profesores
        </div>

      </div>
    </div>
  )
}

export default Comunity