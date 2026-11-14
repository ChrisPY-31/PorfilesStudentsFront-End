import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Perfil institucional (InstitutionProfileDto), compartido por todas las cuentas ADMIN:
// { nombre, descripcion, logo, banner, sitioWeb, ubicacion, correoContacto, actualizado }
// Es con lo que el admin aparece en el feed (nombre y logo).
// GET es publico y regresa el perfil directo; PUT y PATCH lo regresan dentro de { mensaje, object }.
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const institutionApi = createApi({
  reducerPath: "institutionApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Institucion"],
  endpoints: (builder) => ({
    // Publico, sin login
    getInstitution: builder.query({
      query: () => ({ url: "/institution" }),
      providesTags: ["Institucion"],
    }),
    // Solo ADMIN. { nombre (obligatorio, max 150), descripcion (max 3000), sitioWeb (URL),
    // ubicacion, correoContacto (email) }. Reemplaza todo: un opcional vacio o null se borra
    updateInstitution: builder.mutation({
      query: ({ perfil, token }) => ({
        url: "/institution",
        method: "PUT",
        body: perfil,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Institucion"]),
    }),
    // Solo ADMIN. tipo: "logo" | "banner"; formData con el campo "image" (jpg, jpeg, png, webp, avif)
    uploadInstitutionImage: builder.mutation({
      query: ({ tipo, formData, token }) => ({
        url: `/institution/${tipo}`,
        method: "PATCH",
        body: formData,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Institucion"]),
    }),
  }),
});

export const {
  useGetInstitutionQuery,
  useUpdateInstitutionMutation,
  useUploadInstitutionImageMutation,
} = institutionApi;
