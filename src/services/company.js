import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

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
    // Se piden completas y se filtran en el front (asi salen los contadores por estado)
    getCompanyJobs: builder.query({
      query: ({ token }) => ({ url: "/company-admin/me/jobs", headers: auth(token) }),
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
    getCompanyApplications: builder.query({
      query: ({ token }) => ({ url: "/company-admin/me/applications", headers: auth(token) }),
      providesTags: ["PostulacionesEmpresa"],
    }),
  }),
});

export const {
  useGetMyCompanyProfileQuery,
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
  useChangeCompanyJobStatusMutation,
  useGetCompanyApplicationsQuery,
} = companyApi;
