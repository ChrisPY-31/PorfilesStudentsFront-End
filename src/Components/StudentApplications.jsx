import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiXCircle, FiCheck } from "react-icons/fi";
import { IoAlertCircleOutline, IoBriefcaseOutline, IoBusinessOutline, IoDocumentTextOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from "../services/student";
import { ESTADOS_POSTULACION } from "../helpers/vacantes";
import { obtenerMensajeError, formatearFechaCorta } from "../helpers";
import { EstadoPostulacion } from "./ApplicationCard";

// Pasos del proceso; RECHAZADA y RETIRADA lo cortan
const PASOS = ["ENVIADA", "EN_REVISION", "ENTREVISTA", "ACEPTADA"];
const ABIERTAS = ["ENVIADA", "EN_REVISION", "ENTREVISTA"];

// Barra de avance: Enviada -> En revision -> Entrevista -> Aceptada
const Avance = ({ estado }) => {
    if (estado === "RECHAZADA" || estado === "RETIRADA") return null;
    const actual = PASOS.indexOf(estado);
    return (
        <ol className="mt-4 flex items-center">
            {PASOS.map((paso, i) => {
                const hecho = i <= actual;
                return (
                    <li key={paso} className={`flex items-center ${i < PASOS.length - 1 ? "flex-1" : ""}`}>
                        <span className="flex flex-col items-center gap-1">
                            <span className={`size-6 flex items-center justify-center rounded-full text-[11px] font-bold ${hecho ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                                {hecho ? <FiCheck className="size-3.5" /> : i + 1}
                            </span>
                            <span className={`text-[11px] whitespace-nowrap ${i === actual ? "font-semibold text-green-700" : "text-gray-400"}`}>
                                {ESTADOS_POSTULACION[paso].label}
                            </span>
                        </span>
                        {i < PASOS.length - 1 && <span className={`flex-1 h-0.5 mx-1.5 mb-5 rounded ${i < actual ? "bg-green-600" : "bg-gray-200"}`} />}
                    </li>
                );
            })}
        </ol>
    );
};

const Tarjeta = ({ postulacion, onRetirar }) => {
    const { vacante, estado, fechaPostulacion, actualizada, curriculum } = postulacion;
    const empresa = vacante?.empresa;
    // Si la vacante ya no esta publicada, su detalle responde "no disponible"
    const vacanteVisible = vacante?.estado === "PUBLICADA";

    return (
        <article className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-start gap-4">
                <span className="size-12 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center text-gray-400">
                    {empresa?.logo ? <img src={empresa.logo} alt="" className="size-full object-contain" /> : <IoBusinessOutline className="size-6" />}
                </span>
                <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                        {vacanteVisible
                            ? <Link to={`/Empleos/${vacante.idVacante}`} className="font-semibold text-gray-900 hover:text-green-700 hover:underline">{vacante?.titulo}</Link>
                            : <p className="font-semibold text-gray-900">{vacante?.titulo}</p>}
                        <EstadoPostulacion estado={estado} />
                    </div>
                    {empresa?.nombreEmpresa && <p className="text-sm text-gray-600">{empresa.nombreEmpresa}</p>}
                    <p className="mt-0.5 text-xs text-gray-400">
                        Te postulaste el {formatearFechaCorta(fechaPostulacion)}
                        {actualizada && actualizada.slice(0, 10) !== fechaPostulacion?.slice(0, 10) && ` · actualizada el ${formatearFechaCorta(actualizada)}`}
                        {!vacanteVisible && vacante?.estado && " · la vacante ya no está publicada"}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {curriculum && (
                        <a
                            href={curriculum}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <IoDocumentTextOutline className="size-4" /> CV enviado
                        </a>
                    )}
                    {ABIERTAS.includes(estado) && (
                        <button
                            type="button"
                            onClick={() => onRetirar(postulacion)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                            <FiXCircle className="size-4" /> Retirar
                        </button>
                    )}
                </div>
            </div>

            <Avance estado={estado} />
            {estado === "ACEPTADA" && (
                <p className="mt-3 p-3 rounded-xl bg-green-50 text-sm text-green-800">¡Felicidades! La empresa aceptó tu postulación. Revisa tus mensajes por si el reclutador te escribió.</p>
            )}
            {estado === "RECHAZADA" && (
                <p className="mt-3 p-3 rounded-xl bg-gray-50 text-sm text-gray-600">En esta ocasión no continuaste en el proceso. ¡Sigue intentando con otras vacantes!</p>
            )}
        </article>
    );
};

// Seccion "Mis postulaciones" del alumno (Cuenta y seguridad): estado de cada postulacion y retirar las abiertas
const StudentApplications = () => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: postulaciones = [], isLoading, isError, error, refetch } = useGetMyApplicationsQuery(
        { token: userToken },
        { skip: !userToken, refetchOnMountOrArgChange: true }
    );
    const [withdraw, { isLoading: retirando }] = useWithdrawApplicationMutation();
    const [estado, setEstado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [paraRetirar, setParaRetirar] = useState(null);

    const conteo = useMemo(() => postulaciones.reduce((acc, p) => ({ ...acc, [p.estado]: (acc[p.estado] ?? 0) + 1 }), {}), [postulaciones]);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return postulaciones
            .filter(p => !estado || p.estado === estado)
            .filter(p => !texto || [p.vacante?.titulo, p.vacante?.empresa?.nombreEmpresa].some(v => v?.toLowerCase().includes(texto)))
            .sort((a, b) => new Date(b.fechaPostulacion) - new Date(a.fechaPostulacion));
    }, [postulaciones, estado, busqueda]);

    const retirar = async () => {
        try {
            await withdraw({ idPostulacion: paraRetirar.idPostulacion, token: userToken }).unwrap();
            toast.success("Retiraste tu postulación");
            setParaRetirar(null);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo retirar la postulación"));
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-gray-900">Mis postulaciones</h1>
                        <p className="mt-1 text-sm text-gray-500">Las vacantes a las que te postulaste y en qué va cada una.</p>
                    </div>
                    <Link to="/Empleos" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md">
                        Buscar vacantes
                    </Link>
                </div>

                {isLoading ? (
                    <div className="mt-6 space-y-4">{[1, 2].map(i => <div key={i} className="h-36 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}</div>
                ) : isError ? (
                    <div className="mt-6 p-10 text-center bg-white rounded-2xl border border-gray-200">
                        <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                        <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar tus postulaciones")}</p>
                        <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                    </div>
                ) : postulaciones.length === 0 ? (
                    <div className="mt-6 p-10 text-center bg-white rounded-2xl border border-gray-200">
                        <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                            <IoBriefcaseOutline className="size-7" />
                        </div>
                        <p className="mt-3 font-semibold text-gray-900">Aún no te has postulado a ninguna vacante</p>
                        <p className="mt-1 text-sm text-gray-500">Busca empleo, servicio social, integrativa o prácticas en las empresas con convenio.</p>
                        <Link to="/Empleos" className="mt-4 inline-block text-sm font-semibold text-green-700 hover:underline">Ver vacantes</Link>
                    </div>
                ) : (
                    <>
                        {/* Estados */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setEstado("")}
                                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!estado ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                            >
                                Todas <span className="opacity-75">({postulaciones.length})</span>
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

                        <div className="mt-4 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por vacante o empresa"
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        <div className="mt-5 space-y-4">
                            {visibles.length === 0
                                ? <p className="p-10 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">Ninguna postulación coincide con los filtros.</p>
                                : visibles.map(p => <Tarjeta key={p.idPostulacion} postulacion={p} onRetirar={setParaRetirar} />)}
                        </div>
                    </>
                )}
            </div>

            {paraRetirar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">Retirar postulación</h3>
                        <p className="mt-1 text-sm font-medium text-gray-800">{paraRetirar.vacante?.titulo}</p>
                        <p className="mt-2 text-sm text-gray-600">
                            El reclutador ya no te tomará en cuenta para esta vacante y <span className="font-semibold">no podrás volver a postularte a ella</span>.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setParaRetirar(null)}
                                disabled={retirando}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={retirar}
                                disabled={retirando}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md disabled:opacity-50"
                            >
                                {retirando ? "Retirando..." : "Retirar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentApplications;
