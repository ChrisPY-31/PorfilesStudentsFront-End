export const formatearFecha = (fecha) => {
  const fechaNueva = new Date(fecha);
  const opciones = {
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  return fechaNueva.toLocaleDateString("es-ES", opciones);
};

export const formatearCarrera = (carrera) => {
  let forCarrera = {
    Software: "ingenieriaSW",
    Computacion: "ingenieriaC",
    Ciberseguridad: "ciberseguridad",
  };

  return forCarrera[carrera];
};


// El back responde los errores como { tiempo, mensaje, url }
export const obtenerMensajeError = (error, mensajeDefault = "Ocurrió un error, intenta de nuevo") => {
  if (error?.status === "FETCH_ERROR") return "No se pudo conectar con el servidor";
  return error?.data?.mensaje || error?.response?.data?.mensaje || mensajeDefault;
};

export const formatearRedContactos = (nombre) =>{
  let contactoFormateado = {
    LINKEDIN: "Tu perfil",
    PHONE : "Telefono",
    EMAIL: "Enviar email",
    WEB:"Sitio web"
  }
  return contactoFormateado[nombre]
}

// Niveles que acepta el back (enum de LanguageDto)
export const NIVELES_IDIOMA = [
  { value: "BASICO", label: "Básico" },
  { value: "INTERMEDIO", label: "Intermedio" },
  { value: "AVANZADO", label: "Avanzado" },
  { value: "NATIVO", label: "Nativo" }
];

// "hace 5 min", "hace 2 h", "hace 3 días"; despues de una semana muestra la fecha
export const tiempoRelativo = (fecha) => {
  if (!fecha) return "";
  const segundos = Math.round((new Date(fecha) - Date.now()) / 1000);
  if (Number.isNaN(segundos)) return "";
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const abs = Math.abs(segundos);
  if (abs < 60) return "justo ahora";
  if (abs < 3600) return rtf.format(Math.round(segundos / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(segundos / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(segundos / 86400), "day");
  return new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};

// "2025-01-15" -> "ene 2025". Se arma a mano porque new Date("2025-01-15") se toma en UTC
// y en Mexico mostraria el dia anterior
export const formatearMesAnio = (fecha) => {
  if (!fecha) return "";
  const [anio, mes] = String(fecha).split("-").map(Number);
  if (!anio || !mes) return "";
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", { month: "short", year: "numeric" }).replace(".", "");
};

// Valida que sea una URL http(s) completa
export const esUrlValida = (texto) => {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Tipos de educacion que acepta el back (enum de EducationDto)
export const TIPOS_EDUCACION = [
  { value: "BACHELOR", label: "Licenciatura" },
  { value: "MASTER", label: "Maestría" },
  { value: "PHD", label: "Doctorado" },
  { value: "DIPLOMA", label: "Diplomado" },
  { value: "COURSE", label: "Curso" }
];

// "2025-03-07" -> "7 mar 2025", sin el desfase de un dia de new Date("2025-03-07")
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return "";
  const [anio, mes, dia] = String(fecha).slice(0, 10).split("-").map(Number);
  if (!anio || !mes || !dia) return "";
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
};
