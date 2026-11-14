import { hoyISO } from "./vacantes";

// Dias antes del fin para avisar que un convenio vence pronto
export const DIAS_AVISO_VENCIMIENTO = 30;

// Estado mostrado de un convenio. El back solo da activo y vigente; aqui se distingue por que no esta vigente.
// Orden de prioridad: inactivo > por iniciar > vencido > vigente
export const ESTADOS_CONVENIO = {
  VIGENTE: { etiqueta: "Vigente", color: "bg-green-50 text-green-700 border-green-200" },
  POR_INICIAR: { etiqueta: "Por iniciar", color: "bg-blue-50 text-blue-700 border-blue-200" },
  VENCIDO: { etiqueta: "Vencido", color: "bg-amber-50 text-amber-700 border-amber-200" },
  INACTIVO: { etiqueta: "Inactivo", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

// Fechas del back como yyyy-MM-dd: se comparan como texto (sin zona horaria)
export const estadoConvenio = (c) => {
  const hoy = hoyISO();
  if (!c.activo) return "INACTIVO";
  if (c.fechaInicio && c.fechaInicio > hoy) return "POR_INICIAR";
  if (c.fechaFinal && c.fechaFinal < hoy) return "VENCIDO";
  return "VIGENTE";
};

// Dias que faltan para fechaFinal (0 = vence hoy); null si no tiene fecha de termino
export const diasParaVencer = (c) => {
  if (!c.fechaFinal) return null;
  const [a, m, d] = c.fechaFinal.split("-").map(Number);
  const [ha, hm, hd] = hoyISO().split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ha, hm - 1, hd)) / 86400000);
};

// Vigente y con fin dentro de los proximos DIAS_AVISO_VENCIMIENTO dias
export const vencePronto = (c) => {
  const dias = diasParaVencer(c);
  return estadoConvenio(c) === "VIGENTE" && dias !== null && dias <= DIAS_AVISO_VENCIMIENTO;
};

// "2019-12-11" -> "11 dic 2019". Se arma en hora local: new Date("2019-12-11") seria UTC y en Mexico saldria un dia antes
export const formatearFechaCorta = (iso) => {
  if (!iso) return "";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};
