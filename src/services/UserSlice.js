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
    getUserById: builder.query({
      query: ({id, token}) => ({
        url: `/person/${id}`,
        headers: {
          'Authorization': `Bearer ${token}`, // Solo el token, sin "Bearer"
        },
      }),
    }),
  }),
});

export const { useGetAllUsersQuery, useGetUserByIdQuery } = userSlice;
