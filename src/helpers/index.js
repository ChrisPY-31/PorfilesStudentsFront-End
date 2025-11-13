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


export const formatearRedContactos = (nombre) =>{
  let contactoFormateado = {
    LINKEDIN: "Tu perfil",
    PHONE : "Telefono",
    EMAIL: "Enviar email",
    WEB:"Sitio web"
  }
  return contactoFormateado[nombre]
}