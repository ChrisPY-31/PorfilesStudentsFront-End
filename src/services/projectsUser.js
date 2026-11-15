import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";
import { POR_PAGINA, limpiarParams } from "../helpers/paginacion";

export const projectUserApi = createApi({
  reducerPath: "projectUserApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  endpoints: (builder) => ({
    // Proyectos de todos los estudiantes (requiere token)
    getAllProjects: builder.query({
      query: ({ token }) => ({
        url: "/projects",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (respuesta) => (Array.isArray(respuesta) ? respuesta : respuesta?.object ?? []),
    }),
    // El idEstudiante lo toma el back del token; tecnologias y menciones deben ser ids existentes
    createProject: builder.mutation({
      query: ({ token, proyecto }) => ({
        url: "/projects",
        method: "POST",
        body: proyecto,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // El body debe traer idProject
    updateProjectStudent: builder.mutation({
      query: ({ token, proyecto }) => ({
        url: "/projects",
        method: "PUT",
        body: proyecto,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteProjectStudent: builder.mutation({
      query: ({ token, idProject }) => ({
        url: `/projects/${idProject}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    uploadProjectImage: builder.mutation({
      query: ({ idProject, formData, token }) => ({
        url: `/fileProjects/${idProject}`,
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Catalogo: [{ idTecnologia, nombre }]
    getTechnologies: builder.query({
      query: () => ({
        url: "/technology",
      }),
    }),
    // GET /students paginado (Page de Spring, size 1..50), publico. Filtros opcionales del back: q (palabras en nombre
    // o apellido, sin acentos), idCarrera, semestre, idUbicacion, tecnologias (debe tener todas), conProyectos,
    // recomendados y orden (recientes | nombre | recomendaciones)
    getStudents: builder.query({
      query: ({ page = 0, size = POR_PAGINA, q, idCarrera, semestre, idUbicacion, tecnologias, conProyectos, recomendados, orden } = {}) => ({
        url: "/students",
        params: limpiarParams({
          page, size, q: q?.trim(), idCarrera, semestre, idUbicacion,
          tecnologias: tecnologias?.length ? tecnologias.join(",") : undefined,
          conProyectos: conProyectos || undefined,
          recomendados: recomendados || undefined,
          orden: orden === "recientes" ? undefined : orden,
        }),
      }),
    }),
  }),
});

export const {
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectStudentMutation,
  useDeleteProjectStudentMutation,
  useUploadProjectImageMutation,
  useGetTechnologiesQuery,
  useGetStudentsQuery,
} = projectUserApi;
