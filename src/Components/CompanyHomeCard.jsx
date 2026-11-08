import { Link } from "react-router-dom";
import { IoBusinessOutline, IoLayersOutline, IoLocationOutline, IoBriefcaseOutline, IoPeopleOutline, IoChevronForward } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetMyCompanyProfileQuery } from "../services/company";

// Tarjeta izquierda de Inicio para la cuenta de empresa (COMPANY_ADMIN):
// la cuenta no tiene perfil de persona, asi que se muestran los datos de la empresa
const CompanyHomeCard = () => {
  const { userToken } = useAppSelector(state => state.users);
  const { data: perfil, isLoading, isError } = useGetMyCompanyProfileQuery({ token: userToken }, { skip: !userToken });

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
        No se pudo cargar el perfil de tu empresa.
        <Link to="/MiEmpresa" className="block mt-2 font-semibold text-green-700 hover:underline">Ir a mi empresa</Link>
      </div>
    );
  }

  const accesos = [
    { texto: "Vacantes", icono: <IoBriefcaseOutline className="size-4 text-gray-400" />, ajuste: "vacantes" },
    { texto: "Reclutadores", icono: <IoPeopleOutline className="size-4 text-gray-400" />, ajuste: "reclutadores" },
  ];

  return (
    <div className="w-60 bg-white rounded-2xl shadow overflow-hidden">
      {perfil.banner
        ? <img src={perfil.banner} alt="" className="h-16 w-full object-cover" />
        : <div className="imagen__home h-16 bg-cover" />}

      <div className="px-4 pb-4">
        <div className="-mt-8 size-16 rounded-xl ring-4 ring-white bg-white shadow-md overflow-hidden">
          {perfil.logo
            ? <img src={perfil.logo} alt={`Logo de ${perfil.nombreEmpresa}`} className="size-full object-contain" />
            : <div className="size-full flex items-center justify-center bg-gray-100 text-gray-400">
              <IoBusinessOutline className="size-8" />
            </div>}
        </div>

        <div className="mt-2">
          <h2 className="font-semibold text-gray-900 text-lg leading-tight">{perfil.nombreEmpresa}</h2>
          <p className="mt-0.5 text-sm text-gray-600">Cuenta de empresa</p>
        </div>

        {(perfil.sector || perfil.ubicacion) && (
          <ul className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-sm text-gray-600">
            {perfil.sector && (
              <li className="flex items-start gap-2">
                <IoLayersOutline className="size-4 mt-0.5 shrink-0 text-gray-400" /> {perfil.sector}
              </li>
            )}
            {perfil.ubicacion && (
              <li className="flex items-start gap-2">
                <IoLocationOutline className="size-4 mt-0.5 shrink-0 text-gray-400" /> {perfil.ubicacion}
              </li>
            )}
          </ul>
        )}

        <Link
          to="/MiEmpresa"
          className="mt-4 block w-full py-2 text-center text-sm font-semibold text-green-700 border border-green-600 rounded-xl hover:bg-green-50 transition-colors"
        >
          Ver mi empresa
        </Link>

        <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1">
          {accesos.map(({ texto, icono, ajuste }) => (
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

export default CompanyHomeCard;
