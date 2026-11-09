import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

// Chat reclutador <-> alumno (STUDENT o RECRUITER; solo el reclutador inicia conversaciones).
// ConversationDto: { idConversacion, estado: ACTIVA|BLOQUEADA, creada, ultimoMensajeEn, noLeidos,
//   ultimoMensaje: MessageDto, vacante: { idVacante, titulo, estado, empresa },
//   contraparte: { id, tipo: ALUMNO|RECLUTADOR, nombre, apellido, imagen, empresa } }
// MessageDto: { idMensaje, idConversacion, idRemitente, remitente: ALUMNO|RECLUTADOR, contenido, enviado, leido }
const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const MENSAJES_POR_PAGINA = 30;

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Conversaciones"],
  endpoints: (builder) => ({
    // Bandeja: de la mas reciente a la mas antigua, con ultimo mensaje y no leidos
    getConversations: builder.query({
      query: ({ token }) => ({ url: "/conversations", headers: auth(token) }),
      providesTags: ["Conversaciones"],
    }),
    // Mensajes paginados (el back los da del mas reciente al mas antiguo).
    // Una sola entrada de cache por conversacion: cada pagina nueva (mas antigua) se agrega a la lista,
    // sin duplicados. Forma del cache: { mensajes: [MessageDto] (mas reciente primero), pagina, ultima }
    getMessages: builder.query({
      query: ({ idConversacion, page = 0, token }) => ({
        url: `/conversations/${idConversacion}/messages`,
        params: { page, size: MENSAJES_POR_PAGINA },
        headers: auth(token),
      }),
      transformResponse: (res, _meta, { page = 0 }) => ({ mensajes: res?.content ?? [], pagina: page, ultima: res?.last ?? true }),
      serializeQueryArgs: ({ queryArgs }) => String(queryArgs.idConversacion),
      merge: (cache, nuevo) => {
        const porId = new Map(cache.mensajes.map(m => [m.idMensaje, m]));
        nuevo.mensajes.forEach(m => porId.set(m.idMensaje, m));
        cache.mensajes = [...porId.values()].sort((a, b) => new Date(b.enviado) - new Date(a.enviado));
        if (nuevo.pagina >= cache.pagina) {
          cache.pagina = nuevo.pagina;
          cache.ultima = nuevo.ultima;
        }
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    // { contenido } (1 a 2000 caracteres). Responde el MessageDto; el back tambien lo empuja por WebSocket
    sendMessage: builder.mutation({
      query: ({ idConversacion, contenido, token }) => ({
        url: `/conversations/${idConversacion}/messages`,
        method: "POST",
        body: { contenido },
        headers: auth(token),
      }),
      async onQueryStarted({ idConversacion, token }, { dispatch, queryFulfilled }) {
        try {
          const { data: mensaje } = await queryFulfilled;
          // Se agrega a la conversacion y se actualiza el ultimo mensaje en la bandeja
          dispatch(chatApi.util.updateQueryData("getMessages", { idConversacion }, (draft) => {
            if (!draft.mensajes.some(m => m.idMensaje === mensaje.idMensaje)) draft.mensajes.unshift(mensaje);
          }));
          dispatch(chatApi.util.updateQueryData("getConversations", { token }, (lista) => {
            const c = lista.find(x => x.idConversacion === idConversacion);
            if (c) { c.ultimoMensaje = mensaje; c.ultimoMensajeEn = mensaje.enviado; }
          }));
        } catch {
          // El componente muestra el error
        }
      },
    }),
    // Solo RECRUITER: abre (o reutiliza) la conversacion con cualquier alumno, aunque no se haya postulado,
    // y le manda el mensaje. Hay una sola conversacion por alumno-reclutador; en los chats directos `vacante` es null.
    // { idEstudiante, mensaje (1 a 2000) } -> { mensaje, object: ConversationDto }
    startConversation: builder.mutation({
      query: ({ idEstudiante, mensaje, token }) => ({
        url: "/recruiter/me/conversations",
        method: "POST",
        body: { idEstudiante, mensaje },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Conversaciones"]),
    }),
    // Marca como leidos los mensajes de la otra parte; en la bandeja se pone en 0 al momento
    markConversationRead: builder.mutation({
      query: ({ idConversacion, token }) => ({
        url: `/conversations/${idConversacion}/read`,
        method: "PATCH",
        headers: auth(token),
      }),
      async onQueryStarted({ idConversacion, token }, { dispatch, queryFulfilled }) {
        const parche = dispatch(chatApi.util.updateQueryData("getConversations", { token }, (lista) => {
          const c = lista.find(x => x.idConversacion === idConversacion);
          if (c) c.noLeidos = 0;
        }));
        try {
          await queryFulfilled;
        } catch {
          parche.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useStartConversationMutation,
} = chatApi;
