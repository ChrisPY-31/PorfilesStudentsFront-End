import React, { useEffect, useState } from "react";
import { IoAlertCircleOutline, IoBusinessOutline, IoMailOutline, IoPersonOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import { useGetMyCompanyAdminQuery, useUpdateMyCompanyAdminMutation } from "../services/company";
import { obtenerMensajeError } from "../helpers";

// Limites de las columnas en la BD (name/last_name 100; position/description VARCHAR 255 por defecto)
const MAX = { nombre: 100, apellido: 100, puesto: 255, descripcion: 255 };

const inputClass = (conError) =>
    `w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${conError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
    }`;

const Campo = ({ label, error, opcional, contador, children }) => (
    <div>
        <div className="flex items-baseline justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
            </label>
            {contador && <span className="text-xs text-gray-400">{contador}</span>}
        </div>
        {children}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <IoAlertCircleOutline className="size-4" /> {error}
            </p>
        )}
    </div>
);

const Dato = ({ icono, etiqueta, children }) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-gray-400 [&>svg]:size-5">{icono}</span>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{etiqueta}</p>
            <p className="text-sm font-medium text-gray-900 truncate">{children}</p>
        </div>
    </div>
);

const desdePerfil = (perfil) => ({
    nombre: perfil?.nombre ?? "",
    apellido: perfil?.apellido ?? "",
    puesto: perfil?.puesto ?? "",
    descripcion: perfil?.descripcion ?? "",
});

// Seccion "Mis datos" de los ajustes de la cuenta de empresa (COMPANY_ADMIN):
// datos de la persona encargada, no de la empresa (esos se editan en /MiEmpresa)
const CompanyAdminForm = () => {
    const { userToken, username } = useAppSelector(state => state.users);
    const { getUserByUsername } = useUserAccount();
    const { data: perfil, isLoading, isError, error, refetch } = useGetMyCompanyAdminQuery({ token: userToken }, { skip: !userToken });
    const [updateMyCompanyAdmin] = useUpdateMyCompanyAdminMutation();

    const [valores, setValores] = useState(desdePerfil(null));
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (perfil) setValores(desdePerfil(perfil));
    }, [perfil]);

    const original = desdePerfil(perfil);
    const hayCambios = Object.keys(original).some(campo => valores[campo].trim() !== original[campo].trim());

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor.slice(0, MAX[campo]) }));
        setErrores(err => ({ ...err, [campo]: undefined }));
    };

    const validar = () => {
        const nuevos = {};
        if (!valores.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
        if (!valores.apellido.trim()) nuevos.apellido = "El apellido es obligatorio";
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (guardando || !hayCambios || !validar()) return;
        setGuardando(true);

        // PUT reemplaza todo: se mandan los 4 campos; vacio -> null para borrar puesto/descripcion
        const datos = {
            nombre: valores.nombre.trim(),
            apellido: valores.apellido.trim(),
            puesto: valores.puesto.trim() || null,
            descripcion: valores.descripcion.trim() || null,
        };

        try {
            await updateMyCompanyAdmin({ datos, token: userToken }).unwrap();
            toast.success("Datos actualizados");
            // Refresca el nombre en la barra y en el menu de perfil
            await getUserByUsername(username, userToken).catch(() => {});
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudieron guardar tus datos"));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-display text-2xl font-bold text-gray-900">Mis datos</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Datos de la persona encargada de la cuenta. Los datos de la empresa se editan en su página.
                </p>

                {isLoading && (
                    <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-pulse">
                        <div className="h-4 w-1/3 rounded bg-gray-200" />
                        <div className="h-10 rounded-xl bg-gray-100" />
                        <div className="h-10 rounded-xl bg-gray-100" />
                        <div className="h-24 rounded-xl bg-gray-100" />
                    </div>
                )}

                {isError && (
                    <div className="mt-6 p-6 text-center bg-white rounded-2xl border border-gray-200">
                        <p className="text-gray-700">{obtenerMensajeError(error, "No se pudieron cargar tus datos")}</p>
                        <button
                            type="button"
                            onClick={refetch}
                            className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {perfil && (
                    <>
                        {/* Datos de la cuenta: solo lectura */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white rounded-2xl border border-gray-200 p-5">
                            <Dato icono={<IoPersonOutline />} etiqueta="Usuario">{perfil.username}</Dato>
                            <Dato icono={<IoMailOutline />} etiqueta="Correo">{perfil.email}</Dato>
                            <Dato icono={<IoBusinessOutline />} etiqueta="Empresa">{perfil.empresa?.nombreEmpresa ?? "—"}</Dato>
                        </div>

                        <form onSubmit={handleGuardar} className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Campo label="Nombre" error={errores.nombre}>
                                        <input value={valores.nombre} onChange={(e) => cambiar("nombre", e.target.value)} className={inputClass(errores.nombre)} />
                                    </Campo>
                                    <Campo label="Apellido" error={errores.apellido}>
                                        <input value={valores.apellido} onChange={(e) => cambiar("apellido", e.target.value)} className={inputClass(errores.apellido)} />
                                    </Campo>
                                </div>

                                <Campo label="Puesto" opcional>
                                    <input
                                        value={valores.puesto}
                                        onChange={(e) => cambiar("puesto", e.target.value)}
                                        placeholder="Ej. Gerente de Recursos Humanos"
                                        className={inputClass(false)}
                                    />
                                </Campo>

                                <Campo label="Descripción" opcional contador={`${valores.descripcion.length}/${MAX.descripcion}`}>
                                    <textarea
                                        value={valores.descripcion}
                                        onChange={(e) => cambiar("descripcion", e.target.value)}
                                        rows={4}
                                        placeholder="Cuéntales a los estudiantes quién eres y qué haces en la empresa"
                                        className={`${inputClass(false)} resize-none`}
                                    />
                                </Campo>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => { setValores(original); setErrores({}); }}
                                    disabled={guardando || !hayCambios}
                                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm transition-colors disabled:opacity-50"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando || !hayCambios}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
                                >
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyAdminForm;
