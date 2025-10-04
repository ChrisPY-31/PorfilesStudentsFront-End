import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUserCog, FaUserPlus, FaUser } from "react-icons/fa";
import ManagerUsers from "./ManagerUsers";
import ManagerDashboard from "./ManagerDashboard";
import ManagerCreateUser from "./ManagerCreateUser";
import ManagerUpdateUser from "./ManagerUpdateUser";

const Manager = () => {
  const [autenticate, setAutenticate] = useState(false);
  const [managerMenu, setManagerMenu] = useState(1); 

  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* NAVEGACIÓN LATERAL */}
      <div className="w-64 shadow-xl text-black p-5 flex flex-col justify-between fix border-gray-100 border-2">
        <div>
          <h2 className="text-xl font-bold mb-4">Administrador</h2>
          <ul className="space-y-3" /*espacio entre opciones*/>
            <li
              className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
              onClick={() => setManagerMenu(1)}
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
              <FaUserCog className="mr-2 mt-1 text-xl" />
              Actualizar cuentas
            </li>
          </ul>
        </div>

        {/* Contenido inferior (Perfil y Cerrar sesión) */}
        <div
          className="mt-auto" /*margin superior pasando el contenido al resto de la seccion (al final)*/
        >
          <ul className="space-y-2">
            <li
              className="cursor-pointer hover:bg-green-100 p-2 rounded flex "
              //onClick={() => navigate("/managerProfile")}
            >
              <FaUser className="mr-2 mt-1 text-xl" />
              Perfil
            </li>
            <li
              className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
              //onClick={() => navigate("/salir")}
            >
              <MdLogout className="mr-2 mt-1 text-xl" />
              Cerrar sesión
            </li>
          </ul>
        </div>
      </div>

        {managerMenu === 1 && null}
        {managerMenu === 2 && <ManagerDashboard />}
        {managerMenu === 3 && <ManagerCreateUser/>}
        {managerMenu === 4 && <ManagerUpdateUser/>}
    </div>
  );
};

export default Manager;
