import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Postulaciones del alumno (STUDENT). JobApplicationDto: { idPostulacion, estado, mensaje, curriculum,
//   fechaPostulacion, actualizada, vacante: { idVacante, titulo, estado, empresa }, estudiante }
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["MisPostulaciones"],
  endpoints: (builder) => ({
    getMyApplications: builder.query({
      query: ({ token }) => ({ url: "/student/me/applications", headers: auth(token) }),
      providesTags: ["MisPostulaciones"],
    }),
    // Solo se envia el CV (se copia del perfil; el back acepta un { mensaje } opcional que no usamos): sin CV el back responde 400.
    // Una sola postulacion por vacante (aunque se haya retirado). Responde { mensaje, object: JobApplicationDto }
    applyToJob: builder.mutation({
      query: ({ idVacante, mensaje, token }) => ({
        url: `/jobs/${idVacante}/apply`,
        method: "POST",
        body: { mensaje: mensaje || null },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisPostulaciones"]),
    }),
    // Solo si sigue abierta (ENVIADA, EN_REVISION o ENTREVISTA). Queda RETIRADA y ya no se puede volver a postular
    withdrawApplication: builder.mutation({
      query: ({ idPostulacion, token }) => ({
        url: `/student/me/applications/${idPostulacion}/withdraw`,
        method: "PATCH",
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisPostulaciones"]),
    }),
  }),
});

export const { useGetMyApplicationsQuery, useApplyToJobMutation, useWithdrawApplicationMutation } = studentApi;
