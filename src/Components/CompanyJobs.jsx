import React, { useMemo, useState } from "react";
import { FiSearch, FiPause, FiPlay, FiXCircle, FiUsers } from "react-icons/fi";
import { IoAlertCircleOutline, IoBriefcaseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useGetCompanyJobsQuery, useChangeCompanyJobStatusMutation, useGetMyRecruitersQuery } from "../services/company";
import { ESTADOS_VACANTE, TIPOS_VACANTE } from "../helpers/vacantes";
import { obtenerMensajeError } from "../helpers";
import JobCard from "./JobCard";

const selectClass = "px-3 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

// Lo que la empresa puede hacer segun el estado (el back no le deja publicar borradores ni editar)
const ACCIONES = {
    PUBLICADA: ["PAUSADA", "CERRADA"],
    PAUSADA: ["PUBLICADA", "CERRADA"],
    VENCIDA: ["CERRADA"],
};

const TEXTOS = {
    PAUSADA: {
        boton: "Pausar", icono: FiPause, titulo: "Pausar vacante",
        texto: "Los estudiantes dejarán de verla y no podrán postularse. Las postulaciones que ya tiene se conservan y se puede reanudar después.",
    },
    PUBLICADA: {
        boton: "Reanudar", icono: FiPlay, titulo: "Reanudar vacante",
        texto: "La vacante volverá a estar visible para los estudiantes.",
    },
    CERRADA: {
        boton: "Cerrar", icono: FiXCircle, titulo: "Cerrar vacante", peligro: true,
        texto: "Esta acción no se puede deshacer. Las postulaciones que sigan abiertas se marcarán como rechazadas y los estudiantes recibirán una notificación.",
    },
};

const CompanyJobs = ({ onVerPostulaciones }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: vacantes = [], isLoading, isError, error, refetch } = useGetCompanyJobsQuery({ token: userToken }, { skip: !userToken });
    const { data: reclutadores = [] } = useGetMyRecruitersQuery({ token: userToken }, { skip: !userToken });
    const [changeStatus] = useChangeCompanyJobStatusMutation();

    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");
    const [tipo, setTipo] = useState("");
    const [reclutador, setReclutador] = useState("");
    const [pendiente, setPendiente] = useState(null); // { vacante, destino }
    const [procesando, setProcesando] = useState(false);

    // Conteo por estado sobre todas las vacantes (sin filtrar)
    const conteo = useMemo(() => vacantes.reduce((acc, v) => ({ ...acc, [v.estado]: (acc[v.estado] ?? 0) + 1 }), {}), [vacantes]);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return vacantes
            .filter(v => !estado || v.estado === estado)
            .filter(v => !tipo || v.tipo === tipo)
            .filter(v => !reclutador || String(v.reclutador?.id) === reclutador)
            .filter(v => !texto || [v.titulo, v.descripcion, v.ubicacion].some(c => c?.toLowerCase().includes(texto)))
            .sort((a, b) => new Date(b.creada) - new Date(a.creada));
    }, [vacantes, busqueda, estado, tipo, reclutador]);

    const hayFiltros = busqueda || estado || tipo || reclutador;
    const limpiar = () => { setBusqueda(""); setEstado(""); setTipo(""); setReclutador(""); };

    const confirmar = async () => {
        const { vacante, destino } = pendiente;
        setProcesando(true);
        try {
            await changeStatus({ id: vacante.idVacante, estado: destino, token: userToken }).unwrap();
            toast.success(destino === "CERRADA" ? "Vacante cerrada" : destino === "PAUSADA" ? "Vacante pausada" : "Vacante reanudada");
            setPendiente(null);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo cambiar el estado"));
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h1 className="font-display text-2xl font-bold text-gray-900">Vacantes</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Todas las vacantes que han creado los reclutadores de tu empresa. Puedes pausarlas, reanudarlas o cerrarlas.
                </p>

                {/* Estados */}
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setEstado("")}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!estado ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                    >
                        Todas <span className="opacity-75">({vacantes.length})</span>
                    </button>
                    {Object.entries(ESTADOS_VACANTE).map(([valor, info]) => (
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

                {/* Buscador y filtros */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por título, descripción o ubicación"
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass} aria-label="Tipo">
                        <option value="">Todos los tipos</option>
                        {Object.entries(TIPOS_VACANTE).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
                    </select>
                    <select value={reclutador} onChange={(e) => setReclutador(e.target.value)} className={selectClass} aria-label="Reclutador">
                        <option value="">Todos los reclutadores</option>
                        {reclutadores.map(r => <option key={r.id} value={String(r.id)}>{r.nombre} {r.apellido}</option>)}
                    </select>
                    {hayFiltros && (
                        <button type="button" onClick={limpiar} className="text-sm font-semibold text-green-700 hover:underline">
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Lista */}
                <div className="mt-5 space-y-4">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-44 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
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
                            <p className="mt-3 font-semibold text-gray-900">Tu empresa aún no tiene vacantes</p>
                            <p className="mt-1 text-sm text-gray-500">Cuando tus reclutadores publiquen vacantes, aparecerán aquí.</p>
                        </div>
                    ) : visibles.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
                            Ninguna vacante coincide con los filtros.
                        </p>
                    ) : (
                        visibles.map(v => (
                            <JobCard
                                key={v.idVacante}
                                vacante={v}
                                mostrarReclutador
                                acciones={<>
                                    {v.estado !== "BORRADOR" && (
                                        <button
                                            type="button"
                                            onClick={() => onVerPostulaciones(v.idVacante)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-xs font-semibold text-white"
                                        >
                                            <FiUsers className="size-4" /> Ver postulaciones
                                        </button>
                                    )}
                                    {(ACCIONES[v.estado] ?? []).map(destino => {
                                        const t = TEXTOS[destino];
                                        return (
                                            <button
                                                key={destino}
                                                type="button"
                                                onClick={() => setPendiente({ vacante: v, destino })}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold ${t.peligro
                                                    ? "border-red-200 text-red-600 hover:bg-red-50"
                                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                                            >
                                                <t.icono className="size-4" /> {t.boton}
                                            </button>
                                        );
                                    })}
                                </>}
                            />
                        ))
                    )}
                </div>
            </div>

            {pendiente && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">{TEXTOS[pendiente.destino].titulo}</h3>
                        <p className="mt-1 text-sm font-medium text-gray-800">{pendiente.vacante.titulo}</p>
                        <p className="mt-2 text-sm text-gray-600">{TEXTOS[pendiente.destino].texto}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPendiente(null)}
                                disabled={procesando}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmar}
                                disabled={procesando}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 ${TEXTOS[pendiente.destino].peligro ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                            >
                                {procesando ? "Procesando..." : TEXTOS[pendiente.destino].boton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyJobs;
