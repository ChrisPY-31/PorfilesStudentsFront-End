import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch, useAppSelector } from "./store";
import { notificationsApi } from "../services/notifications";
import { WS_URL } from "../api/api";

/**
 * Escucha las notificaciones en tiempo real (STOMP sobre SockJS).
 * Se monta UNA sola vez (en Navigation) para no abrir varias conexiones.
 * Cada notificacion nueva se agrega a la lista de getNotifications y se avisa con onNueva.
 */
export const useNotificationsSocket = (onNueva) => {
  const dispatch = useAppDispatch();
  const { userId, userToken } = useAppSelector(state => state.users);
  // Ref para no reconectar cada vez que cambia el callback
  const onNuevaRef = useRef(onNueva);
  onNuevaRef.current = onNueva;

  useEffect(() => {
    if (!userId || !userToken) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      // El back valida el JWT en el frame CONNECT (no en el handshake HTTP)
      connectHeaders: { Authorization: `Bearer ${userToken}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Al (re)conectar se recarga el historial por si llego algo mientras no habia conexion
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
  }, [userId, userToken, dispatch]);
};
