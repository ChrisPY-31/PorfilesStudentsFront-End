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
    }),
    // Solo ADMIN. El jwt de la respuesta es del usuario creado: NO reemplazar la sesion del admin
    createUser: builder.mutation({
      query: ({ user, person, token }) => ({
        url: `auth/sign-up`,
        method: "POST",
        body: {
          user,
          person,
        },
        headers: {
          Authorization: `Bearer ${token}`,
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
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useCreateUserMutation,
  useLoginUserMutation,
  useGetloginAdminQuery,
} = usersApiSlice;
