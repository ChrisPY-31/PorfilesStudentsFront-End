import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Solo un TEACHER recomienda; el maestro se toma del token y cada maestro tiene
// una sola recomendacion por estudiante (la llave es idStudent + idTeacher)
export const recomendationStudent = createApi({
  reducerPath: "recomendationStudent",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  endpoints: (builder) => ({
    // Body: { id: { idStudent }, comentario }. Dispara una notificacion al estudiante
    createRecomedation: builder.mutation({
      query: ({ idStudent, comentario, token }) => ({
        url: "/recomendation",
        method: "POST",
        body: { id: { idStudent }, comentario },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateRecomendation: builder.mutation({
      query: ({ idStudent, comentario, token }) => ({
        url: `/recomendation/${idStudent}`,
        method: "PUT",
        body: { id: { idStudent }, comentario },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteRecomendation: builder.mutation({
      query: ({ idStudent, token }) => ({
        url: `/recomendation/${idStudent}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useCreateRecomedationMutation,
  useUpdateRecomendationMutation,
  useDeleteRecomendationMutation,
} = recomendationStudent;
