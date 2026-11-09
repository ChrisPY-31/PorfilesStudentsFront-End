import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useStartConversationMutation } from "../services/chat";
import { obtenerMensajeError } from "../helpers";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";
const MAX_MENSAJE = 2000;

// Primer mensaje del reclutador a un alumno (no hace falta que se haya postulado). El back abre la
// conversacion o reutiliza la que ya tenga con ese alumno. `alumno`: { id, nombre, apellido, imagen };
// `vacanteTitulo` solo si se escribe desde una postulacion. `onIniciada(conversacion)` para abrirla en Mensajes
const StartConversationModal = ({ alumno = {}, vacanteTitulo, onClose, onIniciada }) => {
    const { userToken } = useAppSelector(state => state.users);
    const [startConversation, { isLoading }] = useStartConversationMutation();
    const [mensaje, setMensaje] = useState(
        vacanteTitulo
            ? `Hola ${alumno.nombre ?? ""}, gracias por postularte a "${vacanteTitulo}". `
            : `Hola ${alumno.nombre ?? ""}, `
    );

    const enviar = async () => {
        const texto = mensaje.trim();
        if (!texto || isLoading) return;
        try {
            const res = await startConversation({ idEstudiante: alumno.id, mensaje: texto, token: userToken }).unwrap();
            toast.success("Mensaje enviado");
            onIniciada?.(res?.object ?? res);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo enviar el mensaje"));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900">Enviar mensaje</h3>
                <div className="mt-3 flex items-center gap-3">
                    <img src={alumno.imagen || FOTO_DEFAULT} alt="" className="size-11 rounded-full object-cover" />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{alumno.nombre} {alumno.apellido}</p>
                        {vacanteTitulo && <p className="truncate text-sm text-gray-500">Postulación a {vacanteTitulo}</p>}
                    </div>
                </div>

                <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value.slice(0, MAX_MENSAJE))}
                    rows={5}
                    autoFocus
                    className="mt-4 w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
                <p className="mt-1 text-right text-xs text-gray-400">{mensaje.length}/{MAX_MENSAJE}</p>
                <p className="mt-2 text-xs text-gray-500">El estudiante verá el mensaje en su bandeja y podrá responderte.</p>

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={enviar}
                        disabled={!mensaje.trim() || isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md disabled:opacity-50"
                    >
                        <FiSend className="size-4" /> {isLoading ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartConversationModal;
