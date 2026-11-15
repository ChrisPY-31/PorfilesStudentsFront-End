// Tamano de pagina para todas las consultas paginadas (el back acepta size de 1 a 50)
export const POR_PAGINA = 20;

// Quita los filtros vacios para no mandar "q=" ni "estado=" al back
export const limpiarParams = (params) => Object.fromEntries(
  Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
);

// Lee una respuesta Page de Spring con valores seguros
export const leerPagina = (res) => ({
  items: res?.content ?? [],
  total: res?.totalElements ?? 0,
  totalPaginas: res?.totalPages ?? 0,
  pagina: res?.number ?? 0,
});
