import React, { useMemo, useState } from "react";
import {
    IoCodeSlashOutline,
    IoBulbOutline,
    IoSearchOutline,
    IoCheckmark,
    IoCloseSharp,
    IoAlertCircleOutline
} from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useGetSkillsCatalogQuery, useUpdateMySkillsMutation } from "../services/UserSlice";
import { useUserAccount } from "../Hooks/useUserAccount";
import { obtenerMensajeError } from "../helpers";

// Limites que valida el back en PUT /person/skills
const SECCIONES = [
    {
        tipo: "TECNOLOGIA",
        titulo: "Tecnologías",
        descripcion: "Lenguajes, frameworks y herramientas que dominas",
        maximo: 15,
        icon: IoCodeSlashOutline,
        iconClass: "text-green-600 bg-green-100",
        barraClass: "bg-green-500",
        chipActivo: "bg-green-600 border-green-600 text-white shadow-sm",
        chipInactivo: "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
    },
    {
        tipo: "APTITUD",
        titulo: "Aptitudes",
        descripcion: "Habilidades blandas que te describen",
        maximo: 5,
        icon: IoBulbOutline,
        iconClass: "text-indigo-600 bg-indigo-100",
        barraClass: "bg-indigo-500",
        chipActivo: "bg-indigo-600 border-indigo-600 text-white shadow-sm",
        chipInactivo: "border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
    }
];

// Los ids se repiten entre tecnologias y aptitudes, por eso la llave es el par (tipo, id)
const llave = (habilidad) => `${habilidad.tipo}-${habilidad.id}`;

const SkillForm = ({ onCancel, habilidadesActuales = [] }) => {
    const { username, userToken } = useAppSelector(state => state.users);
    const { getUserByUsername } = useUserAccount();
    const { data: catalogo = [], isLoading, isError, error } = useGetSkillsCatalogQuery({ token: userToken });
    const [updateMySkills, { isLoading: guardando }] = useUpdateMySkillsMutation();

    const [busqueda, setBusqueda] = useState("");
    const [seleccion, setSeleccion] = useState(() => new Set(habilidadesActuales.map(llave)));

    const seleccionInicial = useMemo(() => new Set(habilidadesActuales.map(llave)), [habilidadesActuales]);
    const hayCambios = seleccion.size !== seleccionInicial.size
        || [...seleccion].some(k => !seleccionInicial.has(k));

    const contarTipo = (tipo) => [...seleccion].filter(k => k.startsWith(`${tipo}-`)).length;

    const toggle = (habilidad, maximo) => {
        const k = llave(habilidad);
        setSeleccion(prev => {
            const nueva = new Set(prev);
            if (nueva.has(k)) {
                nueva.delete(k);
            } else if (contarTipo(habilidad.tipo) < maximo) {
                nueva.add(k);
            }
            return nueva;
        });
    };

    const idsDeTipo = (tipo) => catalogo
        .filter(h => h.tipo === tipo && seleccion.has(llave(h)))
        .map(h => h.id);

    const handleGuardar = async () => {
        try {
            await updateMySkills({
                skills: {
                    tecnologias: idsDeTipo("TECNOLOGIA"),
                    aptitudes: idsDeTipo("APTITUD")
                },
                token: userToken
            }).unwrap();
            toast.success("Habilidades actualizadas");
            await getUserByUsername(username, userToken);
            onCancel();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudieron guardar las habilidades"));
        }
    };

    const texto = busqueda.trim().toLowerCase();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">Mis habilidades</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Elige las tecnologías y aptitudes que quieres mostrar en tu perfil.
                        </p>
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

                {/* Buscador */}
                <div className="px-6 pt-4">
                    <div className="relative">
                        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar habilidad..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                        />
                    </div>
                </div>

                {/* Catalogo */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {isLoading && (
                        <div className="space-y-3 animate-pulse">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex flex-wrap gap-2">
                                    {[...Array(6)].map((_, j) => (
                                        <div key={j} className="h-8 w-20 rounded-full bg-gray-200" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
                            <IoAlertCircleOutline className="size-5 shrink-0" />
                            {obtenerMensajeError(error, "No se pudo cargar el catálogo de habilidades")}
                        </div>
                    )}

                    {!isLoading && !isError && SECCIONES.map(({ tipo, titulo, descripcion, maximo, icon: Icon, iconClass, barraClass, chipActivo, chipInactivo }) => {
                        const opciones = catalogo.filter(h =>
                            h.tipo === tipo && h.nombre.toLowerCase().includes(texto)
                        );
                        const elegidas = contarTipo(tipo);
                        const lleno = elegidas >= maximo;

                        return (
                            <section key={tipo}>
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${iconClass}`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{titulo}</h3>
                                            <p className="text-xs text-gray-500">{descripcion}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-semibold ${lleno ? "text-amber-600" : "text-gray-600"}`}>
                                        {elegidas}/{maximo}
                                    </span>
                                </div>

                                <div className="h-1.5 w-full rounded-full bg-gray-100 mb-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${barraClass}`}
                                        style={{ width: `${(elegidas / maximo) * 100}%` }}
                                    />
                                </div>

                                {lleno && (
                                    <p className="text-xs text-amber-600 mb-2">
                                        Llegaste al máximo. Quita una para elegir otra.
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {opciones.length === 0 && (
                                        <p className="text-sm text-gray-400">
                                            {texto ? "Sin resultados para tu búsqueda." : "No hay opciones disponibles."}
                                        </p>
                                    )}
                                    {opciones.map(habilidad => {
                                        const activa = seleccion.has(llave(habilidad));
                                        const bloqueada = !activa && lleno;
                                        return (
                                            <button
                                                key={llave(habilidad)}
                                                type="button"
                                                disabled={bloqueada}
                                                onClick={() => toggle(habilidad, maximo)}
                                                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${activa ? chipActivo : chipInactivo}`}
                                            >
                                                {activa && <IoCheckmark className="size-4" />}
                                                {habilidad.nombre}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Pie */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <span className="text-xs text-gray-500">
                        {hayCambios ? "Tienes cambios sin guardar" : "Sin cambios"}
                    </span>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleGuardar}
                            disabled={!hayCambios || guardando || isLoading || isError}
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

export default SkillForm;
