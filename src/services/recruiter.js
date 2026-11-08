import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Endpoints del reclutador (RECRUITER): el dueno sale del JWT.
// Vacante (PostJobDto): { idVacante, titulo, descripcion, ubicacion, jornada, modalidad, tipo, salarioMin, salarioMax,
//   estado, fechaPublicacion, fechaCierre, creada, actualizada, carreras, tecnologias, empresa, reclutador }
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const recruiterApi = createApi({
  reducerPath: "recruiterApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["MisVacantes"],
  endpoints: (builder) => ({
    // Se piden todas y se filtran en el front (asi salen los contadores por estado)
    getMyJobs: builder.query({
      query: ({ token }) => ({ url: "/recruiter/me/jobs", headers: auth(token) }),
      providesTags: ["MisVacantes"],
    }),
    // PostJobRequest: { titulo, descripcion, ubicacion, jornada, modalidad, tipo, salarioMin, salarioMax,
    //   fechaCierre (yyyy-MM-dd, hoy o despues), idsCarreras, idsTecnologias (max 15) }. Nace en BORRADOR.
    // Responde { mensaje, object: PostJobDto }
    createMyJob: builder.mutation({
      query: ({ vacante, token }) => ({
        url: "/recruiter/me/jobs",
        method: "POST",
        body: vacante,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisVacantes"]),
    }),
    // Reemplaza todos los campos. Una publicada/pausada no puede quedar incompleta; una cerrada no se edita
    updateMyJob: builder.mutation({
      query: ({ id, vacante, token }) => ({
        url: `/recruiter/me/jobs/${id}`,
        method: "PUT",
        body: vacante,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisVacantes"]),
    }),
    // estado destino: PUBLICADA (publicar o reanudar), PAUSADA o CERRADA (definitivo)
    changeMyJobStatus: builder.mutation({
      query: ({ id, estado, token }) => ({
        url: `/recruiter/me/jobs/${id}/status`,
        method: "PATCH",
        params: { estado },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisVacantes"]),
    }),
    // Solo borradores; una vacante publicada se cierra en su lugar
    deleteMyJob: builder.mutation({
      query: ({ id, token }) => ({
        url: `/recruiter/me/jobs/${id}`,
        method: "DELETE",
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["MisVacantes"]),
    }),
  }),
});

export const {
  useGetMyJobsQuery,
  useCreateMyJobMutation,
  useUpdateMyJobMutation,
  useChangeMyJobStatusMutation,
  useDeleteMyJobMutation,
} = recruiterApi;
