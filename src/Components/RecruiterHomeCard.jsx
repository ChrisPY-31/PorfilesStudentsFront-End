import { Link } from "react-router-dom";
import { IoBusinessOutline, IoBriefcaseOutline, IoPeopleOutline, IoChatbubblesOutline, IoChevronForward } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";

// Accesos a sus secciones en Cuenta y seguridad (Manager lee state.ajuste)
const ACCESOS = [
  { texto: "Mis vacantes", icono: <IoBriefcaseOutline className="size-4 text-gray-400" />, ajuste: "mis-vacantes" },
  { texto: "Postulantes", icono: <IoPeopleOutline className="size-4 text-gray-400" />, ajuste: "postulantes" },
  { texto: "Mensajes", icono: <IoChatbubblesOutline className="size-4 text-gray-400" />, ajuste: "mensajes" },
];

// Tarjeta izquierda de Inicio para el reclutador: sus datos, su empresa y accesos rapidos.
// Todo sale del perfil de la sesion (GET /userAccount trae posicion y empresaAsociada)
const RecruiterHomeCard = () => {
  const { user, userId } = useAppSelector(state => state.users);
  const empresa = user?.empresaAsociada;

  return (
    <div className="w-60 bg-white rounded-2xl shadow overflow-hidden">
      <div className="imagen__home h-16 bg-cover" />
      <div className="px-4 pb-4">
        <Link to={`/MyProfile/${userId}`} aria-label="Ver mi perfil">
          <img
            className="-mt-8 size-16 rounded-full object-cover ring-4 ring-white shadow-md"
            src={user?.imagen || FOTO_DEFAULT}
            alt="foto de perfil"
          />
        </Link>
        <div className="mt-2">
          <h2 className="font-semibold text-gray-900 text-lg leading-tight">{user?.nombre} {user?.apellido}</h2>
          <p className="mt-0.5 text-sm text-gray-600">{user?.posicion || "Reclutador"}</p>
        </div>

        {empresa?.idCorporacion && (
          <Link
            to={`/Empresa/${empresa.idCorporacion}`}
            className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2.5 group"
          >
            <span className="size-9 shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
              {empresa.logo
                ? <img src={empresa.logo} alt="" className="size-full object-contain" />
                : <IoBusinessOutline className="size-5" />}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-semibold text-gray-900 truncate group-hover:text-green-700">{empresa.nombreEmpresa}</span>
              {empresa.categoria && <span className="block text-xs text-gray-500 truncate">{empresa.categoria}</span>}
            </span>
          </Link>
        )}

        <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          {ACCESOS.map(({ texto, icono, ajuste }) => (
            <li key={ajuste}>
              <Link
                to="/sing-in-and-security"
                state={{ ajuste }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-green-50 transition-colors"
              >
                {icono}
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

export default RecruiterHomeCard;
