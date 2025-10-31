import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiServer } from "../api/api";

// Define a service using a base URL and expected endpoints
export const usersApiSlice = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${apiServer}` }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (newUser) => ({
        url: `auth/sign-up`,
        method: "POST",
        body: newUser,
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
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useCreateUserMutation, useLoginUserMutation } = usersApiSlice;
