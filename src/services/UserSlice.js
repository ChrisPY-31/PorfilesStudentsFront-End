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

    getCompanies: builder.query({
      query: ({ userToken }) => ({
        url: "/company",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }),
    }),
    createEducationUser: builder.mutation({
      query: ({ newEducationUser, token }) => ({
        url: `/education`,
        method: "POST",
        body: newEducationUser,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        invalidatesTags: ["userById"],
      }),
    }),
    updateEducationUser: builder.mutation({
      query: ({ updateEducation, token }) => ({
        url: `education/${updateEducation.idEducacion}`,
        method: "PUT",
        body: updateEducation,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        invalidatesTags: ["userById"],
      }),
    }),
    deleteEducationUser: builder.mutation({
      query: ({ idEducacion, token }) => ({
        url: `educationUser/${idEducacion}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    createSocialLink: builder.mutation({
      query: ({ newSocialLink, token }) => ({
        url: "/saveContact",
        method: "POST",
        body: newSocialLink,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        providesTags: ["userById"],
      }),
    }),
    createSkills: builder.mutation({
      query: ({ skillsList, token }) => ({
        url: "/language",
        method: "POST",
        body: skillsList,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updatePasswordUser: builder.mutation({
      query: ({ username, newPassword, token }) => ({
        url: `/${username}/${newPassword}`,
        method: "PUT",
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
  useGetCompaniesQuery,
  useGetAccountUserByUsernameQuery,
  useCreateEducationUserMutation,
  useCreateSocialLinkMutation,
  useUpdateEducationUserMutation,
  useDeleteEducationUserMutation,
  useCreateSkillsMutation,
  useUpdatePasswordUserMutation,
} = userSlice;
