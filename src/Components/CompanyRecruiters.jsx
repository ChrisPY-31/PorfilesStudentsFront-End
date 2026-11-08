import React, { useMemo, useState } from "react";
import { FiUserPlus, FiSearch, FiKey, FiUserX, FiUserCheck } from "react-icons/fi";
import { IoAlertCircleOutline, IoPeopleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import {
    useGetMyRecruitersQuery,
    useChangeRecruiterStatusMutation,
    useResetRecruiterPasswordMutation,
} from "../services/company";
import { obtenerMensajeError } from "../helpers";

const FILTROS = [
    { value: "todos", label: "Todos" },
    { value: "activos", label: "Activos" },
    { value: "inactivos", label: "Desactivados" },
];

const iniciales = (r) => `${r.nombre?.[0] ?? ""}${r.apellido?.[0] ?? ""}`.toUpperCase() || "?";

// Confirmacion de desactivar / activar / restablecer contrasena
const TEXTOS = {
    desactivar: {
        titulo: "Desactivar reclutador",
        texto: (r) => `${r.nombre} ${r.apellido} ya no podrá iniciar sesión. Sus vacantes siguen siendo de la empresa. Si ya tenía la sesión abierta, se cerrará cuando venza (máximo 30 minutos).`,
        boton: "Desactivar",
        peligro: true,
    },
    activar: {
        titulo: "Activar reclutador",
        texto: (r) => `${r.nombre} ${r.apellido} podrá volver a iniciar sesión con su contraseña actual.`,
        boton: "Activar",
    },
    reset: {
        titulo: "Restablecer contraseña",
        texto: (r) => `Se generará una contraseña nueva y se enviará a ${r.email}. La contraseña anterior dejará de funcionar.`,
        boton: "Restablecer y enviar",
    },
};

const Confirmacion = ({ accion, reclutador, procesando, onConfirmar, onCancelar }) => {
    const t = TEXTOS[accion];
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900">{t.titulo}</h3>
                <p className="mt-2 text-sm text-gray-600">{t.texto(reclutador)}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={procesando}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmar}
                        disabled={procesando}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 ${t.peligro ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                    >
                        {procesando ? "Procesando..." : t.boton}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Seccion "Reclutadores" de los ajustes de la empresa; crear cuenta es otra seccion (onCrear)
const CompanyRecruiters = ({ onCrear }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: reclutadores = [], isLoading, isError, error, refetch } = useGetMyRecruitersQuery({ token: userToken }, { skip: !userToken });
    const [changeStatus] = useChangeRecruiterStatusMutation();
    const [resetPassword] = useResetRecruiterPasswordMutation();

    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todos");
    const [pendiente, setPendiente] = useState(null); // { accion, reclutador }
    const [procesando, setProcesando] = useState(false);

    const activos = reclutadores.filter(r => r.cuentaActiva).length;

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return reclutadores
            .filter(r => filtro === "todos" || (filtro === "activos" ? r.cuentaActiva : !r.cuentaActiva))
            .filter(r => !texto || [r.nombre, r.apellido, r.username, r.email, r.puesto]
                .some(campo => campo?.toLowerCase().includes(texto)))
            .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, "es"));
    }, [reclutadores, busqueda, filtro]);

    const confirmar = async () => {
        const { accion, reclutador } = pendiente;
        setProcesando(true);
        try {
            if (accion === "reset") {
                await resetPassword({ id: reclutador.id, token: userToken }).unwrap();
                toast.success(`Contraseña nueva enviada a ${reclutador.email}`);
            } else {
                await changeStatus({ id: reclutador.id, activo: accion === "activar", token: userToken }).unwrap();
                toast.success(accion === "activar" ? "Reclutador activado" : "Reclutador desactivado");
            }
            setPendiente(null);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo completar la acción"));
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-gray-900">Reclutadores</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Las personas de tu empresa que pueden publicar vacantes y revisar postulaciones.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCrear}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-md transition-colors"
                    >
                        <FiUserPlus className="size-4" /> Agregar reclutador
                    </button>
                </div>

                {/* Buscador y filtros */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, usuario, correo o puesto"
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl">
                        {FILTROS.map(f => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => setFiltro(f.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtro === f.value ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                            >
                                {f.label}
                                {f.value === "activos" && !isLoading && <span className="ml-1 opacity-75">({activos})</span>}
                                {f.value === "inactivos" && !isLoading && <span className="ml-1 opacity-75">({reclutadores.length - activos})</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista */}
                <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="divide-y divide-gray-100 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4">
                                    <div className="size-11 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 rounded bg-gray-200" />
                                        <div className="h-3 w-56 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="p-10 text-center">
                            <IoAlertCircleOutline className="mx-auto size-8 text-red-500" />
                            <p className="mt-2 text-sm text-gray-600">{obtenerMensajeError(error, "No se pudieron cargar los reclutadores")}</p>
                            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-green-700 hover:underline">Reintentar</button>
                        </div>
                    ) : reclutadores.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600">
                                <IoPeopleOutline className="size-7" />
                            </div>
                            <p className="mt-3 font-semibold text-gray-900">Aún no tienes reclutadores</p>
                            <p className="mt-1 text-sm text-gray-500">Agrega a las personas de tu equipo que publicarán vacantes para los estudiantes.</p>
                            <button
                                type="button"
                                onClick={onCrear}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50"
                            >
                                <FiUserPlus className="size-4" /> Agregar el primero
                            </button>
                        </div>
                    ) : visibles.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500">Ningún reclutador coincide con la búsqueda.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {visibles.map(r => (
                                <li key={r.id} className={`flex flex-wrap items-center gap-4 p-4 ${r.cuentaActiva ? "" : "bg-gray-50/60"}`}>
                                    <div className={`size-11 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${r.cuentaActiva ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                                        {iniciales(r)}
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={`font-semibold ${r.cuentaActiva ? "text-gray-900" : "text-gray-500"}`}>{r.nombre} {r.apellido}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${r.cuentaActiva
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                                {r.cuentaActiva ? "Activo" : "Desactivado"}
                                            </span>
                                        </div>
                                        {r.puesto && <p className="text-sm text-gray-600">{r.puesto}</p>}
                                        <p className="text-xs text-gray-400">@{r.username} · {r.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPendiente({ accion: "reset", reclutador: r })}
                                            disabled={!r.cuentaActiva}
                                            title={r.cuentaActiva ? "Restablecer contraseña" : "Activa la cuenta para restablecer la contraseña"}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <FiKey className="size-4" /> Contraseña
                                        </button>
                                        {r.cuentaActiva ? (
                                            <button
                                                type="button"
                                                onClick={() => setPendiente({ accion: "desactivar", reclutador: r })}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                <FiUserX className="size-4" /> Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setPendiente({ accion: "activar", reclutador: r })}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-50"
                                            >
                                                <FiUserCheck className="size-4" /> Activar
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {pendiente && (
                <Confirmacion
                    {...pendiente}
                    procesando={procesando}
                    onConfirmar={confirmar}
                    onCancelar={() => setPendiente(null)}
                />
            )}
        </div>
    );
};

export default CompanyRecruiters;
