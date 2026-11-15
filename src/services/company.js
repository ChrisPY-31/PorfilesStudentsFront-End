import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";
import { POR_PAGINA, limpiarParams } from "../helpers/paginacion";

// Perfil de empresa (CompanyProfileDto):
// { idCorporacion, nombreEmpresa, categoria, descripcion, logo, banner, sitioWeb,
//   sector, tamano, ubicacion, correoContacto, actualizado }
// nombreEmpresa y categoria vienen del convenio (solo los edita el ADMIN).
// Los GET regresan el perfil directo; PUT y PATCH lo regresan dentro de { mensaje, object }.
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const companyApi = createApi({
  reducerPath: "companyApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["MisDatosEmpresa", "MiEmpresa", "Empresas", "Reclutadores", "VacantesEmpresa", "PostulacionesEmpresa"],
  endpoints: (builder) => ({
    // Solo COMPANY_ADMIN: la empresa sale del JWT. La primera vez el back crea el perfil vacio
    getMyCompanyProfile: builder.query({
      query: ({ token }) => ({ url: "/company-admin/me/profile", headers: auth(token) }),
      providesTags: ["MiEmpresa"],
    }),
    // Publico: solo convenios vigentes, ordenados por nombre. Un convenio sin perfil sale con nombre y categoria
    // (logo, banner, etc. en null). Tag "Empresas" sin id para que editar cualquier empresa/convenio la refresque
    // Publico, paginado (Page de Spring): convenios vigentes por nombre. q opcional (empresa o categoria)
    getCompanies: builder.query({
      query: ({ page = 0, size = POR_PAGINA, q } = {}) => ({ url: "/companies", params: limpiarParams({ page, size, q: q?.trim() }) }),
      providesTags: ["Empresas"],
    }),
    // Publico: un convenio desactivado o vencido responde 404
    getCompanyProfile: builder.query({
      query: (idCorporacion) => ({ url: `/companies/${idCorporacion}` }),
      providesTags: (_res, _err, id) => [{ type: "Empresas", id }],
    }),
    // Reemplaza todos los campos: uno vacio o null se borra
    updateMyCompanyProfile: builder.mutation({
      query: ({ perfil, token }) => ({
        url: "/company-admin/me/profile",
        method: "PUT",
        body: perfil,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MiEmpresa", "Empresas"]),
    }),
    // tipo: "logo" | "banner"; formData con el campo "image"
    uploadMyCompanyImage: builder.mutation({
      query: ({ tipo, formData, token }) => ({
        url: `/company-admin/me/profile/${tipo}`,
        method: "PATCH",
        body: formData,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MiEmpresa", "Empresas"]),
    }),
    // --- Datos de la persona encargada de la cuenta (solo COMPANY_ADMIN) ---
    // CompanyAdminDto: PersonDto + { idCorporacion, puesto, username, email, cuentaActiva, empresa }
    getMyCompanyAdmin: builder.query({
      query: ({ token }) => ({ url: "/company-admin/me", headers: auth(token) }),
      providesTags: ["MisDatosEmpresa"],
    }),
    // { nombre, apellido, puesto, descripcion }: reemplaza todo (puesto/descripcion null se borran)
    updateMyCompanyAdmin: builder.mutation({
      query: ({ datos, token }) => ({
        url: "/company-admin/me",
        method: "PUT",
        body: datos,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisDatosEmpresa"]),
    }),
    // --- Reclutadores de mi empresa (solo COMPANY_ADMIN) ---
    // RecruiterAccountDto: { id, idCorporacion, username, email, nombre, apellido, puesto, cuentaActiva }
    getMyRecruiters: builder.query({
      query: ({ token }) => ({ url: "/company-admin/me/recruiters", headers: auth(token) }),
      providesTags: ["Reclutadores"],
    }),
    // { username, email, nombre, apellido, puesto }; la contrasena la genera el back y la manda por correo
    createRecruiter: builder.mutation({
      query: ({ reclutador, token }) => ({
        url: "/company-admin/me/recruiters",
        method: "POST",
        body: reclutador,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Reclutadores"]),
    }),
    changeRecruiterStatus: builder.mutation({
      query: ({ id, activo, token }) => ({
        url: `/company-admin/me/recruiters/${id}/status`,
        method: "PATCH",
        params: { activo },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Reclutadores"]),
    }),
    // Genera una contrasena nueva y la manda al correo del reclutador
    resetRecruiterPassword: builder.mutation({
      query: ({ id, token }) => ({
        url: `/company-admin/me/recruiters/${id}/reset-password`,
        method: "POST",
        headers: auth(token),
      }),
    }),
    // --- Vacantes y postulaciones de toda la empresa (solo COMPANY_ADMIN) ---
    // Paginado (Page de Spring), de la mas reciente a la mas antigua. Filtros opcionales: estado, idReclutador,
    // q (titulo, descripcion o ubicacion) y tipo
    getCompanyJobs: builder.query({
      query: ({ token, page = 0, size = POR_PAGINA, estado, idReclutador, q, tipo }) => ({
        url: "/company-admin/me/jobs",
        params: limpiarParams({ page, size, estado, idReclutador, q: q?.trim(), tipo }),
        headers: auth(token),
      }),
      providesTags: ["VacantesEmpresa"],
    }),
    // Numeros de las pestanas (con idReclutador, solo las de ese reclutador)
    getCompanyJobsSummary: builder.query({
      query: ({ token, idReclutador }) => ({
        url: "/company-admin/me/jobs/summary",
        params: limpiarParams({ idReclutador }),
        headers: auth(token),
      }),
      providesTags: ["VacantesEmpresa"],
    }),
    // estado: PUBLICADA (reanudar), PAUSADA o CERRADA. Cerrar rechaza las postulaciones abiertas
    changeCompanyJobStatus: builder.mutation({
      query: ({ id, estado, token }) => ({
        url: `/company-admin/me/jobs/${id}/status`,
        method: "PATCH",
        params: { estado },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["VacantesEmpresa", "PostulacionesEmpresa"]),
    }),
    // Solo lectura: el estado de una postulacion lo cambia el reclutador
    // Paginado, de la mas reciente a la mas antigua. Filtros opcionales: idVacante, estado y q (alumno, carrera o vacante)
    getCompanyApplications: builder.query({
      query: ({ token, page = 0, size = POR_PAGINA, idVacante, estado, q }) => ({
        url: "/company-admin/me/applications",
        params: limpiarParams({ page, size, idVacante, estado, q: q?.trim() }),
        headers: auth(token),
      }),
      providesTags: ["PostulacionesEmpresa"],
    }),
    // Numeros de las pestanas: { total, porEstado } (con idVacante, solo los de esa vacante)
    getCompanyApplicationsSummary: builder.query({
      query: ({ token, idVacante }) => ({
        url: "/company-admin/me/applications/summary",
        params: limpiarParams({ idVacante }),
        headers: auth(token),
      }),
      providesTags: ["PostulacionesEmpresa"],
    }),
    // Selector de vacante: [{ idVacante, titulo, estado }] sin borradores ni paginar
    getCompanyJobOptions: builder.query({
      query: ({ token }) => ({ url: "/company-admin/me/jobs/options", headers: auth(token) }),
      providesTags: ["VacantesEmpresa"],
    }),
  }),
});

export const {
  useGetMyCompanyProfileQuery,
  useGetCompaniesQuery,
  useGetCompanyProfileQuery,
  useUpdateMyCompanyProfileMutation,
  useUploadMyCompanyImageMutation,
  useGetMyCompanyAdminQuery,
  useUpdateMyCompanyAdminMutation,
  useGetMyRecruitersQuery,
  useCreateRecruiterMutation,
  useChangeRecruiterStatusMutation,
  useResetRecruiterPasswordMutation,
  useGetCompanyJobsQuery,
  useGetCompanyJobsSummaryQuery,
  useChangeCompanyJobStatusMutation,
  useGetCompanyApplicationsQuery,
  useGetCompanyApplicationsSummaryQuery,
  useGetCompanyJobOptionsQuery,
} = companyApi;
