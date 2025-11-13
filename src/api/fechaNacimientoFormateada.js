import { IoCallOutline, IoGlobeOutline, IoLogoLinkedin, IoMailOutline } from "react-icons/io5";

export const fechaNacimientoFormateada = (fechaNacimiento) => {
  let fechaNacimientoFormateada = "";
  if (fechaNacimiento) {
    if (values.fechaNacimiento instanceof Date) {
      fechaNacimientoFormateada = values.fechaNacimiento
        .toISOString()
        .split("T")[0];
    } else if (typeof values.fechaNacimiento === "string") {
      fechaNacimientoFormateada = values.fechaNacimiento;
    }
  }
  return fechaNacimientoFormateada;
};


