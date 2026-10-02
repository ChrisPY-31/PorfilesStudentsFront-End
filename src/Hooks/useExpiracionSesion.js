import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppSelector } from "./store";
import { useUserAccount } from "./useUserAccount";
import { expiracionToken } from "../store/sesion";

/**
 * Cierra la sesion cuando vence el token y manda al login.
 * Se monta UNA sola vez (en App). Tambien revisa al volver a la pestaña,
 * porque el navegador puede retrasar el temporizador si estuvo en segundo plano.
 */
export const useExpiracionSesion = () => {
  const navigate = useNavigate();
  const { userToken } = useAppSelector(state => state.users);
  const { cerrarSesion } = useUserAccount();

  useEffect(() => {
    if (!userToken) return;
    const vence = expiracionToken(userToken);
    if (!vence) return;

    let cerrada = false;
    const expirar = () => {
      if (cerrada || Date.now() < vence) return;
      cerrada = true;
      cerrarSesion();
      toast.info("Tu sesión expiró, vuelve a iniciar sesión");
      navigate("/Sign-In");
    };

    const temporizador = setTimeout(expirar, Math.max(vence - Date.now(), 0));
    const alVolver = () => document.visibilityState === "visible" && expirar();
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", alVolver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken]);
};
