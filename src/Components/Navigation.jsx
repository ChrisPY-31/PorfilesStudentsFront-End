import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import {
  IoNotificationsOutline,
  IoNotifications,
  IoSchool,
  IoChevronDown,
  IoBriefcaseOutline,
  IoHomeOutline,
  IoHome,
  IoPeopleOutline,
  IoPeople,
  IoFolderOpenOutline,
  IoFolderOpen,
} from "react-icons/io5";
import UAEMexLogo from "../assets/UAEMexLogo.png";
// Secciones principales; el icono relleno marca la activa
const SECCIONES = [
  { to: "/Inicio", label: "Inicio", icon: IoHomeOutline, iconActivo: IoHome },
  {
    to: "/Students",
    label: "Estudiantes",
    icon: IoPeopleOutline,
    iconActivo: IoPeople,
  },
  {
    to: "/Projects",
    label: "Proyectos",
    icon: IoFolderOpenOutline,
    iconActivo: IoFolderOpen,
  },
];
import NotificationMenu from "./NotificationMenu";
import { useNotifications } from "../Hooks/useNotifications";
import { useNotificationsSocket } from "../Hooks/useNotificationsSocket";
import ProfileMenu from "./PorfileMenu";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";

const Navigation = ({ autenticate, setMyPorfile }) => {
  const [menuNotification, setMenuNotification] = useState(false);
  const [menuProfile, setMenuProfile] = useState(false);
  const { user } = useAppSelector((state) => state.users);
  const { noLeidas, abrir } = useNotifications();

  // Conexion en tiempo real: cada notificacion nueva entra a la campana y se avisa con un toast
  useNotificationsSocket((notificacion) => {
    toast(notificacion.message, {
      action: { label: "Ver", onClick: () => abrir(notificacion) },
    });
  });
  const campanaRef = useRef(null);
  const perfilRef = useRef(null);

  // Cierra el menu de notificaciones al dar clic fuera
  useEffect(() => {
    if (!menuNotification) return;
    const cerrar = (e) => {
      if (!campanaRef.current?.contains(e.target)) setMenuNotification(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [menuNotification]);

  // Igual para el menu del perfil
  useEffect(() => {
    if (!menuProfile) return;
    const cerrar = (e) => {
      if (!perfilRef.current?.contains(e.target)) setMenuProfile(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [menuProfile]);

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 font-display">
      <nav className="flex justify-between items-center h-16 w-full max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            type="button"
            onClick={() => (autenticate ? navigate("/Inicio") : navigate("/"))}
            className="flex items-center gap-2.5"
          >
            <img className="size-10 rounded-xl shadow-sm object-cover cursor-pointer" src={UAEMexLogo} alt="Logo UAEM" />

            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Uni<span className="text-green-600">Connect</span>
            </span>
          </button>

          {/* Secciones */}
          {autenticate && (
            <ul className="flex items-center gap-1">
              {SECCIONES.map(
                ({ to, label, icon: Icono, iconActivo: IconoActivo }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      title={label}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive ? (
                            <IconoActivo className="size-5" />
                          ) : (
                            <Icono className="size-5" />
                          )}
                          <span className="hidden md:inline">{label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ),
              )}
              <li>
                <button
                  type="button"
                  onClick={() =>
                    toast.message("Empleos estará disponible próximamente")
                  }
                  title="Empleos"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-50"
                >
                  <IoBriefcaseOutline className="size-5" />
                  <span className="hidden md:inline">Empleos</span>
                </button>
              </li>
            </ul>
          )}
        </div>

        {autenticate ? (
          <div className="flex items-center gap-3 relative">
            <div ref={campanaRef}>
              <button
                type="button"
                onClick={() => {
                  setMenuNotification(!menuNotification);
                  menuProfile && setMenuProfile(false);
                }}
                aria-label={
                  noLeidas.length > 0
                    ? `Notificaciones, ${noLeidas.length} sin leer`
                    : "Notificaciones"
                }
                className={`relative p-2 rounded-full transition-colors ${menuNotification ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {menuNotification ? (
                  <IoNotifications className="size-6" />
                ) : (
                  <IoNotificationsOutline className="size-6" />
                )}
                {noLeidas.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                    {noLeidas.length > 9 ? "9+" : noLeidas.length}
                  </span>
                )}
              </button>
              {menuNotification && (
                <NotificationMenu onClose={() => setMenuNotification(false)} />
              )}
            </div>

            <span className="h-6 w-px bg-gray-200" />

            <div ref={perfilRef}>
              <button
                type="button"
                onClick={() => {
                  setMenuProfile(!menuProfile);
                  menuNotification && setMenuNotification(false);
                }}
                aria-label="Menú de la cuenta"
                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-colors ${menuProfile ? "bg-green-50" : "hover:bg-gray-100"}`}
              >
                <img
                  className={`size-8 rounded-full object-cover ring-2 ${menuProfile ? "ring-green-500" : "ring-transparent"}`}
                  src={`${user.imagen ? user.imagen : "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true"}`}
                  alt="foto de perfil"
                />
                {user?.nombre && (
                  <span className="hidden lg:inline text-sm font-semibold text-gray-800">
                    {user.nombre}
                  </span>
                )}
                <IoChevronDown
                  className={`size-4 text-gray-500 transition-transform ${menuProfile ? "rotate-180" : ""}`}
                />
              </button>
              {menuProfile && (
                <ProfileMenu
                  setMenuProfile={setMenuProfile}
                  setMyPorfile={setMyPorfile}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to={"/Sign-In"}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Inicia sesión
            </Link>
            <Link
              to={"/Sign-Up"}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
            >
              Regístrate
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
