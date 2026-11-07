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
  tagTypes: ["MiEmpresa", "Empresas", "Reclutadores"],
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
  }),
});

export const {
  useGetMyCompanyProfileQuery,
  useGetCompanyProfileQuery,
  useUpdateMyCompanyProfileMutation,
  useUploadMyCompanyImageMutation,
  useGetMyRecruitersQuery,
  useCreateRecruiterMutation,
  useChangeRecruiterStatusMutation,
  useResetRecruiterPasswordMutation,
} = companyApi;
