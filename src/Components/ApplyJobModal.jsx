import React from "react";
import { IoCloseSharp, IoDocumentTextOutline, IoOpenOutline, IoBusinessOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useApplyToJobMutation } from "../services/student";
import { obtenerMensajeError } from "../helpers";

// Confirmar la postulacion a una vacante: solo se envia el CV del perfil
// (el back lo copia; las postulaciones conservan el CV con el que se enviaron).
// `onCambiarCV` abre la ventana del CV sin perder lo escrito
const ApplyJobModal = ({ vacante, onClose, onCambiarCV, onPostulado }) => {
    const { user, userToken } = useAppSelector(state => state.users);
    const [applyToJob, { isLoading }] = useApplyToJobMutation();
    const empresa = vacante.empresa;

    const enviar = async () => {
        if (isLoading) return;
        try {
            await applyToJob({ idVacante: vacante.idVacante, token: userToken }).unwrap();
            toast.success("¡Listo! Te postulaste a la vacante");
            onPostulado?.();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo enviar tu postulación"));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Postularme</h3>
                    <button type="button" onClick={onClose} disabled={isLoading} aria-label="Cerrar" className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-50">
                        <IoCloseSharp className="size-6" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Vacante */}
                    <div className="flex items-center gap-3">
                        <span className="size-12 shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center text-gray-400">
                            {empresa?.logo ? <img src={empresa.logo} alt="" className="size-full object-contain" /> : <IoBusinessOutline className="size-6" />}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{vacante.titulo}</p>
                            {empresa?.nombreEmpresa && <p className="truncate text-sm text-gray-500">{empresa.nombreEmpresa}</p>}
                        </div>
                    </div>

                    {/* CV */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1.5">Currículum</p>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                            <IoDocumentTextOutline className="size-7 shrink-0 text-red-500" />
                            <span className="flex-1 min-w-0 text-sm">
                                <span className="block font-medium text-gray-900">CV de tu perfil</span>
                                <a href={user?.curriculum} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline">
                                    Ver <IoOpenOutline className="size-3" />
                                </a>
                            </span>
                            <button type="button" onClick={onCambiarCV} disabled={isLoading} className="shrink-0 text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50">
                                Cambiar
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Solo el reclutador de esta vacante podrá verlo.</p>
                    </div>

                    <p className="text-xs text-gray-500">Solo puedes postularte una vez a cada vacante.</p>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={enviar}
                        disabled={isLoading}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md disabled:opacity-50"
                    >
                        {isLoading ? "Enviando..." : "Enviar postulación"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyJobModal;
