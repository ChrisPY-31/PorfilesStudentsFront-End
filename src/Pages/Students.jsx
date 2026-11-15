import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IoPeopleOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetCareersQuery, useGetUbicationsQuery } from "../services/UserSlice";
import { useGetStudentsQuery, useGetTechnologiesQuery } from "../services/projectsUser";
import { useDebounce } from "../Hooks/useDebounce";
import { POR_PAGINA } from "../helpers/paginacion";
import Paginacion from "../Components/Paginacion";
import StudentFilters from "../Components/StudentFilters";
import StudentResultCard from "../Components/StudentResultCard";
import { obtenerMensajeError } from "../helpers";

// GET /students pagina (20) y aplica todos los filtros y el orden en el back

// Los filtros viven en la URL (?carrera=1&tec=55,58) para poder recargar o compartir la busqueda
const leerFiltros = (params) => ({
  q: params.get("q") ?? "",
  carrera: Number(params.get("carrera")) || null,
  semestre: Number(params.get("semestre")) || null,
  ubicacion: Number(params.get("ubicacion")) || null,
  tecnologias: (params.get("tec") ?? "").split(",").map(Number).filter(Boolean),
  proyectos: params.get("proyectos") === "1",
  recomendados: params.get("recomendados") === "1",
  orden: params.get("orden") ?? "recientes",
});

const escribirFiltros = (f) => {
  const params = {};
  if (f.q) params.q = f.q;
  if (f.carrera) params.carrera = f.carrera;
  if (f.semestre) params.semestre = f.semestre;
  if (f.ubicacion) params.ubicacion = f.ubicacion;
  if (f.tecnologias.length) params.tec = f.tecnologias.join(",");
  if (f.proyectos) params.proyectos = "1";
  if (f.recomendados) params.recomendados = "1";
  if (f.orden !== "recientes") params.orden = f.orden;
  return params;
};

const Students = () => {
  const { userToken } = useAppSelector(state => state.users);
  const { data: carreras = [] } = useGetCareersQuery({ token: userToken });
  const { data: ubicaciones = [] } = useGetUbicationsQuery({ token: userToken });
  const { data: tecnologias = [] } = useGetTechnologiesQuery();

  const [params, setParams] = useSearchParams();
  const filtros = leerFiltros(params);
  const [pagina, setPagina] = useState(0);

  const cambiarFiltros = (parcial) => {
    setParams(escribirFiltros({ ...filtros, ...parcial }), { replace: true });
    setPagina(0);
  };

  // El texto se manda al back cuando se deja de escribir
  const q = useDebounce(filtros.q.trim());
  const { data, isLoading, isFetching, error, refetch } = useGetStudentsQuery({
    page: pagina,
    size: POR_PAGINA,
    q,
    idCarrera: filtros.carrera,
    semestre: filtros.semestre,
    idUbicacion: filtros.ubicacion,
    tecnologias: filtros.tecnologias,
    conProyectos: filtros.proyectos,
    recomendados: filtros.recomendados,
    orden: filtros.orden,
  });
  const resultados = useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? 0;
  const totalPaginas = data?.totalPages ?? 0;

  // Si cambia el total y la pagina ya no existe, se regresa a la ultima
  useEffect(() => {
    if (data && pagina > 0 && pagina >= totalPaginas) setPagina(Math.max(0, totalPaginas - 1));
  }, [data, pagina, totalPaginas]);

  const hayFiltros = Boolean(filtros.q.trim() || filtros.carrera || filtros.semestre || filtros.ubicacion
    || filtros.tecnologias.length || filtros.proyectos || filtros.recomendados);
  const cambiarPagina = (n) => { setPagina(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    // Alto minimo de la pantalla menos la barra (h-16) para que el footer no suba con pocos estudiantes
    <section className="min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado y filtros a 1152px; solo las tarjetas usan el ancho completo (1280px) */}
        <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="mt-1 text-gray-500">Encuentra estudiantes por carrera, semestre o tecnologías que dominan.</p>
        </div>

        <StudentFilters
          filtros={filtros}
          onChange={cambiarFiltros}
          onLimpiar={() => cambiarFiltros({ carrera: null, semestre: null, ubicacion: null, tecnologias: [], proyectos: false, recomendados: false })}
          carreras={carreras}
          ubicaciones={ubicaciones}
          tecnologias={tecnologias}
        />


        </div>

        {/* Resultados */}
        {!isLoading && !error && (
          <p className="mt-6 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{total}</span> {total === 1 ? "estudiante encontrado" : "estudiantes encontrados"}
          </p>
        )}

        <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
          {isLoading && [...Array(4)].map((_, i) => (
            <div key={i} className="p-6 border border-gray-200 rounded-2xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-5 h-3 w-full rounded bg-gray-200" />
              <div className="mt-2 h-3 w-4/5 rounded bg-gray-200" />
            </div>
          ))}

          {resultados.map(estudiante => (
            <StudentResultCard key={estudiante.id} estudiante={estudiante} />
          ))}
        </div>

        {error && (
          <div className="mt-6 p-6 text-center border border-gray-200 rounded-2xl">
            <p className="text-gray-700">{obtenerMensajeError(error, "No se pudieron cargar los estudiantes")}</p>
            <button type="button" onClick={refetch} className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700">
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && resultados.length === 0 && (
          <div className="mt-2 flex flex-col items-center gap-2 py-16 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <IoPeopleOutline className="size-10 text-gray-300" />
            <p className="text-gray-500">
              {hayFiltros ? "Ningún estudiante coincide con tu búsqueda." : "Todavía no hay estudiantes registrados."}
            </p>
          </div>
        )}

        {!error && (
          <Paginacion
            className="mt-8"
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            porPagina={POR_PAGINA}
            onCambiar={cambiarPagina}
            cargando={isFetching}
          />
        )}
      </div>
    </section>
  );
};

export default Students;
