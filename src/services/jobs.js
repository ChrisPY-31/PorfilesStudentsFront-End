import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Vacantes publicas (sin login): solo las PUBLICADAS de convenios vigentes.
// GET /jobs es paginado (Page<PostJobDto>: { content, totalElements, totalPages, number, last, ... }),
// de la mas reciente a la mas antigua
export const jobsApi = createApi({
  reducerPath: "jobsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  endpoints: (builder) => ({
    // filtros opcionales: q, tipo, jornada, modalidad, idCarrera, idTecnologia, idCorporacion, page, size.
    // Los vacios no se mandan
    getJobs: builder.query({
      query: (filtros = {}) => ({
        url: "/jobs",
        params: Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== "" && v !== null && v !== undefined)),
      }),
    }),
    // 404 si no esta visible (borrador, pausada, cerrada, vencida o convenio no vigente)
    getJob: builder.query({
      query: (idVacante) => ({ url: `/jobs/${idVacante}` }),
    }),
  }),
});

export const { useGetJobsQuery, useGetJobQuery } = jobsApi;
