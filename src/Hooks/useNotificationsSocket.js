import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch, useAppSelector } from "./store";
import { notificationsApi } from "../services/notifications";
import { chatApi } from "../services/chat";
import { conversacionActiva, MI_REMITENTE } from "../helpers/chatActivo";
import { WS_URL } from "../api/api";
import { useTieneNotificaciones } from "./useNotifications";

/**
 * Tiempo real (STOMP sobre SockJS): notificaciones y mensajes del chat por la MISMA conexion.
 * Se monta UNA sola vez (en Navigation) para no abrir varias conexiones.
 * - /user/queue/notifications: se agrega a getNotifications y se avisa con onNueva.
 * - /user/queue/messages (solo alumno y reclutador): el back lo manda a los dos participantes,
 *   tambien a quien lo envio. Se agrega al chat sin duplicar, se actualiza la bandeja y, si es de la
 *   otra persona, se marca como leido (si esa conversacion esta abierta) o suma a "no leidos" y se avisa con onMensaje.
 */
export const useNotificationsSocket = (onNueva, onMensaje) => {
  const dispatch = useAppDispatch();
  const { userId, userToken, tipo } = useAppSelector(state => state.users);
  const tieneNotificaciones = useTieneNotificaciones();
  const miRemitente = MI_REMITENTE[tipo];
  const tieneChat = Boolean(miRemitente);
  // Refs para no reconectar cada vez que cambian los callbacks
  const onNuevaRef = useRef(onNueva);
  onNuevaRef.current = onNueva;
  const onMensajeRef = useRef(onMensaje);
  onMensajeRef.current = onMensaje;

  useEffect(() => {
    if (!userId || !userToken || (!tieneNotificaciones && !tieneChat)) return;

    const recibirMensaje = (mensaje) => {
      const { idConversacion } = mensaje;
      const esMio = mensaje.remitente === miRemitente;
      const abierta = conversacionActiva() === idConversacion;

      // Al chat (si esa conversacion ya se cargo); sendMessage tambien lo agrega, por eso se revisa el id
      dispatch(chatApi.util.updateQueryData("getMessages", { idConversacion }, (draft) => {
        if (!draft.mensajes.some(m => m.idMensaje === mensaje.idMensaje)) draft.mensajes.unshift(mensaje);
      }));

      // A la bandeja; si la conversacion es nueva (el reclutador le escribio por primera vez) se recarga
      let enBandeja = false;
      let nombre = "";
      dispatch(chatApi.util.updateQueryData("getConversations", { token: userToken }, (lista) => {
        const c = lista.find(x => x.idConversacion === idConversacion);
        if (!c) return;
        enBandeja = true;
        nombre = `${c.contraparte?.nombre ?? ""} ${c.contraparte?.apellido ?? ""}`.trim();
        c.ultimoMensaje = mensaje;
        c.ultimoMensajeEn = mensaje.enviado;
        if (!esMio && !abierta) c.noLeidos = (c.noLeidos ?? 0) + 1;
      }));
      if (!enBandeja) dispatch(chatApi.util.invalidateTags(["Conversaciones"]));

      if (esMio) return;
      if (abierta) {
        dispatch(chatApi.endpoints.markConversationRead.initiate({ idConversacion, token: userToken }));
      } else {
        onMensajeRef.current?.(mensaje, nombre);
      }
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      // El back valida el JWT en el frame CONNECT (no en el handshake HTTP)
      connectHeaders: { Authorization: `Bearer ${userToken}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Al (re)conectar se recarga por si llego algo mientras no habia conexion
        if (tieneChat) {
          dispatch(chatApi.util.invalidateTags(["Conversaciones"]));
          client.subscribe("/user/queue/messages", (frame) => {
            try {
              recibirMensaje(JSON.parse(frame.body));
            } catch {
              // Mensaje con formato inesperado: se ignora
            }
          });
        }
        if (!tieneNotificaciones) return;
        dispatch(notificationsApi.util.invalidateTags(["Notifications"]));

        client.subscribe("/user/queue/notifications", (frame) => {
          let notificacion;
          try {
            notificacion = JSON.parse(frame.body);
          } catch {
            return;
          }
          dispatch(
            notificationsApi.util.updateQueryData("getNotifications", { personId: userId, token: userToken }, (lista) => {
              if (!lista.some(n => n.id === notificacion.id)) lista.unshift(notificacion);
            })
          );
          onNuevaRef.current?.(notificacion);
        });
      },
      onStompError: (frame) => console.warn("WebSocket de notificaciones rechazado:", frame.headers?.message),
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [userId, userToken, tieneNotificaciones, tieneChat, miRemitente, dispatch]);
};
