import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IoPeopleOutline, IoInformationCircleOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetCareersQuery, useGetUbicationsQuery } from "../services/UserSlice";
import { useGetStudentsForMentionsQuery, useGetTechnologiesQuery } from "../services/projectsUser";
import StudentFilters from "../Components/StudentFilters";
import StudentResultCard from "../Components/StudentResultCard";
import { obtenerMensajeError } from "../helpers";

const POR_PAGINA = 12;

// Sin mayusculas ni acentos: "Peña" y "pena" coinciden
const normalizar = (texto = "") => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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

// TEMPORAL: se filtra en el front con lo que trae GET /students. Cuando exista la busqueda
// en el back, esto se reemplaza por la consulta con los mismos filtros.
// Un filtro cuyo dato no viene en la respuesta no excluye a nadie.
const aplicarFiltros = (estudiantes, f) => {
  const q = normalizar(f.q.trim());
  const lista = estudiantes.filter(s =>
    (!q || normalizar(`${s.nombre} ${s.apellido}`).includes(q)) &&
    (!f.carrera || s.carrera?.idCarrera === f.carrera) &&
    (!f.semestre || s.semestre === undefined || s.semestre === f.semestre) &&
    (!f.ubicacion || s.ubicacion === undefined || s.ubicacion?.idUbicacion === f.ubicacion) &&
    (!f.tecnologias.length || s.tecnologias === undefined || f.tecnologias.every(id => s.tecnologias.some(t => (t.idTecnologia ?? t.id) === id))) &&
    (!f.proyectos || s.totalProyectos === undefined || s.totalProyectos > 0) &&
    (!f.recomendados || s.totalRecomendaciones === undefined || s.totalRecomendaciones > 0)
  );
  const orden = {
    recientes: (a, b) => b.id - a.id,
    nombre: (a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, "es"),
    recomendaciones: (a, b) => (b.totalRecomendaciones ?? 0) - (a.totalRecomendaciones ?? 0),
  }[f.orden];
  return orden ? [...lista].sort(orden) : lista;
};

const Students = () => {
  const { userToken } = useAppSelector(state => state.users);
  const { data: estudiantes = [], isLoading, error, refetch } = useGetStudentsForMentionsQuery();
  const { data: carreras = [] } = useGetCareersQuery({ token: userToken });
  const { data: ubicaciones = [] } = useGetUbicationsQuery({ token: userToken });
  const { data: tecnologias = [] } = useGetTechnologiesQuery();

  const [params, setParams] = useSearchParams();
  const filtros = leerFiltros(params);
  const [visibles, setVisibles] = useState(POR_PAGINA);

  const cambiarFiltros = (parcial) => {
    setParams(escribirFiltros({ ...filtros, ...parcial }), { replace: true });
    setVisibles(POR_PAGINA);
  };

  const resultados = useMemo(() => aplicarFiltros(estudiantes, filtros), [estudiantes, params]); // eslint-disable-line react-hooks/exhaustive-deps

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

        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <IoInformationCircleOutline className="size-4 shrink-0 mt-0.5" />
          Vista previa: por ahora solo filtran nombre y carrera. Semestre, ubicación, tecnologías, proyectos y recomendados se activarán cuando el back tenga la búsqueda.
        </div>

        </div>

        {/* Resultados */}
        {!isLoading && !error && (
          <p className="mt-6 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{resultados.length}</span> {resultados.length === 1 ? "estudiante encontrado" : "estudiantes encontrados"}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {resultados.slice(0, visibles).map(estudiante => (
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
            <p className="text-gray-500">Ningún estudiante coincide con tu búsqueda.</p>
          </div>
        )}

        {resultados.length > visibles && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibles(v => v + POR_PAGINA)}
              className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Students;
