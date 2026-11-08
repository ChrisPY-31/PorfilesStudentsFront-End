import { IoBusinessOutline } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useGetMyCompanyProfileQuery } from "../services/company";

// Logo de la empresa como avatar de la cuenta COMPANY_ADMIN (barra y menu de perfil).
// Comparte cache con la tarjeta de Inicio (mismo GET /company-admin/me/profile).
// Cuadro redondeado con object-contain para que el logo no se corte.
const EmpresaAvatar = ({ className = "", icono = "size-5" }) => {
  const { userToken } = useAppSelector(state => state.users);
  const { data: perfil } = useGetMyCompanyProfileQuery({ token: userToken }, { skip: !userToken });

  return (
    <div className={`shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200 ${className}`}>
      {perfil?.logo
        ? <img src={perfil.logo} alt={`Logo de ${perfil.nombreEmpresa ?? "la empresa"}`} className="size-full object-contain" />
        : <div className="size-full flex items-center justify-center bg-gray-100 text-gray-400">
          <IoBusinessOutline className={icono} />
        </div>}
    </div>
  );
};

export default EmpresaAvatar;
