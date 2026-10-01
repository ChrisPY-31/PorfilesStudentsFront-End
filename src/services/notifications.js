import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Notificacion: { id, type, message, referenceId, read, createdAt }
export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ personId, token }) => ({
        url: `/notifications/${personId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      // Las mas recientes primero
      transformResponse: (respuesta) =>
        (Array.isArray(respuesta) ? respuesta : [])
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      providesTags: ["Notifications"],
    }),
    // Se marca leida al instante en la lista; si el back falla se deshace
    markNotificationRead: builder.mutation({
      query: ({ id, token }) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      async onQueryStarted({ id, personId, token }, { dispatch, queryFulfilled }) {
        const parche = dispatch(
          notificationsApi.util.updateQueryData("getNotifications", { personId, token }, (lista) => {
            const notificacion = lista.find(n => n.id === id);
            if (notificacion) notificacion.read = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          parche.undo();
        }
      },
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi;
