import { useGetInstitutionQuery } from "../services/institution";
import LogoCU from "../assets/LogoCUTianguistenco.jpg";

// Nombre y logo con los que aparece el ADMIN (perfil institucional compartido).
// Sin logo propio se usa el del CU. `activo` = false no hace la peticion (cuentas que no son admin).
// Comparte cache con la pagina /Institucion y la tarjeta de Inicio, asi que se actualiza al editarlas.
export const useInstitucion = (activo = true) => {
  const { data } = useGetInstitutionQuery(undefined, { skip: !activo });
  return {
    nombre: data?.nombre ?? "",
    logo: data?.logo || LogoCU,
  };
};
