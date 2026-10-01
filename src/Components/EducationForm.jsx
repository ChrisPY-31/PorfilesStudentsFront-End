import React, { useState } from "react";
import { IoCloseSharp, IoAlertCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import { useCreateEducationUserMutation, useUpdateEducationUserMutation } from "../services/UserSlice";
import { TIPOS_EDUCACION, obtenerMensajeError } from "../helpers";

const MAX_DESCRIPCION = 500;

const inputClass = (conError) =>
    `w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${conError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
    }`;

const Campo = ({ label, error, opcional, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
        </label>
        {children}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <IoAlertCircleOutline className="size-4" /> {error}
            </p>
        )}
    </div>
);

const EducationForm = ({ educacion, onClose }) => {
    const editando = !!educacion?.idEducacion;
    const { userId, username, userToken } = useAppSelector(state => state.users);
    const { getUserByUsername } = useUserAccount();
    const [createEducation] = useCreateEducationUserMutation();
    const [updateEducation] = useUpdateEducationUserMutation();

    const [valores, setValores] = useState({
        educacionTipo: educacion?.educacionTipo ?? "",
        institucion: educacion?.institucion ?? "",
        grado: educacion?.grado ?? "",
        fechaInicio: educacion?.fechaInicio ?? "",
        fechaFin: educacion?.fechaFin ?? "",
        enCurso: editando && !educacion?.fechaFin,
        descripcion: educacion?.descripcion ?? ""
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor }));
        setErrores(err => ({ ...err, [campo]: undefined }));
    };

    const validar = () => {
        const nuevos = {};
        if (!valores.educacionTipo) nuevos.educacionTipo = "Elige el tipo de educación";
        if (!valores.institucion.trim()) nuevos.institucion = "La institución es obligatoria";
        if (!valores.grado.trim()) nuevos.grado = "El grado o nombre del programa es obligatorio";
        if (!valores.fechaInicio) nuevos.fechaInicio = "La fecha de inicio es obligatoria";
        if (!valores.enCurso && valores.fechaFin && valores.fechaInicio && valores.fechaFin < valores.fechaInicio) {
            nuevos.fechaFin = "La fecha de fin no puede ser antes del inicio";
        }
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (guardando || !validar()) return;
        setGuardando(true);

        // fechaFin vacia va como null: un "" da 500 en el back
        const datos = {
            idPersona: userId,
            educacionTipo: valores.educacionTipo,
            institucion: valores.institucion.trim(),
            grado: valores.grado.trim(),
            fechaInicio: valores.fechaInicio,
            fechaFin: valores.enCurso ? null : (valores.fechaFin || null),
            descripcion: valores.descripcion.trim()
        };

        try {
            if (editando) {
                await updateEducation({ educacion: { idEducacion: educacion.idEducacion, ...datos }, token: userToken }).unwrap();
            } else {
                await createEducation({ educacion: datos, token: userToken }).unwrap();
            }
            await getUserByUsername(username, userToken).catch(() => {});
            toast.success(editando ? "Educación actualizada" : "Educación agregada");
            onClose();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo guardar la educación"));
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <form onSubmit={handleGuardar} className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Encabezado */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900">{editando ? "Editar educación" : "Agregar educación"}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={guardando}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <IoCloseSharp className="size-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    <Campo label="Tipo" error={errores.educacionTipo}>
                        <div className="flex flex-wrap gap-2">
                            {TIPOS_EDUCACION.map(tipo => (
                                <button
                                    key={tipo.value}
                                    type="button"
                                    onClick={() => cambiar("educacionTipo", tipo.value)}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${valores.educacionTipo === tipo.value
                                        ? "bg-green-600 border-green-600 text-white"
                                        : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                                        }`}
                                >
                                    {tipo.label}
                                </button>
                            ))}
                        </div>
                    </Campo>

                    <Campo label="Institución" error={errores.institucion}>
                        <input
                            value={valores.institucion}
                            onChange={(e) => cambiar("institucion", e.target.value)}
                            placeholder="Ej. Universidad Autónoma del Estado de México"
                            className={inputClass(errores.institucion)}
                        />
                    </Campo>

                    <Campo label="Grado o programa" error={errores.grado}>
                        <input
                            value={valores.grado}
                            onChange={(e) => cambiar("grado", e.target.value)}
                            placeholder="Ej. Ingeniería en Software"
                            className={inputClass(errores.grado)}
                        />
                    </Campo>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Inicio" error={errores.fechaInicio}>
                            <input
                                type="date"
                                value={valores.fechaInicio}
                                onChange={(e) => cambiar("fechaInicio", e.target.value)}
                                className={inputClass(errores.fechaInicio)}
                            />
                        </Campo>
                        <Campo label="Fin" error={errores.fechaFin}>
                            <input
                                type="date"
                                value={valores.enCurso ? "" : valores.fechaFin}
                                onChange={(e) => cambiar("fechaFin", e.target.value)}
                                disabled={valores.enCurso}
                                min={valores.fechaInicio || undefined}
                                className={`${inputClass(errores.fechaFin)} disabled:bg-gray-100 disabled:text-gray-400`}
                            />
                            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={valores.enCurso}
                                    onChange={(e) => cambiar("enCurso", e.target.checked)}
                                    className="accent-green-600"
                                />
                                Actualmente estudio aquí
                            </label>
                        </Campo>
                    </div>

                    <Campo label="Descripción" opcional>
                        <textarea
                            value={valores.descripcion}
                            onChange={(e) => cambiar("descripcion", e.target.value.slice(0, MAX_DESCRIPCION))}
                            rows={3}
                            placeholder="Logros, materias destacadas, actividades..."
                            className={`${inputClass(false)} resize-none`}
                        />
                        <p className="mt-1 text-right text-xs text-gray-400">{valores.descripcion.length}/{MAX_DESCRIPCION}</p>
                    </Campo>
                </div>

                {/* Pie */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={guardando}
                        className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
                    >
                        {guardando && <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Agregar"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EducationForm;
