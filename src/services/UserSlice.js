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
    tagTypes: ["userById"],
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
    updateEducationUser : builder.mutation({
      query : ({updateEducation , token}) =>({
        url : `education/${updateEducation.idEducacion}`,
        method: "PUT",
        body: updateEducation,
        headers: {
          Authorization: `Bearer ${token}`
        },
        invalidatesTags: ["userById"],
      })
    }),
    createSocialLink: builder.mutation({
      query: ({ newSocialLink, token }) => ({
        url: "/saveContact",
        method: "POST",
        body: newSocialLink,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        providesTags:["userById"]
      }),
    }),
    createSkills : builder.mutation({
      query: ({skillsList, token}) =>({
        url : "/language",
        method :"POST",
        body: skillsList,
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
    })
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetAccountUserByUsernameQuery,
  useCreateEducationUserMutation,
  useCreateSocialLinkMutation,
  useUpdateEducationUserMutation,
  useCreateSkillsMutation
} = userSlice;
