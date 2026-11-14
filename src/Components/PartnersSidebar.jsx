import { Link } from "react-router-dom";
import { IoBusinessOutline, IoChevronForward, IoAlertCircleOutline } from "react-icons/io5";
import { useGetCompaniesQuery } from "../services/company";

// Columna derecha de Inicio: empresas con convenio vigente (GET /companies, publico).
// Cada una lleva a su pagina publica /Empresa/:idCorporacion
const PartnersSidebar = () => {
  const { data, isLoading, isError, refetch } = useGetCompaniesQuery();
  const empresas = Array.isArray(data) ? data : [];

  return (
    <aside className="w-72 bg-white rounded-2xl shadow overflow-hidden">
      <div className="flex items-baseline justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <h3 className="font-display text-lg font-bold text-gray-900">Convenios</h3>
        {!isLoading && !isError && empresas.length > 0 && (
          <span className="text-xs text-gray-500">{empresas.length} {empresas.length === 1 ? "empresa" : "empresas"}</span>
        )}
      </div>

      {isLoading && (
        <ul className="p-2 space-y-1 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-2 py-2">
              <div className="size-10 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-200" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <div className="p-4 text-center text-sm text-gray-600">
          <IoAlertCircleOutline className="mx-auto size-6 text-red-400" />
          <p className="mt-1">No se pudieron cargar las empresas.</p>
          <button type="button" onClick={refetch} className="mt-2 font-semibold text-green-700 hover:underline">
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !isError && empresas.length === 0 && (
        <p className="p-4 text-center text-sm text-gray-500">Aún no hay empresas con convenio.</p>
      )}

      {!isLoading && !isError && empresas.length > 0 && (
        <ul className="p-2 max-h-[calc(85dvh-4rem)] overflow-y-auto">
          {empresas.map(empresa => (
            <li key={empresa.idCorporacion}>
              <Link
                to={`/Empresa/${empresa.idCorporacion}`}
                className="group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="size-10 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
                  {empresa.logo
                    ? <img src={empresa.logo} alt={`Logo de ${empresa.nombreEmpresa}`} className="size-full object-contain" />
                    : <div className="size-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <IoBusinessOutline className="size-5" />
                    </div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{empresa.nombreEmpresa}</p>
                  {(empresa.categoria || empresa.sector) && (
                    <p className="text-xs text-gray-500 truncate">{empresa.categoria || empresa.sector}</p>
                  )}
                </div>
                <IoChevronForward className="size-4 shrink-0 text-gray-300 group-hover:text-green-600" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default PartnersSidebar;
