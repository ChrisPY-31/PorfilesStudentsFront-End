import { Link } from "react-router-dom";
import { IoLocationOutline, IoGridOutline, IoPeopleOutline, IoPersonAddOutline, IoChevronForward } from "react-icons/io5";
import { useGetInstitutionQuery } from "../services/institution";
import LogoCU from "../assets/LogoCUTianguistenco.jpg";

// Accesos al panel de administrador (/Manager): `menu` es la seccion que abre
const ACCESOS = [
  { texto: "Panel de administración", icono: IoGridOutline, menu: 2 },
  { texto: "Usuarios", icono: IoPeopleOutline, menu: 4 },
  { texto: "Crear cuenta", icono: IoPersonAddOutline, menu: 3 },
];

// Tarjeta izquierda de Inicio para el ADMIN: publica como la institucion,
// asi que se muestran los datos del perfil institucional
const InstitutionHomeCard = () => {
  const { data: perfil, isLoading, isError } = useGetInstitutionQuery();

  if (isLoading) {
    return (
      <div className="w-60 bg-white rounded-2xl shadow overflow-hidden animate-pulse">
        <div className="h-16 bg-gray-200" />
        <div className="px-4 pb-4">
          <div className="-mt-8 size-16 rounded-xl bg-gray-300 ring-4 ring-white" />
          <div className="mt-3 h-4 w-32 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (isError || !perfil) {
    return (
      <div className="w-60 p-4 bg-white rounded-2xl shadow text-sm text-gray-600">
        No se pudo cargar el perfil de la institución.
        <Link to="/Institucion" className="block mt-2 font-semibold text-green-700 hover:underline">Ir a la institución</Link>
      </div>
    );
  }

  return (
    <div className="w-60 bg-white rounded-2xl shadow overflow-hidden">
      {perfil.banner
        ? <img src={perfil.banner} alt="" className="h-16 w-full object-cover" />
        : <div className="imagen__home h-16 bg-cover" />}

      <div className="px-4 pb-4">
        {/* Sin logo propio se usa el del CU */}
        <div className="-mt-8 size-16 rounded-xl ring-4 ring-white bg-white shadow-md overflow-hidden">
          <img src={perfil.logo || LogoCU} alt={`Logo de ${perfil.nombre}`} className="size-full object-contain" />
        </div>

        <div className="mt-2">
          <h2 className="font-semibold text-gray-900 text-lg leading-tight">{perfil.nombre}</h2>
          <p className="mt-0.5 text-sm text-gray-600">Administración</p>
        </div>

        {perfil.ubicacion && (
          <ul className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <IoLocationOutline className="size-4 mt-0.5 shrink-0 text-gray-400" /> {perfil.ubicacion}
            </li>
          </ul>
        )}

        <Link
          to="/Institucion"
          className="mt-4 block w-full py-2 text-center text-sm font-semibold text-green-700 border border-green-600 rounded-xl hover:bg-green-50 transition-colors"
        >
          Ver página de la institución
        </Link>

        <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          {ACCESOS.map(({ texto, icono: Icono, menu }) => (
            <li key={menu}>
              <Link
                to="/Manager"
                state={{ menu }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-green-50 transition-colors"
              >
                <Icono className="size-4 text-gray-400" />
                <span className="flex-1">{texto}</span>
                <IoChevronForward className="size-4 text-gray-300" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InstitutionHomeCard;
