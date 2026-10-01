import { useGetPublicationsQuery } from "../services/publication";
import { useState } from "react";
import PublicationCard from "../Components/PublicationCard";
import { useGetTeachersQuery } from "../services/UserSlice";
import { useAppSelector } from "../Hooks/store";
import CreatePost from "../Components/CreatePost";
import StudentCard from "../Components/StudentCard";
import { obtenerMensajeError } from "../helpers";
import { IoLocationOutline, IoSchoolOutline, IoBookOutline } from "react-icons/io5";

const FOTO_DEFAULT = 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true';

const Comunity = () => {

  const [publicationMenu, setPublicationMenu] = useState(false);
  const { user, userToken } = useAppSelector(state => state.users);
  const { data, isLoading, error, refetch } = useGetPublicationsQuery({ token: userToken });
  const { data: teachers = [] } = useGetTeachersQuery();

  // Ciudad y estado si existen ("Toluca, Estado de México"), o el que haya
  const ubicacionUsuario = [user?.ciudad, user?.ubicacion?.estado].filter(Boolean).join(", ")

  // Las mas recientes primero
  const publications = [...(Array.isArray(data) ? data : [])]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-4 px-4">
      <div className="flex gap-5 items-start">

        {/* Info del usuario */}
        <div className="hidden lg:block w-60 shrink-0 bg-white rounded-2xl shadow overflow-hidden">
          <div className="imagen__home h-16 bg-cover"></div>
          <div className="px-4 pb-4">
            <img
              className="-mt-8 size-16 rounded-full object-cover ring-4 ring-white shadow-md"
              src={user?.imagen || FOTO_DEFAULT}
              alt="foto de perfil"
            />
            <div className="mt-2">
              <h2 className="font-semibold text-gray-900 text-lg leading-tight">{user.nombre} {user.apellido}</h2>
              {user?.especialidad && <p className="mt-0.5 text-sm text-gray-600">{user.especialidad}</p>}
            </div>

            {(ubicacionUsuario || user?.carrera?.carrera || user?.semestre) && (
              <ul className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-sm text-gray-600">
                {ubicacionUsuario && (
                  <li className="flex items-start gap-2">
                    <IoLocationOutline className="size-4 mt-0.5 shrink-0 text-gray-400" /> {ubicacionUsuario}
                  </li>
                )}
                {user?.carrera?.carrera && (
                  <li className="flex items-start gap-2">
                    <IoSchoolOutline className="size-4 mt-0.5 shrink-0 text-gray-400" /> {user.carrera.carrera}
                  </li>
                )}
                {user?.semestre && (
                  <li className="flex items-start gap-2">
                    <IoBookOutline className="size-4 mt-0.5 shrink-0 text-gray-400" /> {user.semestre}° semestre
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Publicaciones */}
        <div className="flex-1 min-w-0 h-[85dvh] px-6 py-4 rounded-2xl shadow overflow-y-scroll">
          <div className="max-w-[640px] mx-auto">

          {/* Crear publicación */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow">
            <img
              className="size-12 shrink-0 rounded-full object-cover"
              src={user?.imagen || FOTO_DEFAULT}
              alt="foto de perfil"
            />
            <button
              type="button"
              onClick={() => setPublicationMenu(true)}
              className="flex-1 text-left px-4 py-3 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-green-300 transition-colors cursor-pointer"
            >
              ¿Sobre qué quieres hablar?
            </button>
          </div>

          {/* Listado de publicaciones */}
          {isLoading && [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white mt-4 p-4 rounded-2xl shadow animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}

          {error && (
            <div className="mt-4 p-6 text-center bg-white rounded-2xl shadow">
              <p className="text-gray-700">{obtenerMensajeError(error, "No se pudieron cargar las publicaciones")}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && publications.length === 0 && (
            <p className="mt-8 text-center text-gray-400">Aún no hay publicaciones. ¡Sé el primero en publicar!</p>
          )}

          {publications.map(publication => (
            <PublicationCard key={publication.id} publicacion={publication} />
          ))}
          </div>

        </div>

        {/* Sección maestros */}
        <div className="hidden xl:block w-72 shrink-0 rounded-2xl border border-gray-300">
          <div className="px-4">
            <h3 className="text-center text-2xl font-semibold">Maestros</h3>
            {teachers.map(teacher => (
              <StudentCard
                key={teacher.id}
                id={teacher.id}
                nombre={teacher.nombre}
                apellido={teacher.apellido}
                imagen={teacher.imagen}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Modal crear publicación */}
      {publicationMenu && (
        <CreatePost
          imagen={user?.imagen}
          onClose={() => setPublicationMenu(false)}
        />
      )}
    </div>
  );
};

export default Comunity;
