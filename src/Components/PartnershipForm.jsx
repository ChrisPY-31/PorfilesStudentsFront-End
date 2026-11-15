import React, { useState } from "react";
import { IoAlertCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import {
    useGetPartnershipsSummaryQuery,
    useCreatePartnershipMutation,
    useUpdatePartnershipMutation,
} from "../services/partnerships";
import { obtenerMensajeError } from "../helpers";
import { inputClass } from "../helpers/formulario";
import { hoyISO } from "../helpers/vacantes";

// Columnas varchar(255) en el back (el DTO no pone limite)
const MAX = 255;
const normalizar = (texto) => texto.trim().replace(/\s+/g, " ");

const Campo = ({ label, htmlFor, error, opcional, ayuda, children }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
        </label>
        {children}
        {ayuda && !error && <p className="mt-1 text-xs text-gray-400">{ayuda}</p>}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <IoAlertCircleOutline className="size-4 shrink-0" /> {error}
            </p>
        )}
    </div>
);

// Formulario de convenio: crear (sin `convenio`) o editar (con `convenio`).
// onGuardado(convenioGuardado) despues de guardar; onCancelar muestra el boton Cancelar.
// Categoria y tipo de acuerdo son texto libre; se sugieren los que ya existen (GET /partnerships/summary).
// El nombre repetido lo valida el back (la lista de convenios es paginada)
const PartnershipForm = ({ convenio, onGuardado, onCancelar }) => {
    const editando = !!convenio;
    const { userToken } = useAppSelector(state => state.users);
    const { data: resumen } = useGetPartnershipsSummaryQuery({ token: userToken }, { skip: !userToken });
    const [crear] = useCreatePartnershipMutation();
    const [actualizar] = useUpdatePartnershipMutation();

    const vacio = { nombreEmpresa: "", categoria: "", tipoAcuerdo: "", fechaInicio: hoyISO(), fechaFinal: "" };
    const [valores, setValores] = useState(editando
        ? {
            nombreEmpresa: convenio.nombreEmpresa ?? "",
            categoria: convenio.categoria ?? "",
            tipoAcuerdo: convenio.tipoAcuerdo ?? "",
            fechaInicio: convenio.fechaInicio ?? "",
            fechaFinal: convenio.fechaFinal ?? "",
        }
        : vacio);
    const [sinFin, setSinFin] = useState(editando ? !convenio.fechaFinal : false);
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    const categorias = resumen?.categorias ?? [];
    const tipos = resumen?.tiposAcuerdo ?? [];

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor }));
        setErrores(e => ({ ...e, [campo]: undefined }));
    };

    // Mismas reglas que el back (fechaFinal >= fechaInicio); el nombre repetido lo responde el back con 400
    const validar = () => {
        const nuevos = {};
        const nombre = normalizar(valores.nombreEmpresa);
        if (!nombre) nuevos.nombreEmpresa = "El nombre de la empresa es obligatorio";
        ["nombreEmpresa", "categoria", "tipoAcuerdo"].forEach(campo => {
            if (!nuevos[campo] && normalizar(valores[campo]).length > MAX) nuevos[campo] = `Máximo ${MAX} caracteres`;
        });
        if (!valores.fechaInicio) nuevos.fechaInicio = "La fecha de inicio es obligatoria";
        if (!sinFin) {
            if (!valores.fechaFinal) nuevos.fechaFinal = "Elige la fecha de término o marca «Sin fecha de término»";
            else if (valores.fechaInicio && valores.fechaFinal < valores.fechaInicio) nuevos.fechaFinal = "No puede ser anterior a la fecha de inicio";
        }
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (guardando || !validar()) return;
        setGuardando(true);

        // PUT y POST llevan todo: un opcional vacio se guarda como null
        const datos = {
            nombreEmpresa: normalizar(valores.nombreEmpresa),
            categoria: normalizar(valores.categoria) || null,
            tipoAcuerdo: normalizar(valores.tipoAcuerdo) || null,
            fechaInicio: valores.fechaInicio,
            fechaFinal: sinFin ? null : valores.fechaFinal,
        };

        try {
            const respuesta = editando
                ? await actualizar({ id: convenio.idCorporacion, convenio: datos, token: userToken }).unwrap()
                : await crear({ convenio: datos, token: userToken }).unwrap();
            toast.success(editando ? "Convenio actualizado" : `Convenio con ${datos.nombreEmpresa} creado`);
            setGuardando(false);
            if (!editando) {
                setValores(vacio);
                setSinFin(false);
            }
            onGuardado?.(respuesta?.object ?? respuesta);
        } catch (err) {
            const mensaje = obtenerMensajeError(err, editando ? "No se pudo actualizar el convenio" : "No se pudo crear el convenio");
            // "Ya existe un convenio con la empresa: X" se muestra en el campo
            if (/ya existe/i.test(mensaje)) setErrores(e2 => ({ ...e2, nombreEmpresa: "Ya existe un convenio con esa empresa" }));
            toast.error(mensaje);
            setGuardando(false);
        }
    };

    const id = editando ? `convenio-${convenio.idCorporacion}` : "convenio-nuevo";

    return (
        <form onSubmit={handleGuardar} noValidate className="space-y-5">
            <Campo label="Empresa" htmlFor={`${id}-nombre`} error={errores.nombreEmpresa}
                ayuda={editando ? "También cambia el nombre con el que aparece la empresa en su página" : undefined}>
                <input
                    id={`${id}-nombre`}
                    value={valores.nombreEmpresa}
                    onChange={(e) => cambiar("nombreEmpresa", e.target.value)}
                    placeholder="Ej. Microsoft México"
                    className={inputClass(errores.nombreEmpresa)}
                />
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Categoría" htmlFor={`${id}-categoria`} error={errores.categoria} opcional>
                    <input
                        id={`${id}-categoria`}
                        list={`${id}-categorias`}
                        value={valores.categoria}
                        onChange={(e) => cambiar("categoria", e.target.value)}
                        placeholder="Ej. Desarrollo de software"
                        className={inputClass(errores.categoria)}
                    />
                    <datalist id={`${id}-categorias`}>
                        {categorias.map(c => <option key={c} value={c} />)}
                    </datalist>
                </Campo>

                <Campo label="Tipo de acuerdo" htmlFor={`${id}-tipo`} error={errores.tipoAcuerdo} opcional>
                    <input
                        id={`${id}-tipo`}
                        list={`${id}-tipos`}
                        value={valores.tipoAcuerdo}
                        onChange={(e) => cambiar("tipoAcuerdo", e.target.value)}
                        placeholder="Ej. Prácticas profesionales"
                        className={inputClass(errores.tipoAcuerdo)}
                    />
                    <datalist id={`${id}-tipos`}>
                        {tipos.map(t => <option key={t} value={t} />)}
                    </datalist>
                </Campo>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Fecha de inicio" htmlFor={`${id}-inicio`} error={errores.fechaInicio}>
                    <input
                        id={`${id}-inicio`}
                        type="date"
                        value={valores.fechaInicio}
                        onChange={(e) => cambiar("fechaInicio", e.target.value)}
                        className={inputClass(errores.fechaInicio)}
                    />
                </Campo>

                <Campo label="Fecha de término" htmlFor={`${id}-final`} error={errores.fechaFinal}>
                    <input
                        id={`${id}-final`}
                        type="date"
                        value={sinFin ? "" : valores.fechaFinal}
                        min={valores.fechaInicio || undefined}
                        disabled={sinFin}
                        onChange={(e) => cambiar("fechaFinal", e.target.value)}
                        className={`${inputClass(errores.fechaFinal)} disabled:bg-gray-100 disabled:text-gray-400`}
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sinFin}
                            onChange={(e) => { setSinFin(e.target.checked); setErrores(err => ({ ...err, fechaFinal: undefined })); }}
                            className="size-4 accent-green-600"
                        />
                        Sin fecha de término
                    </label>
                </Campo>
            </div>

            {!sinFin && valores.fechaFinal && valores.fechaFinal < hoyISO() && (
                <p className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <IoAlertCircleOutline className="size-4 shrink-0 mt-0.5" />
                    La fecha de término ya pasó: el convenio quedará vencido y la empresa no aparecerá para los estudiantes.
                </p>
            )}

            {valores.fechaInicio > hoyISO() && (
                <p className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
                    <IoAlertCircleOutline className="size-4 shrink-0 mt-0.5" />
                    El convenio empieza en el futuro: hasta esa fecha la empresa no aparecerá para los estudiantes.
                </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
                {onCancelar && (
                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={guardando}
                        className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={guardando}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
                >
                    {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear convenio"}
                </button>
            </div>
        </form>
    );
};

export default PartnershipForm;
