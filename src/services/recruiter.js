import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";
import { POR_PAGINA, limpiarParams } from "../helpers/paginacion";

// Endpoints del reclutador (RECRUITER): el dueno sale del JWT.
// Vacante (PostJobDto): { idVacante, titulo, descripcion, ubicacion, jornada, modalidad, tipo, salarioMin, salarioMax,
//   estado, fechaPublicacion, fechaCierre, creada, actualizada, carreras, tecnologias, empresa, reclutador }
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const recruiterApi = createApi({
  reducerPath: "recruiterApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["MisVacantes", "Postulantes"],
  endpoints: (builder) => ({
    // Paginado (Page de Spring), de la mas reciente a la mas antigua. Filtros opcionales: estado (incluye VENCIDA),
    // q (titulo, descripcion o ubicacion) y tipo
    getMyJobs: builder.query({
      query: ({ token, page = 0, size = POR_PAGINA, estado, q, tipo }) => ({
        url: "/recruiter/me/jobs",
        params: limpiarParams({ page, size, estado, q: q?.trim(), tipo }),
        headers: auth(token),
      }),
      providesTags: ["MisVacantes"],
    }),
    // Numeros de las pestanas: { total, porEstado: { BORRADOR, PUBLICADA, PAUSADA, VENCIDA, CERRADA } }
    getMyJobsSummary: builder.query({
      query: ({ token }) => ({ url: "/recruiter/me/jobs/summary", headers: auth(token) }),
      providesTags: ["MisVacantes"],
    }),
    // Selector de vacante: [{ idVacante, titulo, estado }] sin borradores ni paginar, de la mas reciente a la mas antigua
    getMyJobOptions: builder.query({
      query: ({ token }) => ({ url: "/recruiter/me/jobs/options", headers: auth(token) }),
      providesTags: ["MisVacantes"],
    }),
    // Detalle de una vacante propia (404 si es de otro reclutador)
    getMyJob: builder.query({
      query: ({ id, token }) => ({ url: `/recruiter/me/jobs/${id}`, headers: auth(token) }),
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
    // Paginado, de la mas reciente a la mas antigua. Filtros opcionales: estado y q (alumno, carrera o vacante)
    getJobApplicants: builder.query({
      query: ({ idVacante, token, page = 0, size = POR_PAGINA, estado, q }) => ({
        url: `/recruiter/me/jobs/${idVacante}/applications`,
        params: limpiarParams({ page, size, estado, q: q?.trim() }),
        headers: auth(token),
      }),
      providesTags: (_res, _err, { idVacante }) => [{ type: "Postulantes", id: idVacante }],
    }),
    // Numeros de las pestanas: { total, porEstado }
    getJobApplicantsSummary: builder.query({
      query: ({ idVacante, token }) => ({ url: `/recruiter/me/jobs/${idVacante}/applications/summary`, headers: auth(token) }),
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
  useGetMyJobQuery,
  useGetMyJobsSummaryQuery,
  useGetMyJobOptionsQuery,
  useCreateMyJobMutation,
  useUpdateMyJobMutation,
  useChangeMyJobStatusMutation,
  useDeleteMyJobMutation,
  useGetJobApplicantsQuery,
  useGetJobApplicantsSummaryQuery,
  useChangeApplicationStatusMutation,
} = recruiterApi;
