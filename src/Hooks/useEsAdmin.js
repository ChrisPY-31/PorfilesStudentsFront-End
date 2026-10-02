import { useAppSelector } from "./store";
import { useGetloginAdminQuery } from "../services/autenticateUser";

// true si el back reconoce la sesion como ADMIN (GET /manager responde 200).
// Comparte cache con RutaAdmin y el menu de perfil, asi que no repite la peticion.
export const useEsAdmin = () => {
  const { userToken } = useAppSelector((state) => state.users);
  const { isSuccess } = useGetloginAdminQuery(userToken, { skip: !userToken });
  return isSuccess;
};
