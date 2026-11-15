import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoAlertCircleOutline, IoDocumentsOutline, IoInformationCircleOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetCompanyApplicationsQuery, useGetCompanyApplicationsSummaryQuery, useGetCompanyJobOptionsQuery } from "../services/company";
import { useDebounce } from "../Hooks/useDebounce";
import { POR_PAGINA } from "../helpers/paginacion";
import Paginacion from "./Paginacion";
import { ESTADOS_POSTULACION } from "../helpers/vacantes";
import { obtenerMensajeError } from "../helpers";
import ApplicationCard from "./ApplicationCard";

const selectClass = "px-3 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

// `vacanteInicial` llega desde "Ver postulaciones" en la seccion de vacantes
const CompanyApplications = ({ vacanteInicial = "" }) => {
    const { userToken } = useAppSelector(state => state.users);
    const omitir = { skip: !userToken };
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");
    const [vacante, setVacante] = useState(vacanteInicial ? String(vacanteInicial) : "");
    const [pagina, setPagina] = useState(0);
    const q = useDebounce(busqueda.trim());
    const idVacante = vacante ? Number(vacante) : undefined;

    // Paginado y filtrado en el back (20)
    const { data, isLoading, isFetching, isError, error, refetch } = useGetCompanyApplicationsQuery(
        { token: userToken, idVacante, estado, q, page: pagina, size: POR_PAGINA }, omitir);
    const visibles = data?.content ?? [];
    const totalPaginas = data?.totalPages ?? 0;
    // Conteo por estado de la vacante elegida (o de todas) y total de la empresa para el estado vacio
    const { data: resumen } = useGetCompanyApplicationsSummaryQuery({ token: userToken, idVacante }, omitir);
    const { data: resumenEmpresa } = useGetCompanyApplicationsSummaryQuery({ token: userToken }, omitir);
    const conteo = resumen?.porEstado ?? {};
    // Selector: todas las vacantes de la empresa que no son borrador
    const { data: vacantes = [] } = useGetCompanyJobOptionsQuery({ token: userToken }, omitir);

    useEffect(() => {
        if (data && pagina > 0 && pagina >= totalPaginas) setPagina(Math.max(0, totalPaginas - 1));
    }, [data, pagina, totalPaginas]);

    const hayFiltros = busqueda || estado || vacante;
    const limpiar = () => { setBusqueda(""); setEstado(""); setVacante(""); setPagina(0); };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h1 className="font-display text-2xl font-bold text-gray-900">Postulaciones</h1>
                <p className="mt-1 text-sm text-gray-500">Los estudiantes que se han postulado a las vacantes de tu empresa.</p>

                <div className="mt-4 flex items-start gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                    <IoInformationCircleOutline className="size-5 shrink-0 mt-0.5" />
                    Aquí solo puedes consultar. El avance de cada postulación lo lleva el reclutador que publicó la vacante.
                </div>

                {/* Estados */}
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => { setEstado(""); setPagina(0); }}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!estado ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                    >
                        Todas <span className="opacity-75">({resumen?.total ?? 0})</span>
                    </button>
                    {Object.entries(ESTADOS_POSTULACION).map(([valor, info]) => (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => { setEstado(valor); setPagina(0); }}
                            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${estado === valor ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                        >
                            {info.label} <span className="opacity-75">({conteo[valor] ?? 0})</span>
                        </button>
                    ))}
                </div>

                {/* Buscador y vacante */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            value={busqueda}
                            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
                            placeholder="Buscar por alumno, carrera o vacante"
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>
                    <select value={vacante} onChange={(e) => { setVacante(e.target.value); setPagina(0); }} className={`${selectClass} max-w-xs`} aria-label="Vacante">
                        <option value="">Todas las vacantes</option>
                        {vacantes.map(v => <option key={v.idVacante} value={String(v.idVacante)}>{v.titulo}</option>)}
                    </select>
                    {hayFiltros && (
                        <button type="button" onClick={limpiar} className="text-sm font-semibold text-green-700 hover:underline">
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Lista */}
                <div className={`mt-5 space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
                    ) : isError ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                            <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                            <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar las postulaciones")}</p>
                            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                        </div>
                    ) : resumenEmpresa && resumenEmpresa.total === 0 ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                            <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                                <IoDocumentsOutline className="size-7" />
                            </div>
                            <p className="mt-3 font-semibold text-gray-900">Aún no hay postulaciones</p>
                            <p className="mt-1 text-sm text-gray-500">Cuando los estudiantes se postulen a tus vacantes, aparecerán aquí.</p>
                        </div>
                    ) : visibles.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
                            Ninguna postulación coincide con los filtros.
                        </p>
                    ) : (
                        visibles.map(p => <ApplicationCard key={p.idPostulacion} postulacion={p} mostrarVacante={!vacante} mostrarCV={false} />)
                    )}
                </div>

                <Paginacion
                    className="mt-5"
                    pagina={pagina}
                    totalPaginas={totalPaginas}
                    total={data?.totalElements ?? 0}
                    porPagina={POR_PAGINA}
                    onCambiar={setPagina}
                    cargando={isFetching}
                />
            </div>
        </div>
    );
};

export default CompanyApplications;
