import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

export const updatePersonApi = createApi({
  reducerPath: "updatePersonApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  endpoints: (builder) => ({
    updateMyAccount: builder.mutation({
      query: ({ updatePerson, token, tipo, userId }) => ({
        url: `/${tipo}/${userId}`,
        method: "PUT",
        body: updatePerson,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateMyPhoto: builder.mutation({
      // El back identifica al dueno por el JWT (STUDENT, TEACHER o RECRUITER)
      query: ({ formData, token }) => {
        return {
          url: `/person/me/image`,
          method: "PATCH",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),
  }),
});

export const { useUpdateMyAccountMutation, useUpdateMyPhotoMutation } =
  updatePersonApi;
