import React, { useState } from "react";
import { IoCloseSharp, IoLanguageOutline, IoTrashOutline, IoAddCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import {
    useCreateLanguagesMutation,
    useUpdateLanguageMutation,
    useDeleteLanguageMutation
} from "../services/UserSlice";
import { obtenerMensajeError, NIVELES_IDIOMA } from "../helpers";

// Solo sugerencias: el back acepta cualquier nombre
const SUGERENCIAS = ["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Chino", "Japonés", "Coreano", "Ruso", "Árabe", "Náhuatl"];

const SelectorNivel = ({ valor, onChange, disabled }) => (
    <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl">
        {NIVELES_IDIOMA.map(nivel => (
            <button
                key={nivel.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange(nivel.value)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:cursor-not-allowed ${valor === nivel.value
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
            >
                {nivel.label}
            </button>
        ))}
    </div>
);

const LanguageForm = ({ onCancel, idiomasActuales = [] }) => {
    const { userId, username, userToken } = useAppSelector(state => state.users);
    const { getUserByUsername } = useUserAccount();
    const [createLanguages, { isLoading: agregando }] = useCreateLanguagesMutation();
    const [updateLanguage] = useUpdateLanguageMutation();
    const [deleteLanguage] = useDeleteLanguageMutation();

    const [nombre, setNombre] = useState("");
    const [nivel, setNivel] = useState("");
    const [ocupado, setOcupado] = useState(null); // idIdioma que se esta guardando o borrando

    const nombreLimpio = nombre.trim();
    const duplicado = idiomasActuales.some(i => i.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase());

    const recargarPerfil = () => getUserByUsername(username, userToken);

    const handleAgregar = async (e) => {
        e.preventDefault();
        if (!nombreLimpio || !nivel || duplicado) return;
        try {
            await createLanguages({
                idiomas: [{ idPersona: userId, nombre: nombreLimpio, nivel }],
                token: userToken
            }).unwrap();
            toast.success(`${nombreLimpio} agregado`);
            setNombre("");
            setNivel("");
            await recargarPerfil();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo agregar el idioma"));
        }
    };

    const handleCambiarNivel = async (idioma, nuevoNivel) => {
        if (idioma.nivel === nuevoNivel) return;
        setOcupado(idioma.idIdioma);
        try {
            await updateLanguage({
                idioma: { idIdioma: idioma.idIdioma, idPersona: userId, nombre: idioma.nombre, nivel: nuevoNivel },
                token: userToken
            }).unwrap();
            await recargarPerfil();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo actualizar el idioma"));
        } finally {
            setOcupado(null);
        }
    };

    const handleEliminar = async (idioma) => {
        setOcupado(idioma.idIdioma);
        try {
            await deleteLanguage({ idIdioma: idioma.idIdioma, token: userToken }).unwrap();
            toast.success(`${idioma.nombre} eliminado`);
            await recargarPerfil();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo eliminar el idioma"));
        } finally {
            setOcupado(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-sky-600 bg-sky-100">
                            <IoLanguageOutline className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">Mis idiomas</h2>
                            <p className="text-sm text-gray-500">Los cambios se guardan al momento.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Cerrar"
                    >
                        <IoCloseSharp className="size-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Idiomas actuales */}
                    {idiomasActuales.length > 0 && (
                        <section className="space-y-3">
                            {idiomasActuales.map(idioma => (
                                <div
                                    key={idioma.idIdioma}
                                    className={`p-3 border border-gray-200 rounded-xl transition-opacity ${ocupado === idioma.idIdioma ? "opacity-50" : ""}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-gray-800">{idioma.nombre}</p>
                                        <button
                                            type="button"
                                            disabled={ocupado === idioma.idIdioma}
                                            onClick={() => handleEliminar(idioma)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            aria-label={`Eliminar ${idioma.nombre}`}
                                        >
                                            <IoTrashOutline className="size-4" />
                                        </button>
                                    </div>
                                    <SelectorNivel
                                        valor={idioma.nivel}
                                        disabled={ocupado === idioma.idIdioma}
                                        onChange={(nuevoNivel) => handleCambiarNivel(idioma, nuevoNivel)}
                                    />
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Agregar nuevo */}
                    <form onSubmit={handleAgregar} className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Agregar idioma</p>
                        <input
                            type="text"
                            list="sugerencias-idiomas"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Inglés"
                            maxLength={50}
                            className="w-full px-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                        />
                        <datalist id="sugerencias-idiomas">
                            {SUGERENCIAS.map(s => <option key={s} value={s} />)}
                        </datalist>
                        {duplicado && (
                            <p className="text-xs text-amber-600">Ya tienes este idioma; cambia su nivel arriba.</p>
                        )}
                        <SelectorNivel valor={nivel} onChange={setNivel} />
                        <button
                            type="submit"
                            disabled={!nombreLimpio || !nivel || duplicado || agregando}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IoAddCircleOutline className="size-5" />
                            {agregando ? "Agregando..." : "Agregar"}
                        </button>
                    </form>
                </div>

                {/* Pie */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border-2 border-gray-300 hover:bg-white transition-colors"
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageForm;
