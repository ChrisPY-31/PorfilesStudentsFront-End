import React, { useState } from "react";
import { IoCloseSharp, IoAlertCircleOutline, IoLockClosedOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUpdateMyCompanyProfileMutation } from "../services/company";
import { esUrlValida, obtenerMensajeError } from "../helpers";

// Limites de CompanyProfileRequest en el back
const MAX = { descripcion: 3000, sitioWeb: 255, sector: 100, tamano: 50, ubicacion: 255, correoContacto: 255 };

const TAMANOS_EMPRESA = [
    "1 a 10 empleados",
    "11 a 50 empleados",
    "51 a 200 empleados",
    "201 a 500 empleados",
    "501 a 1,000 empleados",
    "Más de 1,000 empleados",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (conError) =>
    `w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${conError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-green-500 focus:ring-green-100"
    }`;

const Campo = ({ label, error, opcional, children, ayuda }) => (
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

const CompanyProfileForm = ({ perfil, onClose }) => {
    const { userToken } = useAppSelector(state => state.users);
    const [updateProfile] = useUpdateMyCompanyProfileMutation();

    const [valores, setValores] = useState({
        descripcion: perfil?.descripcion ?? "",
        sector: perfil?.sector ?? "",
        tamano: perfil?.tamano ?? "",
        ubicacion: perfil?.ubicacion ?? "",
        sitioWeb: perfil?.sitioWeb ?? "",
        correoContacto: perfil?.correoContacto ?? "",
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    const cambiar = (campo, valor) => {
        setValores(v => ({ ...v, [campo]: valor }));
        setErrores(err => ({ ...err, [campo]: undefined }));
    };

    const validar = () => {
        const nuevos = {};
        Object.entries(MAX).forEach(([campo, max]) => {
            if (valores[campo].trim().length > max) nuevos[campo] = `Máximo ${max} caracteres`;
        });
        const web = valores.sitioWeb.trim();
        if (web && !esUrlValida(web)) nuevos.sitioWeb = "Escribe la dirección completa, con https://";
        const correo = valores.correoContacto.trim();
        if (correo && !EMAIL_REGEX.test(correo)) nuevos.correoContacto = "El correo no es válido";
        setErrores(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (guardando || !validar()) return;
        setGuardando(true);

        // El PUT reemplaza todo: se mandan todos los campos (vacio = se borra en el back)
        const datos = Object.fromEntries(Object.entries(valores).map(([campo, valor]) => [campo, valor.trim()]));

        try {
            await updateProfile({ perfil: datos, token: userToken }).unwrap();
            toast.success("Perfil de la empresa actualizado");
            onClose();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo guardar el perfil"));
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <form onSubmit={handleGuardar} className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-extrabold text-gray-900">Editar perfil de la empresa</h2>
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
                    {/* Nombre y categoria son del convenio: los cambia la universidad */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <IoLockClosedOutline className="size-5 shrink-0 mt-0.5 text-gray-400" />
                        <div className="text-sm">
                            <p className="font-semibold text-gray-800">{perfil?.nombreEmpresa}</p>
                            {perfil?.categoria && <p className="text-gray-500">{perfil.categoria}</p>}
                            <p className="mt-1 text-xs text-gray-400">El nombre y la categoría vienen del convenio con la universidad. Para cambiarlos, contacta al administrador.</p>
                        </div>
                    </div>

                    <Campo label="Acerca de la empresa" error={errores.descripcion} opcional>
                        <textarea
                            value={valores.descripcion}
                            onChange={(e) => cambiar("descripcion", e.target.value)}
                            rows={7}
                            placeholder="¿Qué hace la empresa, cuál es su misión y qué pueden esperar los estudiantes que colaboren con ustedes?"
                            className={`${inputClass(errores.descripcion)} resize-y`}
                        />
                        <p className={`mt-1 text-right text-xs ${valores.descripcion.length > MAX.descripcion ? "text-red-600" : "text-gray-400"}`}>
                            {valores.descripcion.length}/{MAX.descripcion}
                        </p>
                    </Campo>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Campo label="Sector" error={errores.sector} opcional>
                            <input
                                value={valores.sector}
                                onChange={(e) => cambiar("sector", e.target.value)}
                                placeholder="Ej. Tecnologías de la información"
                                className={inputClass(errores.sector)}
                            />
                        </Campo>

                        <Campo label="Tamaño" error={errores.tamano} opcional>
                            <select
                                value={valores.tamano}
                                onChange={(e) => cambiar("tamano", e.target.value)}
                                className={`${inputClass(errores.tamano)} bg-white`}
                            >
                                <option value="">Sin especificar</option>
                                {/* Conserva un valor que no esta en la lista (escrito antes por otro medio) */}
                                {valores.tamano && !TAMANOS_EMPRESA.includes(valores.tamano) && <option value={valores.tamano}>{valores.tamano}</option>}
                                {TAMANOS_EMPRESA.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Campo>
                    </div>

                    <Campo label="Ubicación" error={errores.ubicacion} opcional>
                        <input
                            value={valores.ubicacion}
                            onChange={(e) => cambiar("ubicacion", e.target.value)}
                            placeholder="Ej. Toluca, Estado de México"
                            className={inputClass(errores.ubicacion)}
                        />
                    </Campo>

                    <Campo label="Sitio web" error={errores.sitioWeb} opcional>
                        <input
                            value={valores.sitioWeb}
                            onChange={(e) => cambiar("sitioWeb", e.target.value)}
                            placeholder="https://www.empresa.com"
                            inputMode="url"
                            className={inputClass(errores.sitioWeb)}
                        />
                    </Campo>

                    <Campo label="Correo de contacto" error={errores.correoContacto} opcional ayuda="Se muestra a los estudiantes en el perfil de la empresa">
                        <input
                            value={valores.correoContacto}
                            onChange={(e) => cambiar("correoContacto", e.target.value)}
                            placeholder="vinculacion@empresa.com"
                            inputMode="email"
                            className={inputClass(errores.correoContacto)}
                        />
                    </Campo>
                </div>

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
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyProfileForm;
