import React from "react";
import { IoLocationOutline, IoTimeOutline, IoCashOutline, IoCalendarOutline, IoLaptopOutline } from "react-icons/io5";
import { ESTADOS_VACANTE, TIPOS_VACANTE, MODALIDADES, JORNADAS, formatearSalario } from "../helpers/vacantes";
import { formatearFechaCorta } from "../helpers";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";

export const EstadoVacante = ({ estado }) => {
    const info = ESTADOS_VACANTE[estado] ?? { label: estado, clase: "bg-gray-100 text-gray-600 border-gray-200" };
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${info.clase}`}>{info.label}</span>;
};

const Detalle = ({ icono: Icono, children }) => (
    <span className="flex items-center gap-1.5">
        <Icono className="size-4 text-gray-400" />
        {children}
    </span>
);

// Tarjeta de vacante. `acciones` va abajo a la derecha (botones segun quien la ve);
// `mostrarReclutador` para la vista de la empresa, donde hay varios reclutadores
const JobCard = ({ vacante, acciones, mostrarReclutador = false }) => {
    const salario = formatearSalario(vacante.salarioMin, vacante.salarioMax);
    const reclutador = vacante.reclutador;

    return (
        <article className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        {vacante.tipo && (
                            <span className="text-xs font-semibold uppercase tracking-wide text-green-700">{TIPOS_VACANTE[vacante.tipo] ?? vacante.tipo}</span>
                        )}
                        <EstadoVacante estado={vacante.estado} />
                    </div>
                    <h3 className="mt-1 font-display text-lg font-bold text-gray-900">{vacante.titulo}</h3>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                {vacante.modalidad && <Detalle icono={IoLaptopOutline}>{MODALIDADES[vacante.modalidad] ?? vacante.modalidad}</Detalle>}
                {vacante.jornada && <Detalle icono={IoTimeOutline}>{JORNADAS[vacante.jornada] ?? vacante.jornada}</Detalle>}
                {vacante.ubicacion && <Detalle icono={IoLocationOutline}>{vacante.ubicacion}</Detalle>}
                {salario && <Detalle icono={IoCashOutline}>{salario}</Detalle>}
            </div>

            {vacante.carreras?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {vacante.carreras.map(c => (
                        <span key={c.idCarrera} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">{c.carrera}</span>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                    {mostrarReclutador && reclutador && (
                        <span className="flex items-center gap-2">
                            <img src={reclutador.imagen || FOTO_DEFAULT} alt="" className="size-6 rounded-full object-cover" />
                            {reclutador.nombre} {reclutador.apellido}
                        </span>
                    )}
                    <Detalle icono={IoCalendarOutline}>
                        {vacante.fechaPublicacion
                            ? `Publicada el ${formatearFechaCorta(vacante.fechaPublicacion)}`
                            : `Creada el ${formatearFechaCorta(vacante.creada)}`}
                        {vacante.fechaCierre && ` · cierra el ${formatearFechaCorta(vacante.fechaCierre)}`}
                    </Detalle>
                </div>
                {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
            </div>
        </article>
    );
};

export default JobCard;
