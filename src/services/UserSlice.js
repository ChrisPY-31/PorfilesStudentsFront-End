import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

export const userSlice = createApi({
  reducerPath: "userSlice",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: "/students",
        providesTags: ["Users"],
      }),
    }),
    getTeachers: builder.query({
      query: () => ({
        url: "/teachers",
      }),
    }),
    tagTypes: ["userById"],
    getUsersAdmin: builder.query({
      query: ({ token }) => ({
        url: "/users",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getUserById: builder.query({
      query: ({ id, token }) => ({
        url: `/person/${id}`,
        headers: {
          Authorization: `Bearer ${token}`, // Solo el token, sin "Bearer"
        },
      }),
    }),
    transformResponse: (response, meta) => {
      console.log("Respuesta completa del backend:", response);
      console.log("Meta info:", meta);
      return response;
    },
    getAccountUserByUsername: builder.query({
      query: ({ username, token }) => ({
        url: `/userAccount/${username}`,
        headers: {
          Authorization: `Bearer ${token}`, // Solo el token, sin "Bearer"
        },
      }),
    }),

    getCareers: builder.query({
      query: ({ token }) => ({
        url: "/career",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getUbications: builder.query({
      query: ({ token }) => ({
        url: "/ubication",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getContactTypes: builder.query({
      query: ({ token }) => ({
        url: "/contact",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Educacion: institucion, grado, educacionTipo y fechaInicio son obligatorios
    createEducationUser: builder.mutation({
      query: ({ educacion, token }) => ({
        url: "/education",
        method: "POST",
        body: educacion,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateEducationUser: builder.mutation({
      query: ({ educacion, token }) => ({
        url: `/education/${educacion.idEducacion}`,
        method: "PUT",
        body: educacion,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteEducationUser: builder.mutation({
      query: ({ idEducacion, token }) => ({
        url: `/education/${idEducacion}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    createSocialLink: builder.mutation({
      query: ({ newSocialLink, token }) => ({
        url: "/personContact",
        method: "POST",
        body: newSocialLink,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        providesTags: ["userById"],
      }),
    }),
    deleteSocialLink: builder.mutation({
      query: ({ idContact, token }) => ({
        url: `/personContact/${idContact}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Catalogo de tecnologias + aptitudes: [{ id, nombre, tipo: "TECNOLOGIA" | "APTITUD" }]
    getSkillsCatalog: builder.query({
      query: ({ token }) => ({
        url: "/skills/catalog",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Reemplaza todas las habilidades del usuario autenticado: { tecnologias: [ids], aptitudes: [ids] }
    updateMySkills: builder.mutation({
      query: ({ skills, token }) => ({
        url: "/person/skills",
        method: "PUT",
        body: skills,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Idiomas del usuario autenticado; el dueno se resuelve por JWT
    createLanguages: builder.mutation({
      query: ({ idiomas, token }) => ({
        url: "/language",
        method: "POST",
        body: idiomas,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateLanguage: builder.mutation({
      query: ({ idioma, token }) => ({
        url: `/language/${idioma.idIdioma}`,
        method: "PUT",
        body: idioma,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteLanguage: builder.mutation({
      query: ({ idIdioma, token }) => ({
        url: `/language/${idIdioma}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    changePasswordUser: builder.mutation({
      query: ({ currentPassword, newPassword, token }) => ({
        url: "/users/password",
        method: "PUT",
        body: { currentPassword, newPassword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    resetPasswordUser: builder.mutation({
      query: ({ username, newPassword, token }) => ({
        url: `/users/${username}/password/reset`,
        method: "PUT",
        body: { newPassword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetTeachersQuery,
  useGetUsersAdminQuery,
  useGetUserByIdQuery,
  useGetCareersQuery,
  useGetUbicationsQuery,
  useGetContactTypesQuery,
  useGetAccountUserByUsernameQuery,
  useCreateEducationUserMutation,
  useCreateSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useUpdateEducationUserMutation,
  useDeleteEducationUserMutation,
  useGetSkillsCatalogQuery,
  useUpdateMySkillsMutation,
  useCreateLanguagesMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
  useChangePasswordUserMutation,
  useResetPasswordUserMutation,
} = userSlice;
