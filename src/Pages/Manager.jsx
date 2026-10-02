import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUsers, FaUserPlus, FaUser, FaGraduationCap } from "react-icons/fa";
import ManagerDashboard from "../Components/ManagerDashboard";
import ManagerCreateUser from "../Components/ManagerCreateUser";
import ManagerUsers from "../Components/ManagerUsers";
import ManagerCareers from "../Components/ManagerCareers";
import { toast } from "sonner";
import ChangePassword from "../Components/ChangePassword";
import { useUserAccount } from "../Hooks/useUserAccount";

const Manager = ({ usermenu }) => {
  const [autenticate, setAutenticate] = useState(false);
  const [managerMenu, setManagerMenu] = useState(2);

  const navigate = useNavigate();
  const { cerrarSesion } = useUserAccount();

  const handleCerrar = () => {
    toast.message("Cerrando sesión...", { duration: 500 })
    setTimeout(() => {
      navigate("/");
      cerrarSesion();
    }, 1000)
  }

  const OpcionInicio = () => {
    navigate("/Inicio");
  }

  return (
    <div className="flex min-h-screen">

      <div className="w-64 shadow-xl text-black p-5 flex flex-col justify-between fix border-gray-100 border-2">
        <div>
          <h2 className="text-xl font-bold mb-4">{!usermenu ? "Administrador" : "Ajustes"}</h2>
          <ul className="space-y-3" >
            {!usermenu ? (
              <>
                <li
                  className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
                  onClick={OpcionInicio}
                >
                  <IoIosHome className="mr-2 mt-1 text-xl" />
                  Inicio
                </li>

                <li
                  className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
                  onClick={() => setManagerMenu(2)}
                >
                  <MdDashboard className="mr-2 mt-1 text-xl " />
                  Dashboard
                </li>
                <li
                  className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
                  onClick={() => setManagerMenu(3)}
                >
                  <FaUserPlus className="mr-2 mt-1 text-xl" />
                  Crear cuentas
                </li>
                <li
                  className="cursor-pointer hover:bg-green-100 p-2 rounded flex "
                  onClick={() => setManagerMenu(4)}
                >
                  <FaUsers className="mr-2 mt-1 text-xl" />
                  Usuarios
                </li>
                <li
                  className="cursor-pointer hover:bg-green-100 p-2 rounded flex "
                  onClick={() => setManagerMenu(5)}
                >
                  <FaGraduationCap className="mr-2 mt-1 text-xl" />
                  Carreras
                </li>
              </>
            ) :
              <li>Inicio se sesion y seguidad</li>
            }
          </ul>
        </div>


        <div
          className="mt-auto"
        >
          <ul className="space-y-2">
            <li
              className="cursor-pointer hover:bg-green-100 p-2 rounded flex "
            //onClick={() => navigate("/managerProfile")}
            >
              <FaUser className="mr-2 mt-1 text-xl" />
              Perfil
            </li>
            <li onClick={handleCerrar}
              className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
            //onClick={() => navigate("/salir")}
            >
              <MdLogout className="mr-2 mt-1 text-xl" />
              Cerrar sesión
            </li>
          </ul>
        </div>
      </div>

      {usermenu &&
        managerMenu === 2 ? <ChangePassword />
        :
        <>
          {managerMenu === 1 && null}
          {managerMenu === 2 && <ManagerDashboard onVerUsuarios={() => setManagerMenu(4)} />}
          {managerMenu === 3 && <ManagerCreateUser />}
          {managerMenu === 4 && <ManagerUsers />}
          {managerMenu === 5 && <ManagerCareers />}
        </>


      }

    </div>
  );
};

export default Manager;
