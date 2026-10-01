import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_KEY } from "../api/api";

export const publicationApi = createApi({
  reducerPath: "publicationApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["publications"],
  endpoints: (builder) => ({
    getPublications: builder.query({
      query: ({ token }) => ({
        url: "/publication",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["publications"],
    }),
    // Se crea solo con JSON ({ idPersona, descripcion }); la imagen va despues con uploadPublicationImage
    createPublication: builder.mutation({
      query: ({ publicacion, token }) => ({
        url: "/publication",
        method: "POST",
        body: publicacion,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["publications"],
    }),
    uploadPublicationImage: builder.mutation({
      query: ({ id, formData, token }) => ({
        url: `/filePublication/${id}`,
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["publications"],
    }),
    updatePublication: builder.mutation({
      query: ({ id, publicacion, token }) => ({
        url: `/publication/${id}`,
        method: "PUT",
        body: publicacion,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["publications"],
    }),
    deletePublication: builder.mutation({
      query: ({ id, token }) => ({
        url: `/publication/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["publications"],
    }),
    // Upsert: cada persona tiene un solo registro por publicacion con like y comentario juntos,
    // asi que siempre se mandan los dos para no pisar uno al cambiar el otro
    interactionPublication: builder.mutation({
      query: ({ token, interaction }) => ({
        url: `/interactionPublicacion`,
        method: "POST",
        body: interaction,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      // Se refleja en el feed al instante; si falla se deshace
      async onQueryStarted({ token, interaction }, { dispatch, queryFulfilled }) {
        const parche = dispatch(
          publicationApi.util.updateQueryData("getPublications", { token }, (publicaciones) => {
            const publicacion = publicaciones?.find(p => p.id === interaction.id.idPublication);
            if (!publicacion) return;
            publicacion.interacciones ??= [];
            const mia = publicacion.interacciones.find(i => i.id?.idPerson === interaction.id.idPerson);
            if (mia) {
              mia.meGusta = interaction.meGusta;
              mia.comentario = interaction.comentario;
            } else {
              publicacion.interacciones.push({ ...interaction, createdAt: new Date().toISOString() });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          parche.undo();
        }
      },
      invalidatesTags: ["publications"],
    }),
  }),
});

export const {
  useGetPublicationsQuery,
  useCreatePublicationMutation,
  useUploadPublicationImageMutation,
  useUpdatePublicationMutation,
  useDeletePublicationMutation,
  useInteractionPublicationMutation,
} = publicationApi;
