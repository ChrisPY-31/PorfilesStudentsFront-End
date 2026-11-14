import React, { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUpdateInstitutionMutation } from "../services/institution";
import { esUrlValida, obtenerMensajeError } from "../helpers";
import { Campo } from "./CompanyProfileForm";
import { EMAIL_REGEX, inputClass } from "../helpers/formulario";

// Limites de InstitutionProfileRequest en el back
const MAX = { nombre: 150, descripcion: 3000, sitioWeb: 255, ubicacion: 255, correoContacto: 255 };

// Edicion del perfil institucional (solo ADMIN). Logo y banner van aparte.
const InstitutionProfileForm = ({ perfil, onClose }) => {
    const { userToken } = useAppSelector(state => state.users);
    const [updateInstitution] = useUpdateInstitutionMutation();

    const [valores, setValores] = useState({
        nombre: perfil?.nombre ?? "",
        descripcion: perfil?.descripcion ?? "",
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
        if (!valores.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
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
            await updateInstitution({ perfil: datos, token: userToken }).unwrap();
            toast.success("Perfil de la institución actualizado");
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
                    <h2 className="text-2xl font-extrabold text-gray-900">Editar perfil de la institución</h2>
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
                    <Campo label="Nombre" error={errores.nombre} ayuda="Es el nombre con el que aparecen las publicaciones del administrador">
                        <input
                            value={valores.nombre}
                            onChange={(e) => cambiar("nombre", e.target.value)}
                            placeholder="Ej. Centro Universitario UAEM Tianguistenco"
                            className={inputClass(errores.nombre)}
                        />
                    </Campo>

                    <Campo label="Acerca de la institución" error={errores.descripcion} opcional>
                        <textarea
                            value={valores.descripcion}
                            onChange={(e) => cambiar("descripcion", e.target.value)}
                            rows={7}
                            placeholder="Historia, misión, carreras que se ofrecen y lo que la institución ofrece a estudiantes y empresas."
                            className={`${inputClass(errores.descripcion)} resize-y`}
                        />
                        <p className={`mt-1 text-right text-xs ${valores.descripcion.length > MAX.descripcion ? "text-red-600" : "text-gray-400"}`}>
                            {valores.descripcion.length}/{MAX.descripcion}
                        </p>
                    </Campo>

                    <Campo label="Ubicación" error={errores.ubicacion} opcional>
                        <input
                            value={valores.ubicacion}
                            onChange={(e) => cambiar("ubicacion", e.target.value)}
                            placeholder="Ej. Tianguistenco, Estado de México"
                            className={inputClass(errores.ubicacion)}
                        />
                    </Campo>

                    <Campo label="Sitio web" error={errores.sitioWeb} opcional>
                        <input
                            value={valores.sitioWeb}
                            onChange={(e) => cambiar("sitioWeb", e.target.value)}
                            placeholder="https://www.uaemex.mx"
                            inputMode="url"
                            className={inputClass(errores.sitioWeb)}
                        />
                    </Campo>

                    <Campo label="Correo de contacto" error={errores.correoContacto} opcional ayuda="Se muestra en la página de la institución">
                        <input
                            value={valores.correoContacto}
                            onChange={(e) => cambiar("correoContacto", e.target.value)}
                            placeholder="contacto@institucion.mx"
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

export default InstitutionProfileForm;
