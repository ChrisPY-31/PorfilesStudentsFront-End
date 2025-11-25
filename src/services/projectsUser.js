import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

export const projectUserApi = createApi({
  reducerPath: "projectUserApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  endpoints: (builder) => ({
    createProject: builder.mutation({
      query: ({ token, newProyect }) => ({
        url: "projects",
        method: "POST",
        body: newProyect,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateProjectStudent: builder.mutation({
      query: ({ token, updatedProject }) => ({
        url: "projects",
        method: "PUT",
        body: updatedProject,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteProjectStudent: builder.mutation({
      query: ({ userToken, idProject }) => ({
        url: `projects/${idProject}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }),
    }),

    createTechnology: builder.mutation({
      query: ({ token, tecnologias }) => ({
        url: "/technology",
        method: "POST",
        body: tecnologias,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    updateTechnology: builder.mutation({
      query: ({ token, updateTechnologyUser }) => ({
        url: "/technology",
        method: "PUT",
        body: updateTechnologyUser,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    loadedPhotoProject: builder.mutation({
      query: ({ idProyecto, formData, token }) => ({
        url: `/fileProjects/${idProyecto}`,
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useUpdateProjectStudentMutation,
  useDeleteProjectStudentMutation,
  useCreateTechnologyMutation,
  useUpdateTechnologyMutation,
  useLoadedPhotoProjectMutation,
} = projectUserApi;
