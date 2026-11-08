import React, { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoAlertCircleOutline, IoDocumentsOutline, IoInformationCircleOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetCompanyApplicationsQuery, useGetCompanyJobsQuery } from "../services/company";
import { ESTADOS_POSTULACION } from "../helpers/vacantes";
import { obtenerMensajeError } from "../helpers";
import ApplicationCard from "./ApplicationCard";

const selectClass = "px-3 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

// `vacanteInicial` llega desde "Ver postulaciones" en la seccion de vacantes
const CompanyApplications = ({ vacanteInicial = "" }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: postulaciones = [], isLoading, isError, error, refetch } = useGetCompanyApplicationsQuery({ token: userToken }, { skip: !userToken });
    const { data: vacantes = [] } = useGetCompanyJobsQuery({ token: userToken }, { skip: !userToken });

    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");
    const [vacante, setVacante] = useState(vacanteInicial ? String(vacanteInicial) : "");

    // Conteo por estado dentro de la vacante elegida (o de todas)
    const deLaVacante = useMemo(
        () => postulaciones.filter(p => !vacante || String(p.vacante?.idVacante) === vacante),
        [postulaciones, vacante]
    );
    const conteo = useMemo(() => deLaVacante.reduce((acc, p) => ({ ...acc, [p.estado]: (acc[p.estado] ?? 0) + 1 }), {}), [deLaVacante]);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return deLaVacante
            .filter(p => !estado || p.estado === estado)
            .filter(p => !texto || [p.estudiante?.nombre, p.estudiante?.apellido, p.estudiante?.carrera, p.vacante?.titulo]
                .some(c => c?.toLowerCase().includes(texto)))
            .sort((a, b) => new Date(b.fechaPostulacion) - new Date(a.fechaPostulacion));
    }, [deLaVacante, busqueda, estado]);

    const hayFiltros = busqueda || estado || vacante;
    const limpiar = () => { setBusqueda(""); setEstado(""); setVacante(""); };

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
                        onClick={() => setEstado("")}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!estado ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                    >
                        Todas <span className="opacity-75">({deLaVacante.length})</span>
                    </button>
                    {Object.entries(ESTADOS_POSTULACION).map(([valor, info]) => (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => setEstado(valor)}
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
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por alumno, carrera o vacante"
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>
                    <select value={vacante} onChange={(e) => setVacante(e.target.value)} className={`${selectClass} max-w-xs`} aria-label="Vacante">
                        <option value="">Todas las vacantes</option>
                        {vacantes
                            .filter(v => v.estado !== "BORRADOR")
                            .map(v => <option key={v.idVacante} value={String(v.idVacante)}>{v.titulo}</option>)}
                    </select>
                    {hayFiltros && (
                        <button type="button" onClick={limpiar} className="text-sm font-semibold text-green-700 hover:underline">
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Lista */}
                <div className="mt-5 space-y-3">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
                    ) : isError ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                            <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                            <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar las postulaciones")}</p>
                            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                        </div>
                    ) : postulaciones.length === 0 ? (
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
                        visibles.map(p => <ApplicationCard key={p.idPostulacion} postulacion={p} mostrarVacante={!vacante} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyApplications;
