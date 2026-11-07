// Catalogos de vacantes y postulaciones (enums del back). Se usan en empresa, reclutador y alumno.

// VacanteStatus. VENCIDA no se guarda: el back la calcula si la vacante PUBLICADA ya paso su fecha de cierre
export const ESTADOS_VACANTE = {
  BORRADOR: { label: "Borrador", clase: "bg-gray-100 text-gray-600 border-gray-200" },
  PUBLICADA: { label: "Publicada", clase: "bg-green-50 text-green-700 border-green-200" },
  PAUSADA: { label: "Pausada", clase: "bg-amber-50 text-amber-700 border-amber-200" },
  VENCIDA: { label: "Vencida", clase: "bg-orange-50 text-orange-700 border-orange-200" },
  CERRADA: { label: "Cerrada", clase: "bg-red-50 text-red-600 border-red-200" },
};

// TypeApplication
export const TIPOS_VACANTE = {
  EMPLEO: "Empleo",
  SERVICIO_SOCIAL: "Servicio social",
  INTEGRATIVA: "Integrativa",
  PRACTICA_PROFESIONAL: "Prácticas profesionales",
};

// WorkModality
export const MODALIDADES = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
};

// WorkingDay
export const JORNADAS = {
  MEDIO_TIEMPO: "Medio tiempo",
  TIEMPO_COMPLETO: "Tiempo completo",
};

// AplicationsStatus: ENVIADA -> EN_REVISION -> ENTREVISTA -> ACEPTADA; RECHAZADA (reclutador) y RETIRADA (alumno)
export const ESTADOS_POSTULACION = {
  ENVIADA: { label: "Enviada", clase: "bg-blue-50 text-blue-700 border-blue-200" },
  EN_REVISION: { label: "En revisión", clase: "bg-amber-50 text-amber-700 border-amber-200" },
  ENTREVISTA: { label: "Entrevista", clase: "bg-purple-50 text-purple-700 border-purple-200" },
  ACEPTADA: { label: "Aceptada", clase: "bg-green-50 text-green-700 border-green-200" },
  RECHAZADA: { label: "Rechazada", clase: "bg-red-50 text-red-600 border-red-200" },
  RETIRADA: { label: "Retirada", clase: "bg-gray-100 text-gray-500 border-gray-200" },
};

const pesos = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

// "$12,000 - $15,000 al mes" / "Desde $8,000" / null si no hay salario
export const formatearSalario = (min, max) => {
  if (min && max) return min === max ? pesos(min) : `${pesos(min)} - ${pesos(max)}`;
  if (min) return `Desde ${pesos(min)}`;
  if (max) return `Hasta ${pesos(max)}`;
  return null;
};
