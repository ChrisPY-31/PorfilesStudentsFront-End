import React, { useState } from "react";
import { IoInformationCircleOutline, IoCheckmarkCircle, IoMailOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import {
    useGetPartnershipOptionsQuery,
    useGetPartnershipQuery,
    useCreateCompanyAdminMutation,
} from "../services/partnerships";
import { obtenerMensajeError } from "../helpers";
import { EMAIL_REGEX, inputClass } from "../helpers/formulario";
import { Campo } from "./CompanyProfileForm";

// Mismas reglas que la cuenta de reclutador (RecruiterForm)
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,30}$/;
const VACIO = { nombre: "", apellido: "", puesto: "", email: "", username: "" };

// Crea la cuenta de empresa (COMPANY_ADMIN) de un convenio (solo ADMIN).
// idCorporacion preselecciona el convenio; con fijo no se puede cambiar (desde su detalle).
// Solo se ofrecen convenios activos sin cuenta activa (GET /partnerships/options; el back rechaza los demas).
const CompanyAccountForm = ({ idCorporacion, fijo = false, onCreada, onCancelar }) => {
    const { userToken } = useAppSelector(state => state.users);
    const opcionesQ = useGetPartnershipOptionsQuery({ token: userToken }, { skip: !userToken || fijo });
    const [crearCuenta] = useCreateCompanyAdminMutation();

    const [idConvenio, setIdConvenio] = useState(idCorporacion ? String(idCorporacion) : "");
    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [creada, setCreada] = useState(null);

    // Convenios a los que se les puede crear cuenta (ya vienen ordenados por nombre)
    const disponibles = opcionesQ.data ?? [];
    // Con fijo el nombre sale del detalle del convenio; si no, de la opcion elegida
    const { data: convenioFijo } = useGetPartnershipQuery({ id: idConvenio, token: userToken }, { skip: !userToken || !fijo || !idConvenio });
    const convenio = fijo ? convenioFijo : disponibles.find(c => String(c.idCorporacion) === idConvenio);

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor }));
        setErrores(e => ({ ...e, [campo]: undefined }));
    };

    const validar = () => {
        const nuevos = {};
        if (!idConvenio) nuevos.convenio = "Elige el convenio";
        if (!valores.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
        if (!valores.apellido.trim()) nuevos.apellido = "El apellido es obligatorio";
        if (!valores.email.trim()) nuevos.email = "El correo es obligatorio";
        else if (!EMAIL_REGEX.test(valores.email.trim())) nuevos.email = "El correo no es válido";
        if (!valores.username.trim()) nuevos.username = "El usuario es obligatorio";
        else if (!USERNAME_REGEX.test(valores.username.trim())) nuevos.username = "De 4 a 30 caracteres: letras, números, punto, guion o guion bajo";
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (guardando || !validar()) return;
        setGuardando(true);
        const cuenta = {
            nombre: valores.nombre.trim(),
            apellido: valores.apellido.trim(),
            puesto: valores.puesto.trim() || null,
            email: valores.email.trim(),
            username: valores.username.trim(),
        };
        try {
            const respuesta = await crearCuenta({ idCorporacion: Number(idConvenio), cuenta, token: userToken }).unwrap();
            toast.success("Cuenta de empresa creada");
            setCreada({ ...cuenta, ...(respuesta?.object ?? {}), empresa: convenio?.nombreEmpresa });
            onCreada?.(respuesta?.object);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo crear la cuenta de empresa"));
        } finally {
            setGuardando(false);
        }
    };

    if (creada) {
        return (
            <div className="text-center py-4">
                <IoCheckmarkCircle className="mx-auto size-14 text-green-600" />
                <h3 className="mt-3 text-lg font-bold text-gray-900">Cuenta de empresa creada</h3>
                <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">{creada.nombre} {creada.apellido}</span> ya puede administrar{" "}
                    <span className="font-semibold">{creada.empresa}</span> con el usuario{" "}
                    <span className="font-mono font-semibold">{creada.username}</span>.
                    Su contraseña se envió a <span className="font-semibold">{creada.email}</span>.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {onCancelar ? (
                        <button type="button" onClick={onCancelar}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md">
                            Listo
                        </button>
                    ) : (
                        <button type="button" onClick={() => { setCreada(null); setValores(VACIO); setIdConvenio(""); }}
                            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm">
                            Crear otra cuenta
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const cargandoListas = opcionesQ.isLoading;

    return (
        <form onSubmit={handleGuardar} noValidate className="space-y-5">
            {fijo ? (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm">
                    <p className="text-xs text-gray-500">Convenio</p>
                    <p className="font-semibold text-gray-900">{convenio?.nombreEmpresa ?? "…"}</p>
                </div>
            ) : (
                <Campo label="Convenio" error={errores.convenio}
                    ayuda={!cargandoListas && disponibles.length === 0 ? undefined : "Solo convenios activos que aún no tienen cuenta de empresa"}>
                    <select
                        value={idConvenio}
                        onChange={(e) => { setIdConvenio(e.target.value); setErrores(err => ({ ...err, convenio: undefined })); }}
                        disabled={cargandoListas}
                        className={`${inputClass(errores.convenio)} bg-white`}
                    >
                        <option value="">{cargandoListas ? "Cargando convenios..." : "Elige el convenio"}</option>
                        {disponibles.map(c => (
                            <option key={c.idCorporacion} value={c.idCorporacion}>{c.nombreEmpresa}</option>
                        ))}
                    </select>
                    {!cargandoListas && disponibles.length === 0 && (
                        <p className="mt-1 text-xs text-amber-700">Todos los convenios activos ya tienen cuenta de empresa. Crea un convenio nuevo o desactiva una cuenta.</p>
                    )}
                </Campo>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Nombre" error={errores.nombre}>
                    <input value={valores.nombre} onChange={(e) => cambiar("nombre", e.target.value)} className={inputClass(errores.nombre)} />
                </Campo>
                <Campo label="Apellido" error={errores.apellido}>
                    <input value={valores.apellido} onChange={(e) => cambiar("apellido", e.target.value)} className={inputClass(errores.apellido)} />
                </Campo>
            </div>

            <Campo label="Puesto" opcional>
                <input value={valores.puesto} onChange={(e) => cambiar("puesto", e.target.value)}
                    placeholder="Ej. Responsable de vinculación" className={inputClass(false)} />
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Correo" error={errores.email}>
                    <input value={valores.email} onChange={(e) => cambiar("email", e.target.value)} inputMode="email"
                        placeholder="persona@empresa.com" className={inputClass(errores.email)} />
                </Campo>
                <Campo label="Usuario" error={errores.username} ayuda="Con este usuario iniciará sesión">
                    <input value={valores.username} onChange={(e) => cambiar("username", e.target.value)}
                        autoCapitalize="none" spellCheck={false} placeholder="empresa.admin" className={`${inputClass(errores.username)} font-mono`} />
                </Campo>
            </div>

            <p className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
                <IoMailOutline className="size-4 shrink-0 mt-0.5" />
                La contraseña la genera el sistema y se envía a este correo. Si el correo no se puede enviar, la cuenta no se crea.
            </p>

            <div className="flex justify-end gap-3">
                {onCancelar && (
                    <button type="button" onClick={onCancelar} disabled={guardando}
                        className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm disabled:opacity-50">
                        Cancelar
                    </button>
                )}
                <button type="submit" disabled={guardando || (!fijo && !cargandoListas && disponibles.length === 0)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md disabled:opacity-50">
                    {guardando ? "Creando..." : "Crear cuenta"}
                </button>
            </div>

            <p className="flex items-start gap-1.5 text-xs text-gray-400">
                <IoInformationCircleOutline className="size-4 shrink-0" />
                La cuenta de empresa administra la página, las vacantes y los reclutadores de la empresa. Cada convenio tiene solo una cuenta activa.
            </p>
        </form>
    );
};

export default CompanyAccountForm;
