import React, { useState } from "react";
import { IoAlertCircleOutline, IoMailOutline, IoCheckmarkCircle } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useCreateRecruiterMutation } from "../services/company";
import { obtenerMensajeError } from "../helpers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Sin espacios ni acentos para que sea facil de escribir al iniciar sesion
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,30}$/;

const VACIO = { nombre: "", apellido: "", puesto: "", email: "", username: "" };

const inputClass = (conError) =>
    `w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${conError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
    }`;

const Campo = ({ label, error, opcional, ayuda, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
        </label>
        {children}
        {ayuda && !error && <p className="mt-1 text-xs text-gray-400">{ayuda}</p>}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                <IoAlertCircleOutline className="size-4" /> {error}
            </p>
        )}
    </div>
);

// Seccion "Crear cuenta" de los ajustes de la empresa
const RecruiterForm = ({ onVerReclutadores }) => {
    const { userToken } = useAppSelector(state => state.users);
    const [createRecruiter] = useCreateRecruiterMutation();

    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [creado, setCreado] = useState(null); // reclutador recien creado

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor }));
        setErrores(err => ({ ...err, [campo]: undefined }));
    };

    const validar = () => {
        const nuevos = {};
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

        const reclutador = {
            nombre: valores.nombre.trim(),
            apellido: valores.apellido.trim(),
            puesto: valores.puesto.trim() || null,
            email: valores.email.trim(),
            username: valores.username.trim(),
        };

        try {
            await createRecruiter({ reclutador, token: userToken }).unwrap();
            toast.success("Reclutador creado");
            setCreado(reclutador);
            setValores(VACIO);
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo crear el reclutador"));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-display text-2xl font-bold text-gray-900">Crear cuenta de reclutador</h1>
                <p className="mt-1 text-sm text-gray-500">
                    El reclutador quedará ligado a tu empresa y podrá publicar vacantes y revisar postulaciones.
                </p>

                {creado ? (
                    // Confirmacion despues de crear
                    <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <IoCheckmarkCircle className="mx-auto size-14 text-green-600" />
                        <h2 className="mt-3 text-lg font-bold text-gray-900">Cuenta creada</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">{creado.nombre} {creado.apellido}</span> ya puede iniciar sesión con el usuario{" "}
                            <span className="font-mono font-semibold">{creado.username}</span>.
                            Su contraseña se envió a <span className="font-semibold">{creado.email}</span>.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setCreado(null)}
                                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm"
                            >
                                Crear otra cuenta
                            </button>
                            <button
                                type="button"
                                onClick={onVerReclutadores}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md"
                            >
                                Ver reclutadores
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleGuardar} className="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
                                    placeholder="Ej. Talent Acquisition"
                                    className={inputClass(false)}
                                />
                            </Campo>

                            <Campo label="Correo" error={errores.email}>
                                <input
                                    value={valores.email}
                                    onChange={(e) => cambiar("email", e.target.value)}
                                    inputMode="email"
                                    placeholder="nombre@empresa.com"
                                    className={inputClass(errores.email)}
                                />
                            </Campo>

                            <Campo label="Usuario" error={errores.username} ayuda="Con este usuario iniciará sesión">
                                <input
                                    value={valores.username}
                                    onChange={(e) => cambiar("username", e.target.value)}
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    placeholder="Ej. jperez.rh"
                                    className={inputClass(errores.username)}
                                />
                            </Campo>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                                <IoMailOutline className="size-5 shrink-0 mt-0.5" />
                                <p>El sistema genera la contraseña y la envía a este correo. Si el correo no se puede enviar, la cuenta no se crea.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => { setValores(VACIO); setErrores({}); }}
                                disabled={guardando}
                                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm transition-colors disabled:opacity-50"
                            >
                                Limpiar
                            </button>
                            <button
                                type="submit"
                                disabled={guardando}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
                            >
                                {guardando ? "Creando y enviando correo..." : "Crear reclutador"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RecruiterForm;
