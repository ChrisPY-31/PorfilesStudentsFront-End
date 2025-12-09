import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
    createPublication: builder.mutation({
      query: ({ formData, token }) => ({
        url: "/publication",
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["publications"],
    }),
    fileUpload: builder.mutation({
      query: ({ image, id }) => ({
        url: `filePublication/${id}`,
        method: "POST",
        params: { image: image },
      }),
    }),
    interactionPublication: builder.mutation({
      query: ({ userToken, interaction }) => ({
        url: `/interactionPublicacion`,
        method: "POST",
        body: interaction,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }),
      invalidatesTags: ["publications"],
    }),
  }),
});

export const {
  useGetPublicationsQuery,
  useCreatePublicationMutation,
  useFileUploadMutation,
  useInteractionPublicationMutation,
} = publicationApi;
