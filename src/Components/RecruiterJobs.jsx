import React, { useEffect, useState } from "react";
import { FiSearch, FiPause, FiPlay, FiXCircle, FiUsers, FiSend, FiTrash2, FiEdit2, FiPlus } from "react-icons/fi";
import { IoAlertCircleOutline, IoBriefcaseOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useGetMyJobsQuery, useGetMyJobsSummaryQuery, useChangeMyJobStatusMutation, useDeleteMyJobMutation } from "../services/recruiter";
import { ESTADOS_VACANTE, TIPOS_VACANTE, faltantesParaPublicar } from "../helpers/vacantes";
import { POR_PAGINA } from "../helpers/paginacion";
import { useDebounce } from "../Hooks/useDebounce";
import Paginacion from "./Paginacion";
import { obtenerMensajeError } from "../helpers";
import JobCard from "./JobCard";

const selectClass = "px-3 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

// Lo que el reclutador puede hacer segun el estado (reglas de PostJobServiceImpl):
// un borrador no se cierra (se elimina), solo se pausa una publicada y CERRADA es definitivo
const ACCIONES = {
    BORRADOR: ["PUBLICAR", "ELIMINAR"],
    PUBLICADA: ["PAUSADA", "CERRADA"],
    PAUSADA: ["REANUDAR", "CERRADA"],
    VENCIDA: ["CERRADA"],
};

const TEXTOS = {
    PUBLICAR: {
        boton: "Publicar", icono: FiSend, titulo: "Publicar vacante", destino: "PUBLICADA", exito: "Vacante publicada",
        texto: "Los estudiantes de las carreras seleccionadas podrán verla y postularse.",
    },
    REANUDAR: {
        boton: "Reanudar", icono: FiPlay, titulo: "Reanudar vacante", destino: "PUBLICADA", exito: "Vacante reanudada",
        texto: "La vacante volverá a estar visible y los estudiantes podrán postularse otra vez.",
    },
    PAUSADA: {
        boton: "Pausar", icono: FiPause, titulo: "Pausar vacante", destino: "PAUSADA", exito: "Vacante pausada",
        texto: "Los estudiantes dejarán de verla y no podrán postularse. Las postulaciones que ya tiene se conservan y puedes reanudarla después.",
    },
    CERRADA: {
        boton: "Cerrar", icono: FiXCircle, titulo: "Cerrar vacante", destino: "CERRADA", exito: "Vacante cerrada", peligro: true,
        texto: "Esta acción no se puede deshacer. Las postulaciones que sigan abiertas se marcarán como rechazadas y los estudiantes recibirán una notificación.",
    },
    ELIMINAR: {
        boton: "Eliminar", icono: FiTrash2, titulo: "Eliminar borrador", exito: "Borrador eliminado", peligro: true,
        texto: "El borrador se eliminará definitivamente.",
    },
};

const RecruiterJobs = ({ onCrear, onEditar, onVerPostulantes }) => {
    const { userToken } = useAppSelector(state => state.users);
    const omitir = { skip: !userToken };
    const [changeStatus] = useChangeMyJobStatusMutation();
    const [deleteJob] = useDeleteMyJobMutation();

    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState("");
    const [tipo, setTipo] = useState("");
    const [pagina, setPagina] = useState(0);
    const [pendiente, setPendiente] = useState(null); // { vacante, accion }
    const [procesando, setProcesando] = useState(false);

    // El back pagina y filtra (estado, texto y tipo); el texto se manda al dejar de escribir
    const q = useDebounce(busqueda.trim());
    const { data, isLoading, isError, error, refetch, isFetching } = useGetMyJobsQuery(
        { token: userToken, page: pagina, size: POR_PAGINA, estado, q, tipo }, omitir);
    const visibles = data?.content ?? [];
    const totalFiltrado = data?.totalElements ?? 0;
    const totalPaginas = data?.totalPages ?? 0;

    // Numeros de las pestanas (sobre todas las vacantes, sin filtrar)
    const { data: resumen, isSuccess: resumenListo } = useGetMyJobsSummaryQuery({ token: userToken }, omitir);
    const conteo = { cargado: resumenListo, total: resumen?.total ?? 0, porEstado: resumen?.porEstado ?? {} };

    // Si la pagina actual se vacia (se elimino o cambio de estado la ultima vacante) se regresa a la anterior
    useEffect(() => {
        if (data && pagina > 0 && pagina >= totalPaginas) setPagina(Math.max(0, totalPaginas - 1));
    }, [data, pagina, totalPaginas]);

    const hayFiltros = estado || busqueda.trim() || tipo;
    const cambiarEstado = (valor) => { setEstado(valor); setPagina(0); };
    const limpiar = () => { setBusqueda(""); setEstado(""); setTipo(""); setPagina(0); };

    const pedirAccion = (vacante, accion) => {
        // Antes de publicar o reanudar se revisa lo que el back va a exigir
        if (accion === "PUBLICAR" || accion === "REANUDAR") {
            const faltan = faltantesParaPublicar(vacante);
            if (faltan.length > 0) {
                toast.error(`Para publicarla le falta: ${faltan.join(", ")}. Edita la vacante primero.`);
                return;
            }
        }
        setPendiente({ vacante, accion });
    };

    const confirmar = async () => {
        const { vacante, accion } = pendiente;
        const t = TEXTOS[accion];
        setProcesando(true);
        try {
            if (accion === "ELIMINAR") {
                await deleteJob({ id: vacante.idVacante, token: userToken }).unwrap();
            } else {
                await changeStatus({ id: vacante.idVacante, estado: t.destino, token: userToken }).unwrap();
            }
            toast.success(t.exito);
            setPendiente(null);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo completar la acción"));
        } finally {
            setProcesando(false);
        }
    };

    const botonClase = (peligro) => `flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold ${peligro
        ? "border-red-200 text-red-600 hover:bg-red-50"
        : "border-gray-200 text-gray-700 hover:bg-gray-50"}`;

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-gray-900">Mis vacantes</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Las vacantes que has creado. Publícalas cuando estén listas, pausa las que no quieras mostrar por ahora y cierra las que ya cubriste.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCrear}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md"
                    >
                        <FiPlus className="size-4" /> Nueva vacante
                    </button>
                </div>

                {/* Estados */}
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => cambiarEstado("")}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${!estado ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                    >
                        Todas <span className="opacity-75">({conteo.total})</span>
                    </button>
                    {Object.entries(ESTADOS_VACANTE).map(([valor, info]) => (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => cambiarEstado(valor)}
                            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${estado === valor ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-400"}`}
                        >
                            {info.label} <span className="opacity-75">({conteo.porEstado[valor] ?? 0})</span>
                        </button>
                    ))}
                </div>

                {/* Buscador y filtros */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            value={busqueda}
                            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
                            placeholder="Buscar por título, descripción o ubicación"
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>
                    <select value={tipo} onChange={(e) => { setTipo(e.target.value); setPagina(0); }} className={selectClass} aria-label="Tipo">
                        <option value="">Todos los tipos</option>
                        {Object.entries(TIPOS_VACANTE).map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
                    </select>
                    {hayFiltros && (
                        <button type="button" onClick={limpiar} className="text-sm font-semibold text-green-700 hover:underline">
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Lista */}
                <div className={`mt-5 space-y-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-44 bg-white rounded-2xl border border-gray-200 animate-pulse" />)
                    ) : isError ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                            <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                            <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar tus vacantes")}</p>
                            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                        </div>
                    ) : conteo.cargado && conteo.total === 0 ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">
                            <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                                <IoBriefcaseOutline className="size-7" />
                            </div>
                            <p className="mt-3 font-semibold text-gray-900">Aún no tienes vacantes</p>
                            <p className="mt-1 text-sm text-gray-500">Crea tu primera vacante; se guardará como borrador hasta que la publiques.</p>
                            <button
                                type="button"
                                onClick={onCrear}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700"
                            >
                                <FiPlus className="size-4" /> Nueva vacante
                            </button>
                        </div>
                    ) : visibles.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
                            {hayFiltros ? "Ninguna vacante coincide con los filtros." : "No hay vacantes en esta página."}
                        </p>
                    ) : (
                        visibles.map(v => (
                            <JobCard
                                key={v.idVacante}
                                vacante={v}
                                acciones={<>
                                    {v.estado !== "BORRADOR" && (
                                        <button
                                            type="button"
                                            onClick={() => onVerPostulantes(v.idVacante)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-xs font-semibold text-white"
                                        >
                                            <FiUsers className="size-4" /> Ver postulantes
                                        </button>
                                    )}
                                    {/* Una vacante cerrada ya no se edita */}
                                    {v.estado !== "CERRADA" && (
                                        <button type="button" onClick={() => onEditar(v)} className={botonClase(false)}>
                                            <FiEdit2 className="size-4" /> Editar
                                        </button>
                                    )}
                                    {(ACCIONES[v.estado] ?? []).map(accion => {
                                        const t = TEXTOS[accion];
                                        return (
                                            <button key={accion} type="button" onClick={() => pedirAccion(v, accion)} className={botonClase(t.peligro)}>
                                                <t.icono className="size-4" /> {t.boton}
                                            </button>
                                        );
                                    })}
                                </>}
                            />
                        ))
                    )}
                </div>

                <Paginacion
                    className="mt-5"
                    pagina={pagina}
                    totalPaginas={totalPaginas}
                    total={totalFiltrado}
                    porPagina={POR_PAGINA}
                    onCambiar={setPagina}
                    cargando={isFetching}
                />
            </div>

            {pendiente && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">{TEXTOS[pendiente.accion].titulo}</h3>
                        <p className="mt-1 text-sm font-medium text-gray-800">{pendiente.vacante.titulo}</p>
                        <p className="mt-2 text-sm text-gray-600">{TEXTOS[pendiente.accion].texto}</p>
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
                                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 ${TEXTOS[pendiente.accion].peligro ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                            >
                                {procesando ? "Procesando..." : TEXTOS[pendiente.accion].boton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterJobs;
