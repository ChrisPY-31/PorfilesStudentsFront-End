import React, { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import {
    IoCloseSharp,
    IoCloudUploadOutline,
    IoImageOutline,
    IoRemove,
    IoAdd,
    IoRefreshOutline
} from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import { useUpdateMyPhotoMutation } from "../services/updatePerson";
import { obtenerMensajeError } from "../helpers";
import { FORMATOS_IMAGEN, MAX_MB_IMAGEN, recortarImagen, validarImagen } from "../helpers/recortarImagen";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

const PhotoForm = ({ onCancel, tipo }) => {
    const { userId, username, userToken } = useAppSelector(state => state.users);
    const { getUserByUsername } = useUserAccount();
    const [updateMyPhoto] = useUpdateMyPhotoMutation();

    const inputRef = useRef(null);
    const [imagen, setImagen] = useState(null); // object URL del archivo elegido
    const [arrastrando, setArrastrando] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Libera la URL temporal cuando cambia la imagen o se cierra el modal
    useEffect(() => {
        return () => {
            if (imagen) URL.revokeObjectURL(imagen);
        };
    }, [imagen]);

    const elegirArchivo = (archivo) => {
        if (!archivo) return;
        const errorValidacion = validarImagen(archivo);
        if (errorValidacion) {
            toast.error(errorValidacion);
            return;
        }
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setImagen(URL.createObjectURL(archivo));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);
        elegirArchivo(e.dataTransfer.files[0]);
    };

    const handleGuardar = async () => {
        if (!imagen || !area) return;
        setGuardando(true);
        try {
            const archivo = await recortarImagen(imagen, area);
            const formData = new FormData();
            formData.append("image", archivo);
            await updateMyPhoto({ userId, formData, token: userToken, tipo }).unwrap();
            toast.success("Foto actualizada con éxito");
            await getUserByUsername(username, userToken).catch(() => {});
            onCancel();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : obtenerMensajeError(err, "No se pudo actualizar la foto"));
            setGuardando(false);
        }
    };

    const cambiarZoom = (delta) => setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(2))));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Encabezado */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-extrabold text-gray-900">Cambiar foto de perfil</h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={guardando}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <IoCloseSharp className="size-6" />
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={FORMATOS_IMAGEN.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        elegirArchivo(e.target.files[0]);
                        e.target.value = "";
                    }}
                />

                <div className="p-6">
                    {!imagen ? (
                        // Zona para soltar o elegir la imagen
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                            onDragLeave={() => setArrastrando(false)}
                            onDrop={handleDrop}
                            className={`w-full aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${arrastrando
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                                }`}
                        >
                            <div className="p-4 rounded-full bg-green-100 text-green-600">
                                <IoCloudUploadOutline className="size-8" />
                            </div>
                            <p className="font-semibold text-gray-800">
                                {arrastrando ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic"}
                            </p>
                            <p className="text-xs text-gray-500">JPG, PNG o WebP · máximo {MAX_MB_IMAGEN} MB</p>
                        </button>
                    ) : (
                        <>
                            {/* Recorte circular */}
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900">
                                <Cropper
                                    image={imagen}
                                    crop={crop}
                                    zoom={zoom}
                                    minZoom={ZOOM_MIN}
                                    maxZoom={ZOOM_MAX}
                                    aspect={1}
                                    cropShape="round"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={(_, areaPixeles) => setArea(areaPixeles)}
                                />
                            </div>

                            {/* Zoom */}
                            <div className="flex items-center gap-3 mt-4">
                                <button type="button" onClick={() => cambiarZoom(-0.2)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Alejar">
                                    <IoRemove className="size-5" />
                                </button>
                                <input
                                    type="range"
                                    min={ZOOM_MIN}
                                    max={ZOOM_MAX}
                                    step={0.01}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 accent-green-600 cursor-pointer"
                                    aria-label="Zoom"
                                />
                                <button type="button" onClick={() => cambiarZoom(0.2)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Acercar">
                                    <IoAdd className="size-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">Arrastra la imagen para acomodarla dentro del círculo</p>
                        </>
                    )}
                </div>

                {/* Pie */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    {imagen ? (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={guardando}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-green-700 disabled:opacity-50"
                        >
                            <IoRefreshOutline className="size-4" />
                            Elegir otra
                        </button>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <IoImageOutline className="size-4" />
                            Se guardará recortada a 512×512
                        </span>
                    )}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={guardando}
                            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleGuardar}
                            disabled={!imagen || !area || guardando}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {guardando ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoForm;
