import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoDocumentTextOutline, IoPersonOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { ESTADOS_POSTULACION } from "../helpers/vacantes";
import { tiempoRelativo } from "../helpers";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";

export const EstadoPostulacion = ({ estado }) => {
    const info = ESTADOS_POSTULACION[estado] ?? { label: estado, clase: "bg-gray-100 text-gray-600 border-gray-200" };
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${info.clase}`}>{info.label}</span>;
};

// Postulacion vista por quien recibe: alumno, vacante, mensaje y CV.
// `acciones` para el reclutador (cambiar estado, chat); la empresa solo consulta
const ApplicationCard = ({ postulacion, acciones, mostrarVacante = true }) => {
    const [verMensaje, setVerMensaje] = useState(false);
    const alumno = postulacion.estudiante ?? {};
    const mensaje = postulacion.mensaje?.trim();

    return (
        <article className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-start gap-4">
                <img src={alumno.imagen || FOTO_DEFAULT} alt="" className="size-12 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-[180px]">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900">{alumno.nombre} {alumno.apellido}</p>
                        <EstadoPostulacion estado={postulacion.estado} />
                    </div>
                    <p className="text-sm text-gray-600">
                        {[alumno.carrera, alumno.semestre && `${alumno.semestre}° semestre`].filter(Boolean).join(" · ") || "Sin carrera"}
                    </p>
                    {mostrarVacante && postulacion.vacante && (
                        <p className="mt-1 text-sm text-gray-500">
                            Se postuló a <span className="font-medium text-gray-800">{postulacion.vacante.titulo}</span>
                        </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-400">{tiempoRelativo(postulacion.fechaPostulacion)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {postulacion.curriculum && (
                        <a
                            href={postulacion.curriculum}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <IoDocumentTextOutline className="size-4" /> Ver CV
                        </a>
                    )}
                    {alumno.id && (
                        <Link
                            to={`/Person/${alumno.id}`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <IoPersonOutline className="size-4" /> Ver perfil
                        </Link>
                    )}
                    {acciones}
                </div>
            </div>

            {mensaje && (
                <div className="mt-3 pl-16">
                    <button
                        type="button"
                        onClick={() => setVerMensaje(v => !v)}
                        className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline"
                    >
                        {verMensaje ? <IoChevronUp className="size-4" /> : <IoChevronDown className="size-4" />}
                        {verMensaje ? "Ocultar mensaje" : "Ver mensaje del alumno"}
                    </button>
                    {verMensaje && (
                        <p className="mt-2 p-3 rounded-xl bg-gray-50 text-sm text-gray-700 whitespace-pre-line">{mensaje}</p>
                    )}
                </div>
            )}
        </article>
    );
};

export default ApplicationCard;
