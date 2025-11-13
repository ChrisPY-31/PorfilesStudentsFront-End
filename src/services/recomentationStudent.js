import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

export const recomendationStudent = createApi({
  reducerPath: "recomendationStudent",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  endpoints: (builder) => ({
    getRecomendation: builder.query({
      query: () => ({
        url: `/${tipo}/${userId}`,
        body: updateStudent,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    createRecomedation: builder.mutation({
      query: ({ recomendationData , token }) => {
        return {
          url: `/recomendation`,
          method: "POST",
          body: recomendationData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),
  }),
});

export const {useGetRecomendationQuery,useCreateRecomedationMutation} = recomendationStudent
