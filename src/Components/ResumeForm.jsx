import React, { useRef, useState } from "react";
import { IoCloseSharp, IoCloudUploadOutline, IoDocumentTextOutline, IoOpenOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import { useUploadMyResumeMutation } from "../services/updatePerson";
import { obtenerMensajeError } from "../helpers";

const MAX_MB = 10;

const tamano = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

// Mismas reglas que el back: extension .pdf, tipo application/pdf y hasta 10MB
const validarPdf = (archivo) => {
    const esPdf = archivo.name.toLowerCase().endsWith(".pdf") && archivo.type === "application/pdf";
    if (!esPdf) return "El CV debe ser un archivo PDF";
    if (archivo.size > MAX_MB * 1024 * 1024) return `El PDF no puede pasar de ${MAX_MB} MB`;
    return null;
};

// Ventana para subir o reemplazar el CV del alumno (PATCH /student/me/resume).
// `actual`: URL del CV que ya tiene, si existe
const ResumeForm = ({ actual, onClose }) => {
    const { username, userToken } = useAppSelector(state => state.users);
    const { getUserByUsername } = useUserAccount();
    const [uploadMyResume, { isLoading }] = useUploadMyResumeMutation();
    const inputRef = useRef(null);
    const [archivo, setArchivo] = useState(null);
    const [arrastrando, setArrastrando] = useState(false);

    const elegir = (nuevo) => {
        if (!nuevo) return;
        const error = validarPdf(nuevo);
        if (error) {
            toast.error(error);
            return;
        }
        setArchivo(nuevo);
    };

    const subir = async () => {
        if (!archivo || isLoading) return;
        const formData = new FormData();
        formData.append("file", archivo);
        try {
            await uploadMyResume({ formData, token: userToken }).unwrap();
            toast.success(actual ? "CV actualizado" : "CV subido");
            // El perfil de la sesion trae el CV nuevo
            await getUserByUsername(username, userToken).catch(() => {});
            onClose();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo subir el CV"));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{actual ? "Actualizar CV" : "Subir CV"}</h3>
                    <button type="button" onClick={onClose} disabled={isLoading} aria-label="Cerrar" className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-50">
                        <IoCloseSharp className="size-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {actual && (
                        <a
                            href={actual}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                        >
                            <IoDocumentTextOutline className="size-7 text-red-500 shrink-0" />
                            <span className="flex-1 text-sm">
                                <span className="block font-semibold text-gray-900">CV actual</span>
                                <span className="block text-xs text-gray-500">Se reemplazará por el nuevo</span>
                            </span>
                            <IoOpenOutline className="size-4 text-gray-400" />
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                        onDragLeave={() => setArrastrando(false)}
                        onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegir(e.dataTransfer.files[0]); }}
                        className={`w-full flex flex-col items-center gap-2 p-8 rounded-2xl border-2 border-dashed text-center transition-colors ${arrastrando ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-gray-50"}`}
                    >
                        {archivo ? (
                            <>
                                <IoDocumentTextOutline className="size-10 text-red-500" />
                                <span className="max-w-full truncate text-sm font-semibold text-gray-900">{archivo.name}</span>
                                <span className="text-xs text-gray-500">{tamano(archivo.size)} · Da clic para elegir otro</span>
                            </>
                        ) : (
                            <>
                                <IoCloudUploadOutline className="size-10 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-800">Arrastra tu CV aquí o da clic para elegirlo</span>
                                <span className="text-xs text-gray-500">PDF de hasta {MAX_MB} MB</span>
                            </>
                        )}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(e) => { elegir(e.target.files[0]); e.target.value = ""; }}
                    />

                    <p className="text-xs text-gray-500">
                        Este CV se enviará en tus próximas postulaciones. Las que ya enviaste conservan el CV con el que se enviaron.
                    </p>
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
                        onClick={subir}
                        disabled={!archivo || isLoading}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md disabled:opacity-50"
                    >
                        {isLoading ? "Subiendo..." : actual ? "Reemplazar CV" : "Subir CV"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeForm;
