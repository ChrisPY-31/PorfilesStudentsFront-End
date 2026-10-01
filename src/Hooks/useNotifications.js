import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppSelector } from "./store";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "../services/notifications";
import { obtenerMensajeError } from "../helpers";

// Las nuevas llegan por WebSocket (useNotificationsSocket); esto es solo un respaldo
// por si la conexion falla (p. ej. el CORS del WebSocket solo acepta localhost:5173)
const INTERVALO_RESPALDO_MS = 120000;

export const useNotifications = () => {
  const navigate = useNavigate();
  const { userId, userToken } = useAppSelector(state => state.users);
  const args = { personId: userId, token: userToken };
  const { data: notificaciones = [], isLoading, error, refetch } = useGetNotificationsQuery(args, {
    skip: !userId || !userToken,
    pollingInterval: INTERVALO_RESPALDO_MS,
  });
  const [marcar] = useMarkNotificationReadMutation();

  const noLeidas = notificaciones.filter(n => !n.read);

  const marcarLeida = (notificacion) => {
    if (notificacion.read) return;
    marcar({ id: notificacion.id, ...args }).unwrap()
      .catch(err => toast.error(obtenerMensajeError(err, "No se pudo marcar como leída")));
  };

  // No hay endpoint para todas: se marca una por una
  const marcarTodas = () => noLeidas.forEach(marcarLeida);

  const abrir = (notificacion) => {
    marcarLeida(notificacion);
    if (notificacion.type === "RECOMMENDATION") {
      // Pestaña 3 = Recomendaciones de "Mi perfil"
      navigate(`/MyProfile/${userId}`, { state: { pestana: 3 } });
    } else if (notificacion.type === "PROJECT_MENTION") {
      // referenceId = id del proyecto; es de otro estudiante, asi que se muestra en la pagina de proyectos
      navigate("/Projects", { state: { proyecto: notificacion.referenceId } });
    }
  };

  return { notificaciones, noLeidas, isLoading, error, refetch, marcarLeida, marcarTodas, abrir };
};
