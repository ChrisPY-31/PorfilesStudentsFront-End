import React, { useState } from "react";
import { IoCloseSharp, IoSearchOutline, IoAlertCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useCreateRecomedationMutation, useUpdateRecomendationMutation } from "../services/recomentationStudent";
import { useGetStudentsForMentionsQuery } from "../services/projectsUser";
import { obtenerMensajeError } from "../helpers";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";
const MIN_CARACTERES = 10;
const MAX_CARACTERES = 500;

const TarjetaEstudiante = ({ estudiante, children }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
        <img src={estudiante.imagen || FOTO_DEFAULT} alt="" className="size-11 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{estudiante.nombre} {estudiante.apellido}</p>
            {estudiante.carrera?.carrera && <p className="text-xs text-gray-500 truncate">{estudiante.carrera.carrera}</p>}
        </div>
        {children}
    </div>
);

/**
 * - estudiante: alumno ya elegido (desde su perfil o al editar); si no viene, se muestra el buscador
 * - comentarioActual: si viene, se edita la recomendacion existente (PUT)
 * - yaRecomendados: ids de alumnos que este maestro ya recomendo (no se pueden elegir de nuevo)
 * - onGuardado: recarga los datos de la pantalla que abrio el modal
 */
const CreateRecommendationForm = ({ estudiante: estudianteInicial = null, comentarioActual, yaRecomendados = new Set(), onClose, onGuardado }) => {
    const editando = comentarioActual !== undefined;
    const { userToken } = useAppSelector(state => state.users);
    const [crear] = useCreateRecomedationMutation();
    const [actualizar] = useUpdateRecomendationMutation();
    const { data: estudiantes = [], isLoading: cargandoEstudiantes } = useGetStudentsForMentionsQuery(undefined, { skip: !!estudianteInicial });

    const [estudiante, setEstudiante] = useState(estudianteInicial);
    const [busqueda, setBusqueda] = useState("");
    const [comentario, setComentario] = useState(comentarioActual ?? "");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const texto = busqueda.trim().toLowerCase();
    const sugerencias = texto
        ? estudiantes.filter(s => `${s.nombre} ${s.apellido}`.toLowerCase().includes(texto)).slice(0, 6)
        : [];

    const largo = comentario.trim().length;

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (guardando) return;
        if (!estudiante) return setError("Elige al estudiante que quieres recomendar");
        if (largo < MIN_CARACTERES) return setError(`Escribe al menos ${MIN_CARACTERES} caracteres`);

        setGuardando(true);
        try {
            const datos = { idStudent: estudiante.id, comentario: comentario.trim(), token: userToken };
            await (editando ? actualizar(datos) : crear(datos)).unwrap();
            await onGuardado?.();
            toast.success(editando ? "Recomendación actualizada" : `Recomendaste a ${estudiante.nombre}`);
            onClose();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo guardar la recomendación"));
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <form onSubmit={handleGuardar} className="w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Encabezado */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900">{editando ? "Editar recomendación" : "Recomendar estudiante"}</h2>
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
                    {/* Estudiante */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estudiante</label>
                        {estudiante ? (
                            <TarjetaEstudiante estudiante={estudiante}>
                                {!estudianteInicial && (
                                    <button
                                        type="button"
                                        onClick={() => setEstudiante(null)}
                                        className="text-xs font-semibold text-gray-500 hover:text-green-700"
                                    >
                                        Cambiar
                                    </button>
                                )}
                            </TarjetaEstudiante>
                        ) : (
                            <div className="relative">
                                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setError(""); }}
                                    placeholder={cargandoEstudiantes ? "Cargando estudiantes..." : "Busca al estudiante por nombre..."}
                                    autoFocus
                                    className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                />
                                {texto && (
                                    <div className="absolute left-0 right-0 mt-1 py-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                                        {sugerencias.length === 0 && <p className="px-4 py-2 text-sm text-gray-400">Sin resultados</p>}
                                        {sugerencias.map(s => {
                                            const yaLoRecomende = yaRecomendados.has(s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    disabled={yaLoRecomende}
                                                    onClick={() => { setEstudiante(s); setBusqueda(""); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                                >
                                                    <img src={s.imagen || FOTO_DEFAULT} alt="" className="size-8 rounded-full object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{s.nombre} {s.apellido}</p>
                                                        {s.carrera?.carrera && <p className="text-xs text-gray-500 truncate">{s.carrera.carrera}</p>}
                                                    </div>
                                                    {yaLoRecomende && <span className="text-xs text-gray-500">Ya lo recomendaste</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Comentario */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Recomendación</label>
                        <textarea
                            value={comentario}
                            onChange={(e) => { setComentario(e.target.value.slice(0, MAX_CARACTERES)); setError(""); }}
                            rows={6}
                            autoFocus={!!estudianteInicial}
                            placeholder="¿Qué destacarías de este estudiante? Un proyecto, su desempeño en clase, su actitud..."
                            className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                        <div className="flex justify-between mt-1 text-xs">
                            <span className={largo > 0 && largo < MIN_CARACTERES ? "text-amber-600" : "text-gray-400"}>
                                Mínimo {MIN_CARACTERES} caracteres
                            </span>
                            <span className="text-gray-400">{comentario.length}/{MAX_CARACTERES}</span>
                        </div>
                    </div>

                    {error && (
                        <p className="flex items-center gap-1 text-sm font-medium text-red-600">
                            <IoAlertCircleOutline className="size-4" /> {error}
                        </p>
                    )}
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
                        {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Recomendar"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRecommendationForm;
