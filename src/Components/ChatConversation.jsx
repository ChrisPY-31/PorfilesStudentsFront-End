import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiSend, FiLock, FiCheck } from "react-icons/fi";
import { IoAlertCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useGetMessagesQuery, useSendMessageMutation, useMarkConversationReadMutation } from "../services/chat";
import { obtenerMensajeError } from "../helpers";
import { abrirConversacionActiva, cerrarConversacionActiva } from "../helpers/chatActivo";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";
const MAX_MENSAJE = 2000;

const hora = (fecha) => new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

// "Hoy", "Ayer" o la fecha completa, para separar los mensajes por dia
const etiquetaDia = (fecha) => {
    const d = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);
    if (d.toDateString() === hoy.toDateString()) return "Hoy";
    if (d.toDateString() === ayer.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: d.getFullYear() === hoy.getFullYear() ? undefined : "numeric" });
};

// Chat de una conversacion: mensajes (con "cargar anteriores"), enviar y marcar como leida.
// `miRemitente` es ALUMNO o RECLUTADOR segun la sesion; `onVolver` solo en pantallas chicas
const ChatConversation = ({ conversacion, miRemitente, onVolver }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { idConversacion, contraparte, vacante, estado, noLeidos } = conversacion;
    const bloqueada = estado === "BLOQUEADA";

    const [pagina, setPagina] = useState(0);
    const { data, isLoading, isFetching, isError, error, refetch } = useGetMessagesQuery(
        { idConversacion, page: pagina, token: userToken },
        // Al volver a abrirla se piden los mas recientes (se juntan con los que ya estaban, sin duplicar)
        { skip: !userToken, refetchOnMountOrArgChange: true }
    );
    const [sendMessage, { isLoading: enviando }] = useSendMessageMutation();
    const [markRead] = useMarkConversationReadMutation();
    const [texto, setTexto] = useState("");

    const scrollRef = useRef(null);
    const alturaAntes = useRef(null); // para conservar la posicion al cargar mensajes anteriores
    const ultimoId = useRef(null);

    // Del mas antiguo al mas reciente para pintarlos de arriba hacia abajo
    const mensajes = useMemo(() => [...(data?.mensajes ?? [])].reverse(), [data]);

    // Se registra como abierta: los mensajes que lleguen por WebSocket se marcan como leidos
    useEffect(() => {
        abrirConversacionActiva(idConversacion);
        return () => cerrarConversacionActiva(idConversacion);
    }, [idConversacion]);

    // Al abrir (o si llegan mensajes sin leer) se marca como leida
    useEffect(() => {
        if (noLeidos > 0) markRead({ idConversacion, token: userToken });
    }, [idConversacion, noLeidos, markRead, userToken]);

    // Scroll: abajo al abrir o al llegar un mensaje nuevo; misma posicion al cargar anteriores
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (alturaAntes.current !== null) {
            el.scrollTop = el.scrollHeight - alturaAntes.current;
            alturaAntes.current = null;
            return;
        }
        const nuevoUltimo = mensajes[mensajes.length - 1]?.idMensaje;
        if (nuevoUltimo !== ultimoId.current) {
            el.scrollTop = el.scrollHeight;
            ultimoId.current = nuevoUltimo;
        }
    }, [mensajes]);

    const cargarAnteriores = () => {
        alturaAntes.current = scrollRef.current?.scrollHeight ?? null;
        setPagina(p => p + 1);
    };

    const enviar = async () => {
        const contenido = texto.trim();
        if (!contenido || enviando || bloqueada) return;
        try {
            await sendMessage({ idConversacion, contenido, token: userToken }).unwrap();
            setTexto("");
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo enviar el mensaje"));
        }
    };

    // Enter envia; Shift+Enter hace salto de linea
    const alTeclear = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    };

    const nombre = `${contraparte?.nombre ?? ""} ${contraparte?.apellido ?? ""}`.trim();
    // Perfil: el alumno tiene pagina de persona; el reclutador muestra su empresa
    const subtitulo = contraparte?.tipo === "RECLUTADOR" ? contraparte?.empresa?.nombreEmpresa : vacante?.titulo;

    // Ultimo mensaje mio, para mostrar si ya lo leyeron
    const ultimoMio = [...mensajes].reverse().find(m => m.remitente === miRemitente);

    return (
        <section className="flex-1 min-w-0 flex flex-col">
            {/* Encabezado */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                {onVolver && (
                    <button type="button" onClick={onVolver} aria-label="Volver a la bandeja" className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100">
                        <FiArrowLeft className="size-5" />
                    </button>
                )}
                <img src={contraparte?.imagen || FOTO_DEFAULT} alt="" className="size-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                    {contraparte?.tipo === "ALUMNO" && contraparte?.id
                        ? <Link to={`/Person/${contraparte.id}`} className="block truncate font-semibold text-gray-900 hover:underline">{nombre}</Link>
                        : <p className="truncate font-semibold text-gray-900">{nombre}</p>}
                    {subtitulo && <p className="truncate text-xs text-green-700">{subtitulo}</p>}
                </div>
                {contraparte?.tipo === "RECLUTADOR" && vacante?.titulo && (
                    <span className="hidden lg:block max-w-[220px] truncate text-xs text-gray-500">{vacante.titulo}</span>
                )}
            </header>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/60">
                {isLoading ? (
                    <div className="space-y-3">
                        {[40, 60, 35].map((w, i) => (
                            <div key={i} className={`flex ${i % 2 ? "justify-end" : ""}`}>
                                <div className="h-9 rounded-2xl bg-gray-200 animate-pulse" style={{ width: `${w}%` }} />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <IoAlertCircleOutline className="size-8 text-red-500" />
                        <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar los mensajes")}</p>
                        <button type="button" onClick={refetch} className="mt-2 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                    </div>
                ) : (
                    <>
                        {!data?.ultima && (
                            <div className="mb-4 text-center">
                                <button
                                    type="button"
                                    onClick={cargarAnteriores}
                                    disabled={isFetching}
                                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {isFetching ? "Cargando..." : "Cargar mensajes anteriores"}
                                </button>
                            </div>
                        )}
                        {mensajes.length === 0 && (
                            <p className="mt-10 text-center text-sm text-gray-400">Aún no hay mensajes en esta conversación.</p>
                        )}
                        <ul className="space-y-1.5">
                            {mensajes.map((m, i) => {
                                const mio = m.remitente === miRemitente;
                                const anterior = mensajes[i - 1];
                                const nuevoDia = !anterior || new Date(anterior.enviado).toDateString() !== new Date(m.enviado).toDateString();
                                const mismoAutor = anterior && !nuevoDia && anterior.remitente === m.remitente;
                                return (
                                    <React.Fragment key={m.idMensaje}>
                                        {nuevoDia && (
                                            <li className="py-3 text-center">
                                                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-500">{etiquetaDia(m.enviado)}</span>
                                            </li>
                                        )}
                                        <li className={`flex ${mio ? "justify-end" : "justify-start"} ${mismoAutor ? "" : "pt-1.5"}`}>
                                            <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${mio
                                                ? "bg-green-600 text-white rounded-br-md"
                                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"}`}
                                            >
                                                <p className="whitespace-pre-line break-words">{m.contenido}</p>
                                                <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mio ? "text-green-100" : "text-gray-400"}`}>
                                                    {hora(m.enviado)}
                                                    {mio && m.idMensaje === ultimoMio?.idMensaje && m.leido && <><FiCheck className="size-3" /> Leído</>}
                                                </p>
                                            </div>
                                        </li>
                                    </React.Fragment>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>

            {/* Escribir */}
            {bloqueada ? (
                <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
                    <FiLock className="size-4" /> Esta conversación está bloqueada; no se pueden enviar mensajes.
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex items-end gap-2">
                        <textarea
                            value={texto}
                            onChange={(e) => setTexto(e.target.value.slice(0, MAX_MENSAJE))}
                            onKeyDown={alTeclear}
                            rows={1}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 max-h-32 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-green-500 focus:bg-white field-sizing-content"
                        />
                        <button
                            type="button"
                            onClick={enviar}
                            disabled={!texto.trim() || enviando}
                            aria-label="Enviar mensaje"
                            className="shrink-0 size-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
                        >
                            <FiSend className="size-4" />
                        </button>
                    </div>
                    <p className="mt-1 px-1 flex justify-between text-[11px] text-gray-400">
                        <span>Enter para enviar · Shift + Enter para salto de línea</span>
                        {texto.length > MAX_MENSAJE - 200 && <span>{texto.length}/{MAX_MENSAJE}</span>}
                    </p>
                </div>
            )}
        </section>
    );
};

export default ChatConversation;
