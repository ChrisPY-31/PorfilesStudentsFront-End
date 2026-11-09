import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Endpoints del reclutador (RECRUITER): el dueno sale del JWT.
// Vacante (PostJobDto): { idVacante, titulo, descripcion, ubicacion, jornada, modalidad, tipo, salarioMin, salarioMax,
//   estado, fechaPublicacion, fechaCierre, creada, actualizada, carreras, tecnologias, empresa, reclutador }
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const recruiterApi = createApi({
  reducerPath: "recruiterApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["MisVacantes", "Postulantes"],
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
      // Cerrar rechaza las postulaciones abiertas, por eso tambien se refrescan los postulantes
      invalidatesTags: (_res, error, { id }) => (error ? [] : ["MisVacantes", { type: "Postulantes", id }]),
    }),
    // Postulantes de una vacante mia (JobApplicationDto: { idPostulacion, estado, mensaje, curriculum,
    //   fechaPostulacion, actualizada, vacante, estudiante: { id, nombre, apellido, imagen, carrera, semestre } })
    getJobApplicants: builder.query({
      query: ({ idVacante, token }) => ({ url: `/recruiter/me/jobs/${idVacante}/applications`, headers: auth(token) }),
      providesTags: (_res, _err, { idVacante }) => [{ type: "Postulantes", id: idVacante }],
    }),
    // estado: EN_REVISION, ENTREVISTA, ACEPTADA (solo hacia adelante, se puede saltar) o RECHAZADA.
    // ACEPTADA, RECHAZADA y RETIRADA son finales. El back notifica al alumno
    changeApplicationStatus: builder.mutation({
      query: ({ idPostulacion, estado, token }) => ({
        url: `/recruiter/me/applications/${idPostulacion}/status`,
        method: "PATCH",
        params: { estado },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error, { idVacante }) => (error ? [] : [{ type: "Postulantes", id: idVacante }]),
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
  useGetJobApplicantsQuery,
  useChangeApplicationStatusMutation,
} = recruiterApi;
