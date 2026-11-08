import React, { useMemo, useState } from "react";
import { FiSearch, FiX, FiCheckCircle, FiCircle, FiArrowLeft } from "react-icons/fi";
import { IoAlertCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useCreateMyJobMutation, useUpdateMyJobMutation, useChangeMyJobStatusMutation } from "../services/recruiter";
import { useGetCareersQuery } from "../services/UserSlice";
import { useGetTechnologiesQuery } from "../services/projectsUser";
import { TIPOS_VACANTE, MODALIDADES, JORNADAS, MAX_TECNOLOGIAS_VACANTE, hoyISO } from "../helpers/vacantes";
import { obtenerMensajeError } from "../helpers";
import { EstadoVacante } from "./JobCard";

const MAX_TITULO = 150;

const inputClass = (conError) =>
    `w-full px-4 py-2.5 text-sm bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${conError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
    }`;

const Campo = ({ label, error, opcional, ayuda, contador, children }) => (
    <div>
        <div className="flex items-baseline justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
            </label>
            {contador && <span className="text-xs text-gray-400">{contador}</span>}
        </div>
        {children}
        {ayuda && !error && <p className="mt-1 text-xs text-gray-400">{ayuda}</p>}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <IoAlertCircleOutline className="size-4" /> {error}
            </p>
        )}
    </div>
);

const Tarjeta = ({ titulo, descripcion, children }) => (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-sm text-gray-500">{descripcion}</p>}
        <div className="mt-5 space-y-5">{children}</div>
    </section>
);

// Botones tipo "chip" para elegir una opcion de un catalogo { VALOR: "Etiqueta" }
const Opciones = ({ opciones, valor, onChange, error }) => (
    <div className="flex flex-wrap gap-2">
        {Object.entries(opciones).map(([v, label]) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(valor === v ? "" : v)}
                className={`px-3.5 py-2 rounded-xl border-2 text-sm font-medium transition-colors ${valor === v
                    ? "border-green-600 bg-green-50 text-green-700"
                    : `${error ? "border-red-200" : "border-gray-200"} bg-white text-gray-600 hover:border-green-300`}`}
            >
                {label}
            </button>
        ))}
    </div>
);

const desdeVacante = (v) => ({
    titulo: v?.titulo ?? "",
    tipo: v?.tipo ?? "",
    descripcion: v?.descripcion ?? "",
    modalidad: v?.modalidad ?? "",
    jornada: v?.jornada ?? "",
    ubicacion: v?.ubicacion ?? "",
    salarioMin: v?.salarioMin ?? "",
    salarioMax: v?.salarioMax ?? "",
    fechaCierre: v?.fechaCierre ? v.fechaCierre.slice(0, 10) : "",
});

// Seccion "Publicar vacante" (y "Editar vacante" si llega `vacante`). Se guarda como borrador
// o se guarda y publica; una vacante ya publicada/pausada se guarda con los cambios y sigue en su estado
const RecruiterJobForm = ({ vacante, onTerminar }) => {
    const { userToken } = useAppSelector(state => state.users);
    const { data: carreras = [], isLoading: cargandoCarreras } = useGetCareersQuery({ token: userToken }, { skip: !userToken });
    const { data: catalogoTec = [], isLoading: cargandoTec } = useGetTechnologiesQuery();
    const [createMyJob] = useCreateMyJobMutation();
    const [updateMyJob] = useUpdateMyJobMutation();
    const [changeStatus] = useChangeMyJobStatusMutation();

    const editando = Boolean(vacante);
    const esBorrador = !editando || vacante.estado === "BORRADOR";

    const [valores, setValores] = useState(() => desdeVacante(vacante));
    const [idsCarreras, setIdsCarreras] = useState(() => new Set((vacante?.carreras ?? []).map(c => c.idCarrera)));
    const [idsTec, setIdsTec] = useState(() => new Set((vacante?.tecnologias ?? []).map(t => t.idTecnologia)));
    const [busquedaTec, setBusquedaTec] = useState("");
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(null); // "guardar" | "publicar"

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor }));
        setErrores(e => ({ ...e, [campo]: undefined }));
    };

    const alternar = (setter, id, max) => setter(prev => {
        const nuevo = new Set(prev);
        if (nuevo.has(id)) nuevo.delete(id);
        else if (!max || nuevo.size < max) nuevo.add(id);
        else toast.error(`Puedes elegir hasta ${max} tecnologías`);
        return nuevo;
    });

    const texto = busquedaTec.trim().toLowerCase();
    const tecSeleccionadas = catalogoTec.filter(t => idsTec.has(t.idTecnologia));
    const tecDisponibles = catalogoTec.filter(t => !idsTec.has(t.idTecnologia) && t.nombre.toLowerCase().includes(texto));

    // Checklist de lo que exige el back para publicar
    const requisitos = useMemo(() => [
        { texto: "Título", listo: Boolean(valores.titulo.trim()) },
        { texto: "Tipo de vacante", listo: Boolean(valores.tipo) },
        { texto: "Descripción", listo: Boolean(valores.descripcion.trim()) },
        { texto: "Modalidad", listo: Boolean(valores.modalidad) },
        { texto: "Jornada", listo: Boolean(valores.jornada) },
    ], [valores]);
    const completa = requisitos.every(r => r.listo);

    const validar = (paraPublicar) => {
        const nuevos = {};
        if (!valores.titulo.trim()) nuevos.titulo = "El título es obligatorio";
        const min = valores.salarioMin === "" ? null : Number(valores.salarioMin);
        const max = valores.salarioMax === "" ? null : Number(valores.salarioMax);
        if (min !== null && (!Number.isInteger(min) || min < 0)) nuevos.salarioMin = "Escribe una cantidad entera, sin negativos";
        if (max !== null && (!Number.isInteger(max) || max < 0)) nuevos.salarioMax = "Escribe una cantidad entera, sin negativos";
        if (!nuevos.salarioMin && !nuevos.salarioMax && min !== null && max !== null && min > max) nuevos.salarioMax = "El máximo no puede ser menor que el mínimo";
        if (valores.fechaCierre && valores.fechaCierre < hoyISO()) nuevos.fechaCierre = "La fecha de cierre no puede ser en el pasado";
        // Para publicar (o si ya esta publicada/pausada) no puede quedar incompleta
        if (paraPublicar || !esBorrador) {
            if (!valores.tipo) nuevos.tipo = "Elige el tipo de vacante";
            if (!valores.descripcion.trim()) nuevos.descripcion = "La descripción es obligatoria para publicar";
            if (!valores.modalidad) nuevos.modalidad = "Elige la modalidad";
            if (!valores.jornada) nuevos.jornada = "Elige la jornada";
        }
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) toast.error("Revisa los campos marcados");
        return Object.keys(nuevos).length === 0;
    };

    const armarVacante = () => ({
        titulo: valores.titulo.trim(),
        tipo: valores.tipo || null,
        descripcion: valores.descripcion.trim() || null,
        modalidad: valores.modalidad || null,
        jornada: valores.jornada || null,
        ubicacion: valores.ubicacion.trim() || null,
        salarioMin: valores.salarioMin === "" ? null : Number(valores.salarioMin),
        salarioMax: valores.salarioMax === "" ? null : Number(valores.salarioMax),
        fechaCierre: valores.fechaCierre || null,
        idsCarreras: [...idsCarreras],
        idsTecnologias: [...idsTec],
    });

    const guardar = async (publicar) => {
        if (guardando || !validar(publicar)) return;
        setGuardando(publicar ? "publicar" : "guardar");
        let idGuardada = vacante?.idVacante;
        try {
            const datos = armarVacante();
            if (editando) {
                await updateMyJob({ id: vacante.idVacante, vacante: datos, token: userToken }).unwrap();
            } else {
                const res = await createMyJob({ vacante: datos, token: userToken }).unwrap();
                idGuardada = res?.object?.idVacante ?? res?.idVacante;
            }
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo guardar la vacante"));
            setGuardando(null);
            return;
        }

        if (publicar) {
            try {
                await changeStatus({ id: idGuardada, estado: "PUBLICADA", token: userToken }).unwrap();
                toast.success("Vacante publicada");
            } catch (err) {
                // Se guardo, pero el back no la dejo publicar (ej. convenio no vigente): queda como borrador
                toast.error(`Se guardó como borrador, pero no se pudo publicar: ${obtenerMensajeError(err, "intenta de nuevo")}`);
            }
        } else {
            toast.success(editando ? "Cambios guardados" : "Borrador guardado");
        }
        setGuardando(null);
        onTerminar();
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                {editando && (
                    <button type="button" onClick={onTerminar} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800">
                        <FiArrowLeft className="size-4" /> Mis vacantes
                    </button>
                )}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-2xl font-bold text-gray-900">{editando ? "Editar vacante" : "Publicar vacante"}</h1>
                    {editando && <EstadoVacante estado={vacante.estado} />}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    {editando && !esBorrador
                        ? "Los cambios se verán de inmediato en la vacante publicada."
                        : "Puedes guardarla como borrador y publicarla cuando esté completa."}
                </p>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Tarjeta titulo="Información básica">
                            <Campo label="Título" error={errores.titulo} contador={`${valores.titulo.length}/${MAX_TITULO}`}>
                                <input
                                    value={valores.titulo}
                                    onChange={(e) => cambiar("titulo", e.target.value.slice(0, MAX_TITULO))}
                                    placeholder="Ej. Desarrollador web junior"
                                    className={inputClass(errores.titulo)}
                                />
                            </Campo>
                            <Campo label="Tipo de vacante" error={errores.tipo}>
                                <Opciones opciones={TIPOS_VACANTE} valor={valores.tipo} onChange={(v) => cambiar("tipo", v)} error={errores.tipo} />
                            </Campo>
                            <Campo label="Descripción" error={errores.descripcion} ayuda="Actividades, requisitos, horario y lo que ofrece la empresa.">
                                <textarea
                                    value={valores.descripcion}
                                    onChange={(e) => cambiar("descripcion", e.target.value)}
                                    rows={7}
                                    className={`${inputClass(errores.descripcion)} resize-y`}
                                />
                            </Campo>
                        </Tarjeta>

                        <Tarjeta titulo="Condiciones">
                            <Campo label="Modalidad" error={errores.modalidad}>
                                <Opciones opciones={MODALIDADES} valor={valores.modalidad} onChange={(v) => cambiar("modalidad", v)} error={errores.modalidad} />
                            </Campo>
                            <Campo label="Jornada" error={errores.jornada}>
                                <Opciones opciones={JORNADAS} valor={valores.jornada} onChange={(v) => cambiar("jornada", v)} error={errores.jornada} />
                            </Campo>
                            <Campo label="Ubicación" opcional>
                                <input
                                    value={valores.ubicacion}
                                    onChange={(e) => cambiar("ubicacion", e.target.value)}
                                    placeholder="Ej. Toluca, Estado de México"
                                    className={inputClass(false)}
                                />
                            </Campo>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Campo label="Salario mínimo mensual" opcional error={errores.salarioMin}>
                                    <input
                                        type="number" min="0" step="1" inputMode="numeric"
                                        value={valores.salarioMin}
                                        onChange={(e) => cambiar("salarioMin", e.target.value)}
                                        placeholder="Ej. 8000"
                                        className={inputClass(errores.salarioMin)}
                                    />
                                </Campo>
                                <Campo label="Salario máximo mensual" opcional error={errores.salarioMax}>
                                    <input
                                        type="number" min="0" step="1" inputMode="numeric"
                                        value={valores.salarioMax}
                                        onChange={(e) => cambiar("salarioMax", e.target.value)}
                                        placeholder="Ej. 12000"
                                        className={inputClass(errores.salarioMax)}
                                    />
                                </Campo>
                            </div>
                            <Campo label="Fecha de cierre" opcional error={errores.fechaCierre} ayuda="Después de esta fecha la vacante se marca como vencida.">
                                <input
                                    type="date"
                                    min={hoyISO()}
                                    value={valores.fechaCierre}
                                    onChange={(e) => cambiar("fechaCierre", e.target.value)}
                                    className={`${inputClass(errores.fechaCierre)} sm:max-w-xs`}
                                />
                            </Campo>
                        </Tarjeta>

                        <Tarjeta titulo="¿A quién va dirigida?" descripcion="Las carreras que pueden postularse y las tecnologías que buscas.">
                            <Campo label="Carreras" opcional>
                                {cargandoCarreras ? (
                                    <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {carreras.map(c => {
                                            const activa = idsCarreras.has(c.idCarrera);
                                            return (
                                                <button
                                                    key={c.idCarrera}
                                                    type="button"
                                                    onClick={() => alternar(setIdsCarreras, c.idCarrera)}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm transition-colors ${activa
                                                        ? "border-green-600 bg-green-50 text-green-700 font-medium"
                                                        : "border-gray-200 bg-white text-gray-600 hover:border-green-300"}`}
                                                >
                                                    {activa ? <FiCheckCircle className="size-4" /> : <FiCircle className="size-4 text-gray-300" />}
                                                    {c.carrera}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </Campo>

                            <Campo label="Tecnologías" opcional contador={`${idsTec.size}/${MAX_TECNOLOGIAS_VACANTE}`}>
                                {tecSeleccionadas.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {tecSeleccionadas.map(t => (
                                            <span key={t.idTecnologia} className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full bg-green-600 text-white text-sm">
                                                {t.nombre}
                                                <button
                                                    type="button"
                                                    onClick={() => alternar(setIdsTec, t.idTecnologia)}
                                                    aria-label={`Quitar ${t.nombre}`}
                                                    className="p-0.5 rounded-full hover:bg-white/20"
                                                >
                                                    <FiX className="size-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input
                                        value={busquedaTec}
                                        onChange={(e) => setBusquedaTec(e.target.value)}
                                        placeholder="Buscar tecnología..."
                                        className={`${inputClass(false)} pl-9`}
                                    />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                    {cargandoTec
                                        ? <div className="h-8 w-full rounded-xl bg-gray-100 animate-pulse" />
                                        : tecDisponibles.length === 0
                                            ? <p className="text-sm text-gray-400">No hay más tecnologías{texto && " con ese nombre"}.</p>
                                            : tecDisponibles.map(t => (
                                                <button
                                                    key={t.idTecnologia}
                                                    type="button"
                                                    onClick={() => alternar(setIdsTec, t.idTecnologia, MAX_TECNOLOGIAS_VACANTE)}
                                                    className="px-3 py-1 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-green-400 hover:text-green-700"
                                                >
                                                    + {t.nombre}
                                                </button>
                                            ))}
                                </div>
                            </Campo>
                        </Tarjeta>
                    </div>

                    {/* Resumen y acciones */}
                    <aside className="lg:sticky lg:top-0 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h2 className="font-semibold text-gray-900">Para publicar necesitas</h2>
                            <ul className="mt-3 space-y-2">
                                {requisitos.map(r => (
                                    <li key={r.texto} className={`flex items-center gap-2 text-sm ${r.listo ? "text-green-700" : "text-gray-500"}`}>
                                        {r.listo ? <FiCheckCircle className="size-4" /> : <FiCircle className="size-4 text-gray-300" />}
                                        {r.texto}
                                    </li>
                                ))}
                            </ul>
                            {completa
                                ? <p className="mt-3 text-xs font-medium text-green-700">Lista para publicarse.</p>
                                : esBorrador && <p className="mt-3 text-xs text-gray-400">Para guardar un borrador solo necesitas el título.</p>}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2.5">
                            {esBorrador && (
                                <button
                                    type="button"
                                    onClick={() => guardar(true)}
                                    disabled={Boolean(guardando)}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {guardando === "publicar" ? "Publicando..." : "Guardar y publicar"}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => guardar(false)}
                                disabled={Boolean(guardando)}
                                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${esBorrador
                                    ? "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    : "text-white bg-green-600 hover:bg-green-700 shadow-md"}`}
                            >
                                {guardando === "guardar" ? "Guardando..." : esBorrador ? "Guardar borrador" : "Guardar cambios"}
                            </button>
                            {editando && (
                                <button
                                    type="button"
                                    onClick={onTerminar}
                                    disabled={Boolean(guardando)}
                                    className="w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default RecruiterJobForm;
