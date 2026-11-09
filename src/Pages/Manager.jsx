import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaUsers, FaUserPlus, FaUser, FaGraduationCap, FaLock, FaUserTie, FaBriefcase, FaFileAlt, FaIdCard, FaPlusCircle, FaComments } from "react-icons/fa";
import ManagerDashboard from "../Components/ManagerDashboard";
import ManagerCreateUser from "../Components/ManagerCreateUser";
import ManagerUsers from "../Components/ManagerUsers";
import ManagerCareers from "../Components/ManagerCareers";
import { toast } from "sonner";
import ChangePassword from "../Components/ChangePassword";
import { useUserAccount } from "../Hooks/useUserAccount";
import { useAppSelector } from "../Hooks/store";
import CompanyRecruiters from "../Components/CompanyRecruiters";
import RecruiterForm from "../Components/RecruiterForm";
import CompanyJobs from "../Components/CompanyJobs";
import CompanyApplications from "../Components/CompanyApplications";
import CompanyAdminForm from "../Components/CompanyAdminForm";
import RecruiterJobs from "../Components/RecruiterJobs";
import RecruiterJobForm from "../Components/RecruiterJobForm";
import RecruiterApplicants from "../Components/RecruiterApplicants";
import ChatInbox from "../Components/ChatInbox";

const Manager = ({ usermenu }) => {
  const [autenticate, setAutenticate] = useState(false);
  const [managerMenu, setManagerMenu] = useState(2);
  // Ajustes de la cuenta (usermenu): "seguridad" para todos; el resto depende del rol
  const { tipo } = useAppSelector(state => state.users);
  const esEmpresa = tipo === "company_admin";
  const esReclutador = tipo === "recruiter";
  // Se puede abrir una seccion directo con navigate(..., { state: { ajuste } }) (ej. tarjeta de Inicio, boton Empleos)
  const location = useLocation();
  const AJUSTES_EMPRESA = ["mis-datos", "vacantes", "postulaciones", "reclutadores", "crear-reclutador"];
  const AJUSTES_RECLUTADOR = ["mis-vacantes", "nueva-vacante", "postulantes", "mensajes"];
  const ajustesDelRol = esEmpresa ? AJUSTES_EMPRESA : esReclutador ? AJUSTES_RECLUTADOR : [];
  const ajustePedido = location.state?.ajuste;
  const [ajuste, setAjuste] = useState(ajustesDelRol.includes(ajustePedido) ? ajustePedido : "seguridad");
  // Si ya se esta en Ajustes y se vuelve a pedir una seccion (ej. clic en Empleos), se cambia a esa
  useEffect(() => {
    if (ajustesDelRol.includes(ajustePedido)) {
      setAjuste(ajustePedido);
      // Desde el menu de perfil "Publicar vacante" siempre abre una vacante nueva
      if (ajustePedido === "nueva-vacante") setVacanteEnEdicion(null);
      if (ajustePedido === "mensajes") setConversacionAbierta(location.state?.idConversacion ?? null);
      if (ajustePedido === "postulantes") setVacantePostulantes(location.state?.idVacante ? String(location.state.idVacante) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
  // Vacante elegida en "Ver postulaciones" para abrir esa seccion ya filtrada
  const [vacanteFiltro, setVacanteFiltro] = useState("");
  const irAPostulaciones = (idVacante = "") => {
    setVacanteFiltro(idVacante);
    setAjuste("postulaciones");
  };

  // Reclutador: vacante que se abre en el formulario ("Editar") y la que filtra "Postulantes"
  const [vacanteEnEdicion, setVacanteEnEdicion] = useState(null);
  // Puede llegar desde la notificacion de nueva postulacion (state.idVacante)
  const [vacantePostulantes, setVacantePostulantes] = useState(
    esReclutador && location.state?.ajuste === "postulantes" && location.state?.idVacante ? String(location.state.idVacante) : ""
  );
  const irANuevaVacante = (vacante = null) => {
    setVacanteEnEdicion(vacante);
    setAjuste("nueva-vacante");
  };
  // Conversacion que se abre al entrar a Mensajes (desde Postulantes o la ventana "Enviar mensaje")
  const [conversacionAbierta, setConversacionAbierta] = useState(
    esReclutador && location.state?.ajuste === "mensajes" ? (location.state?.idConversacion ?? null) : null
  );
  const irAConversacion = (idConversacion) => {
    setConversacionAbierta(idConversacion);
    setAjuste("mensajes");
  };
  const irAPostulantes = (idVacante = "") => {
    setVacantePostulantes(idVacante);
    setAjuste("postulantes");
  };

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
    // Ocupa exactamente la pantalla: en Ajustes (usermenu) se resta la barra de navegacion (h-16 + 1px de borde).
    // El menu lateral queda fijo y solo el contenido hace scroll
    <div className={`flex overflow-hidden ${usermenu ? "h-[calc(100dvh-4rem-1px)]" : "h-dvh"}`}>

      <div className="w-64 shrink-0 overflow-y-auto shadow-xl text-black p-5 flex flex-col justify-between border-gray-100 border-2">
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
            ) : (
              <>
                <li
                  className="cursor-pointer hover:bg-green-100 p-2 rounded flex"
                  onClick={OpcionInicio}
                >
                  <IoIosHome className="mr-2 mt-1 text-xl" />
                  Inicio
                </li>
                <li
                  className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "seguridad" ? "bg-green-100 font-semibold" : ""}`}
                  onClick={() => setAjuste("seguridad")}
                >
                  <FaLock className="mr-2 mt-1 text-lg" />
                  Inicio de sesión y seguridad
                </li>
                {esEmpresa && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "mis-datos" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => setAjuste("mis-datos")}
                  >
                    <FaIdCard className="mr-2 mt-1 text-lg" />
                    Mis datos
                  </li>
                )}
                {esEmpresa && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "vacantes" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => setAjuste("vacantes")}
                  >
                    <FaBriefcase className="mr-2 mt-1 text-lg" />
                    Vacantes
                  </li>
                )}
                {esEmpresa && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "postulaciones" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => irAPostulaciones()}
                  >
                    <FaFileAlt className="mr-2 mt-1 text-lg" />
                    Postulaciones
                  </li>
                )}
                {esEmpresa && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "reclutadores" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => setAjuste("reclutadores")}
                  >
                    <FaUserTie className="mr-2 mt-1 text-lg" />
                    Reclutadores
                  </li>
                )}
                {esEmpresa && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "crear-reclutador" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => setAjuste("crear-reclutador")}
                  >
                    <FaUserPlus className="mr-2 mt-1 text-lg" />
                    Crear cuenta
                  </li>
                )}
                {esReclutador && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "mis-vacantes" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => setAjuste("mis-vacantes")}
                  >
                    <FaBriefcase className="mr-2 mt-1 text-lg" />
                    Mis vacantes
                  </li>
                )}
                {esReclutador && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "nueva-vacante" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => irANuevaVacante()}
                  >
                    <FaPlusCircle className="mr-2 mt-1 text-lg" />
                    Publicar vacante
                  </li>
                )}
                {esReclutador && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "postulantes" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => irAPostulantes()}
                  >
                    <FaUsers className="mr-2 mt-1 text-lg" />
                    Postulantes
                  </li>
                )}
                {esReclutador && (
                  <li
                    className={`cursor-pointer hover:bg-green-100 p-2 rounded flex ${ajuste === "mensajes" ? "bg-green-100 font-semibold" : ""}`}
                    onClick={() => irAConversacion(null)}
                  >
                    <FaComments className="mr-2 mt-1 text-lg" />
                    Mensajes
                  </li>
                )}
              </>
            )}
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

      <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50 flex flex-col">
      {usermenu ? (
        <>
          {ajuste === "seguridad" && <ChangePassword />}
          {ajuste === "mis-datos" && esEmpresa && <CompanyAdminForm />}
          {ajuste === "vacantes" && esEmpresa && <CompanyJobs onVerPostulaciones={irAPostulaciones} />}
          {ajuste === "postulaciones" && esEmpresa && <CompanyApplications key={vacanteFiltro} vacanteInicial={vacanteFiltro} />}
          {ajuste === "reclutadores" && esEmpresa && <CompanyRecruiters onCrear={() => setAjuste("crear-reclutador")} />}
          {ajuste === "crear-reclutador" && esEmpresa && <RecruiterForm onVerReclutadores={() => setAjuste("reclutadores")} />}
          {/* Reclutador: secciones que se van llenando por fases */}
          {ajuste === "mis-vacantes" && esReclutador && <RecruiterJobs
            onCrear={() => irANuevaVacante()}
            onEditar={(vacante) => irANuevaVacante(vacante)}
            onVerPostulantes={irAPostulantes}
          />}
          {ajuste === "nueva-vacante" && esReclutador && <RecruiterJobForm
            key={vacanteEnEdicion?.idVacante ?? "nueva"}
            vacante={vacanteEnEdicion}
            onTerminar={() => { setVacanteEnEdicion(null); setAjuste("mis-vacantes"); }}
          />}
          {ajuste === "postulantes" && esReclutador && <RecruiterApplicants
            key={vacantePostulantes}
            vacanteInicial={vacantePostulantes}
            onIrAVacantes={() => setAjuste("mis-vacantes")}
          />}
          {ajuste === "mensajes" && esReclutador && <ChatInbox key={conversacionAbierta ?? "bandeja"} conversacionInicial={conversacionAbierta} />}
        </>
      ) : (
        <>
          {managerMenu === 1 && null}
          {managerMenu === 2 && <ManagerDashboard onVerUsuarios={() => setManagerMenu(4)} />}
          {managerMenu === 3 && <ManagerCreateUser />}
          {managerMenu === 4 && <ManagerUsers />}
          {managerMenu === 5 && <ManagerCareers />}
        </>
      )}
      </div>

    </div>
  );
};

export default Manager;
