import React, { useEffect, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoAlertCircleOutline, IoBriefcaseOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetJobsQuery } from "../services/jobs";
import { useGetCareersQuery } from "../services/UserSlice";
import { TIPOS_VACANTE, MODALIDADES, JORNADAS } from "../helpers/vacantes";
import { obtenerMensajeError } from "../helpers";
import JobCard from "../Components/JobCard";

const POR_PAGINA = 10;
const selectClass = "px-3 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

const Selector = ({ valor, onChange, etiqueta, opciones }) => (
    <select value={valor} onChange={(e) => onChange(e.target.value)} className={selectClass} aria-label={etiqueta}>
        <option value="">{etiqueta}</option>
        {opciones.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
);

// Pagina "Empleos" (/Empleos): vacantes publicadas de las empresas con convenio (GET /jobs, publico).
// Los filtros los aplica el back; la busqueda espera a que se deje de escribir
const Jobs = () => {
    const { userToken, user } = useAppSelector(state => state.users);
    const { data: carreras = [] } = useGetCareersQuery({ token: userToken }, { skip: !userToken });

    const [texto, setTexto] = useState("");
    const [q, setQ] = useState("");
    const [tipo, setTipo] = useState("");
    const [modalidad, setModalidad] = useState("");
    const [jornada, setJornada] = useState("");
    // El alumno empieza viendo las de su carrera
    const [idCarrera, setIdCarrera] = useState(() => (user?.carrera?.idCarrera ? String(user.carrera.idCarrera) : ""));
    const [pagina, setPagina] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setQ(texto.trim()), 400);
        return () => clearTimeout(t);
    }, [texto]);

    // Cualquier filtro nuevo regresa a la primera pagina
    useEffect(() => { setPagina(0); }, [q, tipo, modalidad, jornada, idCarrera]);

    const { data, isLoading, isFetching, isError, error, refetch } = useGetJobsQuery({
        q, tipo, modalidad, jornada, idCarrera, page: pagina, size: POR_PAGINA,
    });

    const vacantes = data?.content ?? [];
    const total = data?.totalElements ?? 0;
    const totalPaginas = data?.totalPages ?? 0;
    const hayFiltros = texto || tipo || modalidad || jornada || idCarrera;
    const limpiar = () => { setTexto(""); setTipo(""); setModalidad(""); setJornada(""); setIdCarrera(""); };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 mt-8 pb-12">
            <h1 className="font-display text-3xl font-bold text-gray-900">Empleos</h1>
            <p className="mt-1 text-gray-500">
                Empleo, servicio social, integrativa y prácticas profesionales en las empresas con convenio con la universidad.
            </p>

            {/* Buscador y filtros */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Buscar por puesto o palabra clave"
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                </div>
                <Selector valor={tipo} onChange={setTipo} etiqueta="Todos los tipos" opciones={Object.entries(TIPOS_VACANTE)} />
                <Selector valor={modalidad} onChange={setModalidad} etiqueta="Cualquier modalidad" opciones={Object.entries(MODALIDADES)} />
                <Selector valor={jornada} onChange={setJornada} etiqueta="Cualquier jornada" opciones={Object.entries(JORNADAS)} />
                <Selector
                    valor={idCarrera}
                    onChange={setIdCarrera}
                    etiqueta="Todas las carreras"
                    opciones={carreras.map(c => [String(c.idCarrera), c.carrera])}
                />
                {hayFiltros && (
                    <button type="button" onClick={limpiar} className="text-sm font-semibold text-green-700 hover:underline">
                        Limpiar filtros
                    </button>
                )}
            </div>

            {!isLoading && !isError && (
                <p className="mt-4 text-sm text-gray-500">
                    {total === 1 ? "1 vacante" : `${total} vacantes`}
                </p>
            )}

            {/* Lista */}
            <div className={`mt-3 space-y-4 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-44 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
                ) : isError ? (
                    <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                        <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                        <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar las vacantes")}</p>
                        <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                    </div>
                ) : vacantes.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                        <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                            <IoBriefcaseOutline className="size-7" />
                        </div>
                        <p className="mt-3 font-semibold text-gray-900">
                            {hayFiltros ? "Ninguna vacante coincide con tu búsqueda" : "Aún no hay vacantes publicadas"}
                        </p>
                        {hayFiltros && (
                            <button type="button" onClick={limpiar} className="mt-2 text-sm font-semibold text-green-700 hover:underline">
                                Ver todas las vacantes
                            </button>
                        )}
                    </div>
                ) : (
                    vacantes.map(v => <JobCard key={v.idVacante} vacante={v} mostrarEmpresa ocultarEstado />)
                )}
            </div>

            {/* Paginas */}
            {totalPaginas > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setPagina(p => p - 1)}
                        disabled={pagina === 0 || isFetching}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                        <FiChevronLeft className="size-4" /> Anterior
                    </button>
                    <span className="text-sm text-gray-500">Página {pagina + 1} de {totalPaginas}</span>
                    <button
                        type="button"
                        onClick={() => setPagina(p => p + 1)}
                        disabled={data?.last || isFetching}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                        Siguiente <FiChevronRight className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Jobs;
