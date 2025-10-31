import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_KEY } from "../api/api";

export const publicationApi = createApi({
  reducerPath: "publicationApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["publications"],
  endpoints: (builder) => ({
    getPublications: builder.query({
      query: () => ({
        url: "/publication",
        providesTags: ["publications"],
      }),
    }),
  }),
});

export const { useGetPublicationsQuery } = publicationApi;



