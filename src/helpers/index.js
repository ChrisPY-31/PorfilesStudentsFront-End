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
