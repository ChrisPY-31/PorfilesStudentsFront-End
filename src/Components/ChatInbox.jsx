import React, { useMemo, useState } from "react";
import { FiSearch, FiLock, FiMessageSquare } from "react-icons/fi";
import { IoAlertCircleOutline, IoChatbubblesOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetConversationsQuery } from "../services/chat";
import { obtenerMensajeError, tiempoRelativo } from "../helpers";
import ChatConversation from "./ChatConversation";
import { MI_REMITENTE } from "../helpers/chatActivo";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";


const nombreDe = (c) => `${c.contraparte?.nombre ?? ""} ${c.contraparte?.apellido ?? ""}`.trim() || "Sin nombre";

const ConversacionItem = ({ conversacion, activa, miRemitente, onClick }) => {
    const { contraparte, vacante, ultimoMensaje, ultimoMensajeEn, creada, noLeidos, estado } = conversacion;
    const sinLeer = noLeidos > 0;
    const esMio = ultimoMensaje?.remitente === miRemitente;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left border-l-4 transition-colors ${activa
                ? "bg-green-50 border-green-600"
                : `border-transparent hover:bg-gray-50 ${sinLeer ? "bg-green-50/40" : ""}`}`}
        >
            <img src={contraparte?.imagen || FOTO_DEFAULT} alt="" className="size-11 shrink-0 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                    <p className={`truncate text-sm ${sinLeer ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>{nombreDe(conversacion)}</p>
                    <span className="shrink-0 text-[11px] text-gray-400">{tiempoRelativo(ultimoMensajeEn ?? creada)}</span>
                </div>
                {vacante?.titulo && <p className="truncate text-xs text-green-700">{vacante.titulo}</p>}
                <div className="mt-0.5 flex items-center gap-2">
                    <p className={`flex-1 truncate text-sm ${sinLeer ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                        {estado === "BLOQUEADA"
                            ? <span className="inline-flex items-center gap-1 text-gray-400"><FiLock className="size-3.5" /> Conversación bloqueada</span>
                            : ultimoMensaje
                                ? `${esMio ? "Tú: " : ""}${ultimoMensaje.contenido}`
                                : "Sin mensajes"}
                    </p>
                    {sinLeer && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-green-600 text-white text-[11px] font-bold">
                            {noLeidos > 99 ? "99+" : noLeidos}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

// Seccion "Mensajes": bandeja a la izquierda y la conversacion elegida a la derecha.
// Sirve para reclutador y alumno (GET /conversations responde segun el JWT)
// `conversacionInicial`: id de la conversacion que se abre al entrar (ej. desde Postulantes)
const ChatInbox = ({ conversacionInicial = null }) => {
    const { userToken, tipo } = useAppSelector(state => state.users);
    const { data: conversaciones = [], isLoading, isError, error, refetch } = useGetConversationsQuery({ token: userToken }, { skip: !userToken, refetchOnMountOrArgChange: true });
    const [busqueda, setBusqueda] = useState("");
    const [soloNoLeidas, setSoloNoLeidas] = useState(false);
    const [idActiva, setIdActiva] = useState(conversacionInicial);

    const miRemitente = MI_REMITENTE[tipo];
    const totalNoLeidas = conversaciones.filter(c => c.noLeidos > 0).length;

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return conversaciones
            .filter(c => !soloNoLeidas || c.noLeidos > 0)
            .filter(c => !texto || [nombreDe(c), c.vacante?.titulo].some(v => v?.toLowerCase().includes(texto)))
            .sort((a, b) => new Date(b.ultimoMensajeEn ?? b.creada) - new Date(a.ultimoMensajeEn ?? a.creada));
    }, [conversaciones, busqueda, soloNoLeidas]);

    const activa = conversaciones.find(c => c.idConversacion === idActiva);

    return (
        <div className="flex-1 min-h-0 flex flex-col p-6 md:p-8 bg-gray-50">
            <h1 className="font-display text-2xl font-bold text-gray-900">Mensajes</h1>
            <p className="mt-1 text-sm text-gray-500">
                {tipo === "recruiter"
                    ? "Tus conversaciones con los estudiantes que se postularon a tus vacantes."
                    : "Tus conversaciones con los reclutadores de las vacantes a las que te postulaste."}
            </p>

            <div className="mt-5 flex-1 min-h-[420px] flex bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Bandeja */}
                {/* En pantallas chicas se ve la bandeja o el chat, no ambos */}
                <aside className={`w-full md:w-80 shrink-0 flex-col border-r border-gray-200 ${activa ? "hidden md:flex" : "flex"}`}>
                    <div className="p-3 space-y-2 border-b border-gray-100">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o vacante"
                                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            {[{ v: false, label: "Todas" }, { v: true, label: `No leídas${totalNoLeidas ? ` (${totalNoLeidas})` : ""}` }].map(op => (
                                <button
                                    key={op.label}
                                    type="button"
                                    onClick={() => setSoloNoLeidas(op.v)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${soloNoLeidas === op.v ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    {op.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                                    <div className="size-11 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3 w-2/3 rounded bg-gray-200" />
                                        <div className="h-3 w-1/2 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))
                        ) : isError ? (
                            <div className="p-6 text-center">
                                <IoAlertCircleOutline className="mx-auto size-7 text-red-500" />
                                <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar tus conversaciones")}</p>
                                <button type="button" onClick={refetch} className="mt-2 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                            </div>
                        ) : conversaciones.length === 0 ? (
                            <div className="p-6 text-center">
                                <IoChatbubblesOutline className="mx-auto size-8 text-gray-300" />
                                <p className="mt-2 text-sm font-semibold text-gray-800">Aún no tienes conversaciones</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {tipo === "recruiter"
                                        ? "Inicia una desde Postulantes con el botón \"Enviar mensaje\"."
                                        : "Cuando un reclutador te escriba, la conversación aparecerá aquí."}
                                </p>
                            </div>
                        ) : visibles.length === 0 ? (
                            <p className="p-6 text-center text-sm text-gray-500">Ninguna conversación coincide.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {visibles.map(c => (
                                    <li key={c.idConversacion}>
                                        <ConversacionItem
                                            conversacion={c}
                                            activa={c.idConversacion === idActiva}
                                            miRemitente={miRemitente}
                                            onClick={() => setIdActiva(c.idConversacion)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </aside>

                {/* Conversacion elegida (key: cada conversacion empieza con su propio estado) */}
                {activa ? (
                    <ChatConversation
                        key={activa.idConversacion}
                        conversacion={activa}
                        miRemitente={miRemitente}
                        onVolver={() => setIdActiva(null)}
                    />
                ) : (
                    <section className="hidden md:flex flex-1 min-w-0 flex-col items-center justify-center p-8 text-center">
                        <div className="size-16 flex items-center justify-center rounded-2xl bg-green-50 text-green-600">
                            <FiMessageSquare className="size-7" />
                        </div>
                        <p className="mt-3 font-semibold text-gray-900">Elige una conversación</p>
                        <p className="mt-1 text-sm text-gray-500">Selecciona una conversación de la lista para ver los mensajes.</p>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ChatInbox;
