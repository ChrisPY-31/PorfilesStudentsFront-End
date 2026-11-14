import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import {
    IoBusinessOutline, IoLocationOutline, IoTimeOutline, IoCashOutline, IoLaptopOutline,
    IoCalendarOutline, IoSchoolOutline, IoAlertCircleOutline, IoInformationCircleOutline, IoBriefcaseOutline, IoCheckmarkCircle,
} from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetJobQuery } from "../services/jobs";
import { useGetMyApplicationsQuery } from "../services/student";
import ApplyJobModal from "../Components/ApplyJobModal";
import ResumeForm from "../Components/ResumeForm";
import { EstadoPostulacion } from "../Components/ApplicationCard";
import { TIPOS_VACANTE, MODALIDADES, JORNADAS, formatearSalario } from "../helpers/vacantes";
import { obtenerMensajeError, formatearFechaCorta } from "../helpers";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";

const Dato = ({ icono, etiqueta, children }) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-gray-400 [&>svg]:size-5">{icono}</span>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{etiqueta}</p>
            <p className="text-sm font-medium text-gray-900">{children}</p>
        </div>
    </div>
);

const Seccion = ({ titulo, children }) => (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900">{titulo}</h2>
        <div className="mt-3">{children}</div>
    </section>
);

// Detalle de una vacante publicada (/Empleos/:id, GET /jobs/{id}, publico).
// Si ya no esta visible (pausada, cerrada, vencida o convenio no vigente) el back responde 404
const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, tipo, userToken } = useAppSelector(state => state.users);
    const { data: vacante, isLoading, isError, error, refetch } = useGetJobQuery(id, { skip: !id });
    // Alumno: para saber si ya se postulo a esta vacante
    const esAlumno = tipo === "student";
    const { data: misPostulaciones = [], isLoading: cargandoPostulaciones } = useGetMyApplicationsQuery(
        { token: userToken },
        { skip: !esAlumno || !userToken }
    );
    const [postulando, setPostulando] = useState(false);
    const [subiendoCV, setSubiendoCV] = useState(false);

    const volver = (
        <button type="button" onClick={() => navigate("/Empleos")} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800">
            <FiArrowLeft className="size-4" /> Empleos
        </button>
    );

    if (isLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 mt-8 pb-12 space-y-4">
                {volver}
                <div className="h-40 bg-white rounded-2xl border border-gray-200 animate-pulse" />
                <div className="h-64 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            </div>
        );
    }

    if (isError || !vacante) {
        const noDisponible = error?.status === 404;
        return (
            <div className="w-full max-w-5xl mx-auto px-4 mt-8 pb-12">
                {volver}
                <div className="mt-4 p-10 text-center bg-white rounded-2xl border border-gray-200">
                    {noDisponible
                        ? <IoBriefcaseOutline className="mx-auto size-9 text-gray-300" />
                        : <IoAlertCircleOutline className="mx-auto size-9 text-red-500" />}
                    <p className="mt-3 font-semibold text-gray-900">
                        {noDisponible ? "Esta vacante ya no está disponible" : "No se pudo cargar la vacante"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {noDisponible
                            ? "Puede que la empresa la haya pausado, cerrado o que ya haya vencido."
                            : obtenerMensajeError(error, "Intenta de nuevo en unos minutos.")}
                    </p>
                    <div className="mt-4 flex justify-center gap-4">
                        {!noDisponible && <button type="button" onClick={refetch} className="text-sm font-semibold text-green-700 hover:underline">Reintentar</button>}
                        <Link to="/Empleos" className="text-sm font-semibold text-green-700 hover:underline">Ver otras vacantes</Link>
                    </div>
                </div>
            </div>
        );
    }

    const { empresa, reclutador, carreras = [], tecnologias = [] } = vacante;
    const miPostulacion = misPostulaciones.find(p => String(p.vacante?.idVacante) === String(vacante.idVacante));
    const tieneCV = Boolean(user?.curriculum);
    const salario = formatearSalario(vacante.salarioMin, vacante.salarioMax);
    // Aviso (no bloquea): la vacante es para otras carreras que la del alumno
    const miCarrera = user?.carrera?.idCarrera;
    const otraCarrera = tipo === "student" && miCarrera && carreras.length > 0 && !carreras.some(c => c.idCarrera === miCarrera);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 mt-8 pb-12">
            {volver}

            {/* Encabezado */}
            <section className="mt-4 bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-wrap items-start gap-4">
                    {empresa && (
                        <Link
                            to={`/Empresa/${empresa.idCorporacion}`}
                            aria-label={`Ver la empresa ${empresa.nombreEmpresa}`}
                            className="size-16 shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center text-gray-400"
                        >
                            {empresa.logo
                                ? <img src={empresa.logo} alt="" className="size-full object-contain" />
                                : <IoBusinessOutline className="size-8" />}
                        </Link>
                    )}
                    <div className="flex-1 min-w-[220px]">
                        {vacante.tipo && (
                            <span className="text-xs font-semibold uppercase tracking-wide text-green-700">{TIPOS_VACANTE[vacante.tipo] ?? vacante.tipo}</span>
                        )}
                        <h1 className="mt-0.5 font-display text-2xl md:text-3xl font-bold text-gray-900">{vacante.titulo}</h1>
                        {empresa && (
                            <Link to={`/Empresa/${empresa.idCorporacion}`} className="mt-1 inline-block text-gray-600 font-medium hover:text-green-700 hover:underline">
                                {empresa.nombreEmpresa}
                            </Link>
                        )}
                        {vacante.fechaPublicacion && (
                            <p className="mt-1 text-sm text-gray-400">Publicada el {formatearFechaCorta(vacante.fechaPublicacion)}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {vacante.modalidad && <Dato icono={<IoLaptopOutline />} etiqueta="Modalidad">{MODALIDADES[vacante.modalidad] ?? vacante.modalidad}</Dato>}
                    {vacante.jornada && <Dato icono={<IoTimeOutline />} etiqueta="Jornada">{JORNADAS[vacante.jornada] ?? vacante.jornada}</Dato>}
                    {vacante.ubicacion && <Dato icono={<IoLocationOutline />} etiqueta="Ubicación">{vacante.ubicacion}</Dato>}
                    <Dato icono={<IoCashOutline />} etiqueta="Salario mensual">{salario ?? "No especificado"}</Dato>
                </div>
            </section>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Seccion titulo="Descripción">
                        {vacante.descripcion
                            ? <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">{vacante.descripcion}</p>
                            : <p className="text-sm text-gray-400">La empresa no agregó una descripción.</p>}
                    </Seccion>

                    {tecnologias.length > 0 && (
                        <Seccion titulo="Tecnologías que buscan">
                            <div className="flex flex-wrap gap-2">
                                {tecnologias.map(t => (
                                    <span key={t.idTecnologia} className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-sm text-green-800">{t.nombre}</span>
                                ))}
                            </div>
                        </Seccion>
                    )}
                </div>

                <aside className="space-y-4">
                    {/* Postularse: siguiente paso */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        {vacante.fechaCierre && (
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                                <IoCalendarOutline className="size-5 text-gray-400" />
                                Recibe postulaciones hasta el <span className="font-semibold text-gray-900">{formatearFechaCorta(vacante.fechaCierre)}</span>
                            </p>
                        )}
                        {esAlumno && (
                            cargandoPostulaciones ? (
                                <div className="mt-4 h-11 rounded-xl bg-gray-100 animate-pulse" />
                            ) : miPostulacion ? (
                                // Ya se postulo (una sola vez por vacante, aunque la haya retirado)
                                <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-100">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
                                        <IoCheckmarkCircle className="size-5" /> Ya te postulaste
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                        <EstadoPostulacion estado={miPostulacion.estado} />
                                        {miPostulacion.fechaPostulacion && <span>el {formatearFechaCorta(miPostulacion.fechaPostulacion)}</span>}
                                    </div>
                                    <Link
                                        to="/sing-in-and-security"
                                        state={{ ajuste: "mis-postulaciones" }}
                                        className="mt-3 inline-block text-sm font-semibold text-green-700 hover:underline"
                                    >
                                        Ver mis postulaciones
                                    </Link>
                                </div>
                            ) : tieneCV ? (
                                <button
                                    type="button"
                                    onClick={() => setPostulando(true)}
                                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors"
                                >
                                    Postularme
                                </button>
                            ) : (
                                // Sin CV el back no deja postularse: primero se sube
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setSubiendoCV(true)}
                                        className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors"
                                    >
                                        Sube tu CV para postularte
                                    </button>
                                    <p className="mt-2 text-xs text-gray-500">Necesitas un CV en PDF en tu perfil antes de postularte.</p>
                                </>
                            )
                        )}
                        {otraCarrera && (
                            <p className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">
                                <IoInformationCircleOutline className="size-4 shrink-0 mt-0.5" />
                                Esta vacante está dirigida a otras carreras distintas a la tuya.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                            <IoSchoolOutline className="size-5 text-gray-400" /> Carreras
                        </h2>
                        {carreras.length > 0 ? (
                            <ul className="mt-3 space-y-1.5">
                                {carreras.map(c => (
                                    <li key={c.idCarrera} className={`text-sm ${c.idCarrera === miCarrera ? "font-semibold text-green-700" : "text-gray-700"}`}>
                                        {c.carrera}{c.idCarrera === miCarrera && " (tu carrera)"}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">Abierta a todas las carreras.</p>
                        )}
                    </div>

                    {reclutador && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h2 className="font-semibold text-gray-900">Publicada por</h2>
                            <div className="mt-3 flex items-center gap-3">
                                <img src={reclutador.imagen || FOTO_DEFAULT} alt="" className="size-11 rounded-full object-cover" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">{reclutador.nombre} {reclutador.apellido}</p>
                                    {reclutador.puesto && <p className="truncate text-xs text-gray-500">{reclutador.puesto}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {postulando && (
                <ApplyJobModal
                    vacante={vacante}
                    onClose={() => setPostulando(false)}
                    onCambiarCV={() => setSubiendoCV(true)}
                    onPostulado={() => setPostulando(false)}
                />
            )}
            {/* Va despues para quedar encima de la ventana de postularme */}
            {subiendoCV && <ResumeForm actual={user?.curriculum} onClose={() => setSubiendoCV(false)} />}
        </div>
    );
};

export default JobDetail;
