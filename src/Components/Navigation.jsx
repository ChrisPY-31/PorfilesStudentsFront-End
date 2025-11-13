import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { IoMdNotificationsOutline, IoIosSearch } from "react-icons/io";
import NotificationMenu from "./NotificationMenu";
import ProfileMenu from "./PorfileMenu";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";

const Navigation = ({ autenticate, setMyPorfile }) => {

  const [menuNotification, setMenuNotification] = useState(false)
  const [menuProfile, setMenuProfile] = useState(false)
  const {user} = useAppSelector(state => state.users)

  const navigate = useNavigate();

  return (
    <header className=" border-b-2 border-gray-200 ">
      <nav className="flex justify-between items-center h-[80px] w-[90%] mx-auto">
        <div className="flex gap-10" >
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => autenticate ? navigate("/Inicio") : navigate("/")}>
            <img className="w-5" src="https://cdn-icons-png.flaticon.com/128/2231/2231649.png" alt="" />
            <h1 className="font-bold text-2xl">UniConnect</h1>
          </div>
          {
            autenticate ? (
              <ul className="flex gap-5 items-center cursor-pointer">
                <li><Link to={"/Inicio"}>Inicio</Link></li>
                <li><Link to={"/Students"}>Estudiantes</Link></li>
                <li><Link onClick={() => toast.message("funcionalida no habilitada")}>Empleos</Link></li>
              </ul>
            )
              : null
          }

        </div>

        {
          autenticate ?
            <div className="flex gap-2 justify-center items-center relative">
              <input type="text" placeholder="Buscar Estudiante" className="outline-none shadow-sm px-2 rounded" />
              <IoIosSearch className="absolute right-[29%] top-2 cursor-pointer " />

              <IoMdNotificationsOutline
                onClick={() => {
                  setMenuNotification(!menuNotification)
                  menuProfile && setMenuProfile(false)
                }}
                className="size-6 cursor-pointer" />
              <img
                onClick={() => {
                  setMenuProfile(!menuProfile)
                  menuNotification && setMenuNotification(false)
                }}
                className="size-8 cursor-pointer rounded-full"
                src={`${user.imagen ? user.imagen : 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'}`} alt="foto de perfil"
                />
                {
                menuNotification && <NotificationMenu />
                }

                {menuProfile && <ProfileMenu setMenuProfile={setMenuProfile} setMyPorfile={setMyPorfile} />}

            </div>
            : (
              <div className="flex gap-5 items-center">
                <button><Link to={"/Sign-In"} className="bg-blue-500 py-1 px-2 text-white rounded-[3px] font-bold"> Inicia Session</Link></button>
                <button>
                  <Link to={"/Sign-Up"} className="bg-blue-500 py-1 px-2 text-white rounded-[3px] font-bold"> Registrate</Link>
                </button>
              </div>
            )
        }
      </nav>

    </header>
  )
}

export default Navigation