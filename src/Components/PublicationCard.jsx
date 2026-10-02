import { useEffect, useRef, useState } from "react";
import {
    IoHeart,
    IoHeartOutline,
    IoChatbubbleOutline,
    IoEllipsisHorizontal,
    IoPencilOutline,
    IoTrashOutline,
    IoSend
} from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useEsAdmin } from "../Hooks/useEsAdmin";
import {
    useInteractionPublicationMutation,
    useUpdatePublicationMutation,
    useDeletePublicationMutation
} from "../services/publication";
import { obtenerMensajeError, tiempoRelativo } from "../helpers";

const FOTO_DEFAULT = 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true';

const Avatar = ({ src, className = "size-10" }) => (
    <img className={`${className} shrink-0 rounded-full object-cover`} src={src || FOTO_DEFAULT} alt="foto de perfil" />
);

const PublicationCard = ({ publicacion }) => {
    const { userId, userToken } = useAppSelector(state => state.users);
    // El back aun no deja al admin dar like ni comentar (no tiene perfil de persona)
    const puedeInteractuar = !useEsAdmin();
    const [interactuar] = useInteractionPublicationMutation();
    const [updatePublication, { isLoading: guardandoEdicion }] = useUpdatePublicationMutation();
    const [deletePublication, { isLoading: eliminando }] = useDeletePublicationMutation();

    const { id, descripcion, imagen, createdAt, persona, interacciones = [] } = publicacion;
    const esMia = (publicacion.idPersona ?? persona?.id) === userId;

    const lista = interacciones ?? [];
    const miInteraccion = lista.find(i => i.id?.idPerson === userId);
    const meGusta = !!miInteraccion?.meGusta;
    const miComentario = miInteraccion?.comentario?.trim() || "";
    const totalLikes = lista.filter(i => i.meGusta).length;
    // Un registro con solo like no es comentario
    const comentarios = lista.filter(i => i.comentario?.trim());

    const [mostrarComentarios, setMostrarComentarios] = useState(false);
    const [editandoComentario, setEditandoComentario] = useState(false);
    const [textoComentario, setTextoComentario] = useState("");
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [editando, setEditando] = useState(false);
    const [textoEdicion, setTextoEdicion] = useState(descripcion ?? "");
    const [confirmarEliminar, setConfirmarEliminar] = useState(false);
    const menuRef = useRef(null);
    const comentarioRef = useRef(null);

    // Cierra el menu al dar clic fuera
    useEffect(() => {
        if (!menuAbierto) return;
        const cerrar = (e) => {
            if (!menuRef.current?.contains(e.target)) setMenuAbierto(false);
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, [menuAbierto]);

    // Siempre se mandan like y comentario juntos: el back sobrescribe el registro completo
    const guardarInteraccion = async (cambios) => {
        try {
            await interactuar({
                token: userToken,
                interaction: {
                    id: { idPublication: id, idPerson: userId },
                    meGusta,
                    comentario: miComentario,
                    ...cambios
                }
            }).unwrap();
            return true;
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo guardar tu interacción"));
            return false;
        }
    };

    const handleComentar = () => {
        setMostrarComentarios(true);
        if (!miComentario) requestAnimationFrame(() => comentarioRef.current?.focus());
    };

    const handleEnviarComentario = async (e) => {
        e.preventDefault();
        const texto = textoComentario.trim();
        if (!texto) return;
        if (await guardarInteraccion({ comentario: texto })) {
            setTextoComentario("");
            setEditandoComentario(false);
        }
    };

    const handleEditarComentario = () => {
        setTextoComentario(miComentario);
        setEditandoComentario(true);
        requestAnimationFrame(() => comentarioRef.current?.focus());
    };

    const handleGuardarEdicion = async () => {
        const texto = textoEdicion.trim();
        if (!texto) return;
        try {
            await updatePublication({ id, publicacion: { idPersona: userId, descripcion: texto }, token: userToken }).unwrap();
            toast.success("Publicación actualizada");
            setEditando(false);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo actualizar la publicación"));
        }
    };

    const handleEliminar = async () => {
        try {
            await deletePublication({ id, token: userToken }).unwrap();
            toast.success("Publicación eliminada");
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo eliminar la publicación"));
            setConfirmarEliminar(false);
        }
    };

    const mostrarCaja = !miComentario || editandoComentario;

    return (
        <article className="bg-white mt-4 rounded-2xl shadow border border-gray-100">

            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 p-4 pb-0">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={persona?.imagen} className="size-12" />
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{persona?.nombre} {persona?.apellido}</p>
                        <p className="text-xs text-gray-500 truncate">
                            {[persona?.especialidad, tiempoRelativo(createdAt)].filter(Boolean).join(" · ")}
                        </p>
                    </div>
                </div>

                {esMia && (
                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuAbierto(v => !v)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Opciones de la publicación"
                        >
                            <IoEllipsisHorizontal className="size-5" />
                        </button>
                        {menuAbierto && (
                            <div className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                                <button
                                    type="button"
                                    onClick={() => { setTextoEdicion(descripcion ?? ""); setEditando(true); setMenuAbierto(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <IoPencilOutline className="size-4" /> Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setConfirmarEliminar(true); setMenuAbierto(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <IoTrashOutline className="size-4" /> Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Texto */}
            <div className="px-4 pt-3">
                {editando ? (
                    <div>
                        <textarea
                            value={textoEdicion}
                            onChange={(e) => setTextoEdicion(e.target.value)}
                            rows={4}
                            autoFocus
                            className="w-full p-3 text-gray-800 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setEditando(false)}
                                disabled={guardandoEdicion}
                                className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleGuardarEdicion}
                                disabled={!textoEdicion.trim() || textoEdicion.trim() === descripcion?.trim() || guardandoEdicion}
                                className="px-4 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardandoEdicion ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 whitespace-pre-line break-words">{descripcion}</p>
                )}
            </div>

            {imagen && (
                <img className="w-full max-h-[480px] object-cover mt-3" src={imagen} alt="imagen de la publicación" />
            )}

            {/* Contadores */}
            {(totalLikes > 0 || comentarios.length > 0) && (
                <div className={`flex justify-between px-4 pt-3 text-xs text-gray-500 ${puedeInteractuar ? "" : "pb-3"}`}>
                    <span>{totalLikes > 0 && `${totalLikes} me gusta`}</span>
                    {comentarios.length > 0 && (
                        <button type="button" onClick={() => setMostrarComentarios(v => !v)} className="hover:underline">
                            {comentarios.length} {comentarios.length === 1 ? "comentario" : "comentarios"}
                        </button>
                    )}
                </div>
            )}

            {/* Acciones */}
            {puedeInteractuar && <div className="grid grid-cols-2 gap-1 mx-4 mt-2 py-1 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => guardarInteraccion({ meGusta: !meGusta })}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50 ${meGusta ? "text-red-500" : "text-gray-600"} cursor-pointer`}
                >
                    {meGusta ? <IoHeart className="size-5" /> : <IoHeartOutline className="size-5" />}
                    Me gusta
                </button>
                <button
                    type="button"
                    onClick={handleComentar}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                >
                    <IoChatbubbleOutline className="size-5" />
                    Comentar
                </button>
            </div>}

            {/* Comentarios */}
            {mostrarComentarios && (
                <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100">
                    {puedeInteractuar && mostrarCaja && (
                        <form onSubmit={handleEnviarComentario} className="flex items-start gap-2">
                            <input
                                ref={comentarioRef}
                                value={textoComentario}
                                onChange={(e) => setTextoComentario(e.target.value)}
                                placeholder={editandoComentario ? "Edita tu comentario..." : "Escribe un comentario..."}
                                className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-green-500 focus:bg-white"
                            />
                            {editandoComentario && (
                                <button
                                    type="button"
                                    onClick={() => { setEditandoComentario(false); setTextoComentario(""); }}
                                    className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!textoComentario.trim()}
                                className="p-2.5 rounded-full text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Enviar comentario"
                            >
                                <IoSend className="size-4" />
                            </button>
                        </form>
                    )}

                    {comentarios.map(c => {
                        const esMiComentario = c.id?.idPerson === userId;
                        return (
                            <div key={c.id?.idPerson} className="flex items-start gap-2">
                                <Avatar src={c.persona?.imagen} className="size-8" />
                                <div className="flex-1 min-w-0">
                                    <div className={`px-3 py-2 rounded-2xl ${esMiComentario ? "bg-green-50" : "bg-gray-100"}`}>
                                        <p className="text-xs font-semibold text-gray-900">
                                            {esMiComentario ? "Tú" : `${c.persona?.nombre ?? ""} ${c.persona?.apellido ?? ""}`}
                                        </p>
                                        <p className="text-sm text-gray-800 whitespace-pre-line break-words">{c.comentario}</p>
                                    </div>
                                    <div className="flex gap-3 mt-1 ml-3 text-xs text-gray-500">
                                        <span>{tiempoRelativo(c.createdAt)}</span>
                                        {esMiComentario && !editandoComentario && (
                                            <>
                                                <button type="button" onClick={handleEditarComentario} className="font-semibold hover:text-gray-800">Editar</button>
                                                <button type="button" onClick={() => guardarInteraccion({ comentario: "" })} className="font-semibold hover:text-red-600">Borrar</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirmar eliminar */}
            {confirmarEliminar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">¿Eliminar publicación?</h3>
                        <p className="text-sm text-gray-500 mt-1">Se borrará junto con sus me gusta y comentarios. No se puede deshacer.</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setConfirmarEliminar(false)}
                                disabled={eliminando}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleEliminar}
                                disabled={eliminando}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                            >
                                {eliminando ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
};

export default PublicationCard;
