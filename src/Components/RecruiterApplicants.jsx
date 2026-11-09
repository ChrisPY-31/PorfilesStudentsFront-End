import React, { useMemo, useState } from "react";
import { FiUsers, FiSearch, FiEye, FiCalendar, FiCheck, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { IoAlertCircleOutline, IoBriefcaseOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetMyJobsQuery, useGetJobApplicantsQuery, useChangeApplicationStatusMutation } from "../services/recruiter";
import { ESTADOS_VACANTE, TIPOS_VACANTE, ESTADOS_POSTULACION } from "../helpers/vacantes";
import { obtenerMensajeError, formatearFechaCorta } from "../helpers";
import { EstadoVacante } from "./JobCard";
import ApplicationCard from "./ApplicationCard";
import BotonMensajeAlumno from "./BotonMensajeAlumno";

// Orden del selector: primero las que reciben postulaciones
const ORDEN_ESTADO = { PUBLICADA: 0, PAUSADA: 1, VENCIDA: 2, CERRADA: 3 };

// Siguiente paso de cada estado abierto (el back solo deja avanzar o rechazar)
const SIGUIENTE = { ENVIADA: "EN_REVISION", EN_REVISION: "ENTREVISTA", ENTREVISTA: "ACEPTADA" };
const ESTADOS_FINALES = ["ACEPTADA", "RECHAZADA", "RETIRADA"];

const ACCIONES_ESTADO = {
    EN_REVISION: { boton: "Pasar a revisión", icono: FiEye, exito: "Postulación en revisión" },
    ENTREVISTA: { boton: "Citar a entrevista", icono: FiCalendar, exito: "Postulante citado a entrevista" },
    ACEPTADA: {
        boton: "Aceptar", icono: FiCheck, exito: "Postulación aceptada", confirmar: true,
        titulo: "Aceptar postulación",
        texto: "El estudiante recibirá una notificación de que fue aceptado. Esta decisión ya no se puede cambiar.",
    },
    RECHAZADA: {
        boton: "Rechazar", icono: FiX, exito: "Postulación rechazada", confirmar: true, peligro: true,
        titulo: "Rechazar postulación",
        texto: "El estudiante recibirá una notificación de que no fue seleccionado. Esta decisión ya no se puede cambiar.",
    },
};

// Postulantes de una vacante: pestañas por estado con conteo y busqueda por nombre.
// La tarjeta ya trae el mensaje del alumno, "Ver CV" y "Ver perfil"
const ListaPostulantes = ({ idVacante }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: postulaciones = [], isLoading, isFetching, isError, error, refetch } = useGetJobApplicantsQuery(
        { idVacante, token: userToken },
        { skip: !userToken || !idVacante }
    );
    const [changeApplicationStatus] = useChangeApplicationStatusMutation();
    const [estado, setEstado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [pendiente, setPendiente] = useState(null); // { postulacion, destino } para Aceptar/Rechazar
    const [procesando, setProcesando] = useState(null); // idPostulacion en proceso

    const cambiarEstado = async (postulacion, destino) => {
        setProcesando(postulacion.idPostulacion);
        try {
            await changeApplicationStatus({ idPostulacion: postulacion.idPostulacion, estado: destino, idVacante, token: userToken }).unwrap();
            toast.success(ACCIONES_ESTADO[destino].exito);
            setPendiente(null);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo cambiar el estado"));
        } finally {
            setProcesando(null);
        }
    };

    const pedirCambio = (postulacion, destino) => {
        if (ACCIONES_ESTADO[destino].confirmar) setPendiente({ postulacion, destino });
        else cambiarEstado(postulacion, destino);
    };

    // "Enviar mensaje" o "Ver conversación" (el back ya deja escribir aunque la postulacion este retirada)
    const botonMensaje = (p) => (
        <BotonMensajeAlumno key="mensaje" alumno={p.estudiante} vacanteTitulo={p.vacante?.titulo} />
    );

    // Botones segun el estado: mensaje, el siguiente paso y Rechazar; los estados finales solo llevan el mensaje
    const accionesDe = (p) => {
        const mensaje = botonMensaje(p);
        if (ESTADOS_FINALES.includes(p.estado)) return mensaje;
        const destinos = [SIGUIENTE[p.estado], "RECHAZADA"].filter(Boolean);
        const ocupado = procesando === p.idPostulacion;
        return [mensaje, ...destinos.map(destino => {
            const a = ACCIONES_ESTADO[destino];
            const principal = destino !== "RECHAZADA";
            return (
                <button
                    key={destino}
                    type="button"
                    disabled={ocupado}
                    onClick={() => pedirCambio(p, destino)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${principal
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "border border-red-200 text-red-600 hover:bg-red-50"}`}
                >
                    <a.icono className="size-4" /> {ocupado && principal ? "Guardando..." : a.boton}
                </button>
            );
        })];
    };

    const conteo = useMemo(() => postulaciones.reduce((acc, p) => ({ ...acc, [p.estado]: (acc[p.estado] ?? 0) + 1 }), {}), [postulaciones]);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return postulaciones
            .filter(p => !estado || p.estado === estado)
            .filter(p => !texto || `${p.estudiante?.nombre ?? ""} ${p.estudiante?.apellido ?? ""}`.toLowerCase().includes(texto))
            .sort((a, b) => new Date(b.fechaPostulacion) - new Date(a.fechaPostulacion));
    }, [postulaciones, estado, busqueda]);

    if (isLoading) {
        return <div className="mt-5 space-y-4">{[1, 2].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}</div>;
    }

    if (isError) {
        return (
            <div className="mt-5 p-10 text-center bg-white rounded-2xl border border-gray-200">
                <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar los postulantes")}</p>
                <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
            </div>
        );
    }

    if (postulaciones.length === 0) {
        return (
            <div className="mt-5 p-10 text-center bg-white rounded-2xl border border-gray-200">
                <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                    <FiUsers className="size-7" />
                </div>
                <p className="mt-3 font-semibold text-gray-900">Nadie se ha postulado todavía</p>
                <p className="mt-1 text-sm text-gray-500">Cuando un estudiante se postule a esta vacante aparecerá aquí y recibirás una notificación.</p>
            </div>
        );
    }

    return (
        <>
            {/* Estados */}
            <div className="mt-5 flex flex-wrap gap-2">
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

            {/* Busqueda */}
            <div className="mt-4 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar postulante por nombre"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
            </div>

            {/* Lista */}
            <div className={`mt-5 space-y-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                {visibles.length === 0 ? (
                    <p className="p-10 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
                        Ningún postulante coincide con los filtros.
                    </p>
                ) : (
                    visibles.map(p => (
                        <ApplicationCard key={p.idPostulacion} postulacion={p} mostrarVacante={false} acciones={accionesDe(p)} />
                    ))
                )}
            </div>

            {pendiente && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">{ACCIONES_ESTADO[pendiente.destino].titulo}</h3>
                        <p className="mt-1 text-sm font-medium text-gray-800">
                            {pendiente.postulacion.estudiante?.nombre} {pendiente.postulacion.estudiante?.apellido}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">{ACCIONES_ESTADO[pendiente.destino].texto}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPendiente(null)}
                                disabled={Boolean(procesando)}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => cambiarEstado(pendiente.postulacion, pendiente.destino)}
                                disabled={Boolean(procesando)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 ${ACCIONES_ESTADO[pendiente.destino].peligro ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                            >
                                {procesando ? "Guardando..." : ACCIONES_ESTADO[pendiente.destino].boton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Seccion "Postulantes" del reclutador. El back solo da postulantes por vacante
// (GET /recruiter/me/jobs/{id}/applications), asi que primero se elige la vacante.
// `vacanteInicial` llega desde "Ver postulantes" en Mis vacantes
const RecruiterApplicants = ({ vacanteInicial, onIrAVacantes }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: vacantes = [], isLoading, isError, error, refetch } = useGetMyJobsQuery({ token: userToken }, { skip: !userToken });

    // Un borrador nunca tiene postulantes
    const opciones = useMemo(() => vacantes
        .filter(v => v.estado !== "BORRADOR")
        .sort((a, b) => (ORDEN_ESTADO[a.estado] ?? 9) - (ORDEN_ESTADO[b.estado] ?? 9)
            || new Date(b.fechaPublicacion ?? b.creada) - new Date(a.fechaPublicacion ?? a.creada)), [vacantes]);

    const [elegida, setElegida] = useState(vacanteInicial ? String(vacanteInicial) : "");
    // Si no viene una (o ya no existe), se elige la primera disponible
    const idActual = opciones.some(v => String(v.idVacante) === elegida)
        ? elegida
        : (opciones[0] ? String(opciones[0].idVacante) : "");
    const vacante = opciones.find(v => String(v.idVacante) === idActual);

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h1 className="font-display text-2xl font-bold text-gray-900">Postulantes</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Elige una de tus vacantes para revisar a los estudiantes que se postularon.
                </p>

                {isLoading ? (
                    <div className="mt-6 h-28 bg-white rounded-2xl border border-gray-200 animate-pulse" />
                ) : isError ? (
                    <div className="mt-6 p-10 text-center bg-white rounded-2xl border border-gray-200">
                        <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                        <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar tus vacantes")}</p>
                        <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                    </div>
                ) : opciones.length === 0 ? (
                    <div className="mt-6 p-10 text-center bg-white rounded-2xl border border-gray-200">
                        <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                            <IoBriefcaseOutline className="size-7" />
                        </div>
                        <p className="mt-3 font-semibold text-gray-900">Aún no tienes vacantes publicadas</p>
                        <p className="mt-1 text-sm text-gray-500">Cuando publiques una vacante, aquí podrás revisar a sus postulantes.</p>
                        <button type="button" onClick={onIrAVacantes} className="mt-4 text-sm font-semibold text-green-700 hover:underline">
                            Ir a Mis vacantes
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Selector de vacante */}
                        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
                            <label htmlFor="vacante-postulantes" className="block text-sm font-semibold text-gray-700 mb-1.5">Vacante</label>
                            <select
                                id="vacante-postulantes"
                                value={idActual}
                                onChange={(e) => setElegida(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            >
                                {opciones.map(v => (
                                    <option key={v.idVacante} value={String(v.idVacante)}>
                                        {v.titulo} · {ESTADOS_VACANTE[v.estado]?.label ?? v.estado}
                                    </option>
                                ))}
                            </select>

                            {vacante && (
                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                    <EstadoVacante estado={vacante.estado} />
                                    {vacante.tipo && <span className="font-medium text-green-700">{TIPOS_VACANTE[vacante.tipo] ?? vacante.tipo}</span>}
                                    {vacante.fechaPublicacion && <span>Publicada el {formatearFechaCorta(vacante.fechaPublicacion)}</span>}
                                    {vacante.fechaCierre && <span>Cierra el {formatearFechaCorta(vacante.fechaCierre)}</span>}
                                    {vacante.carreras?.length > 0 && (
                                        <span className="text-gray-500">Para: {vacante.carreras.map(c => c.carrera).join(", ")}</span>
                                    )}
                                </div>
                            )}
                            {vacante?.estado === "CERRADA" && (
                                <p className="mt-3 text-xs text-gray-500">Esta vacante está cerrada: puedes consultar a sus postulantes, pero ya no cambiar su estado.</p>
                            )}
                        </div>

                        {/* key: al cambiar de vacante se reinician los filtros */}
                        {vacante && <ListaPostulantes key={vacante.idVacante} idVacante={vacante.idVacante} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecruiterApplicants;
