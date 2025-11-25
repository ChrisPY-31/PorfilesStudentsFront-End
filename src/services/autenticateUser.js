import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiServer } from "../api/api";

// Define a service using a base URL and expected endpoints
export const usersApiSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${apiServer}` }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getloginAdmin: builder.query({
      query: (token) => ({
        url: "api/v1/manager",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      // Agrega transformResponse para debuggear
      transformResponse: (response, meta) => {
        console.log("Respuesta completa del backend:", response);
        console.log("Meta info:", meta);
        return response;
      },
      transformErrorResponse: (response, meta) => {
        console.log("Error completo:", response);
        console.log("Meta error:", meta);
        return response;
      },
    }),
    createUser: builder.mutation({
      query: ({ user, person }) => ({
        url: `auth/sign-up`,
        method: "POST",
        body: {
          user,
          person,
        },
      }),
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "auth/log-in",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message,
      }),
    }),
    userBlocked: builder.mutation({
      query: ({ userToken, userId }) => ({
        url: `/api/v1/user-blocked/${userId}`,
        method:"POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateUserMutation,
  useLoginUserMutation,
  useGetloginAdminQuery,
  useUserBlockedMutation,
} = usersApiSlice;
