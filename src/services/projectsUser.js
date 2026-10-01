import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

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
    // Para elegir colaboradores; la respuesta es paginada ({ content: [...] })
    getStudentsForMentions: builder.query({
      query: () => ({
        url: "/students",
        params: { page: 0, size: 200 },
      }),
      transformResponse: (respuesta) => respuesta?.content ?? [],
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
  useGetStudentsForMentionsQuery,
} = projectUserApi;
