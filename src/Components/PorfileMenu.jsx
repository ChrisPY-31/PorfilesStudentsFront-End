import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser } from "react-icons/fi";
import { FiFolder } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { useAppSelector } from '../Hooks/store';
import { useGetloginAdminQuery } from '../services/autenticateUser';
const PorfileMenu = ({ setMenuProfile, setMyPorfile }) => {

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { data, error, isLoading } = useGetloginAdminQuery(token);
    const { user , tipo } = useAppSelector(state => state.users)
    const { userId } = useAppSelector(state => state.users)

    const handleClick = () => {
        setMenuProfile(false);
        toast.message("Cerrando sesión...", {
            duration: 1000,
        })
        setTimeout(() => {
            navigate("/");
            localStorage.removeItem("token");
            localStorage.removeItem("idPerson");
            localStorage.removeItem("username");
        }, 1500)
    }

    const handleAdmin = () => {

        if (data) {
            // Si hay data, el usuario ES admin
            setMenuProfile(false);
            toast.success("Bienvenido Administrador")
            setTimeout(() => {
                navigate("/Manager");
            }, 100);
        } else if (error) {
            // Si hay error, NO es admin
            toast.error("No tienes permisos de administrador");
        } else if (isLoading) {
            toast.message("Verificando permisos...");
        }
    }

    const handleMyProfile = () => {
        setTimeout(() => {
            navigate(`/MyProfile/${userId}`);
        }, 100)
        setMyPorfile(true);
        setMenuProfile(false);
    }


    return (
        <div className="absolute top-14 left-5 w-[300px] h-min-[400px] p-4 bg-white rounded shadow-lg z-50">
            <div className='border-2 border-green-800 h-full rounded-sm '>
                <h2 className='font-semibold text-xl mb-2'>UniConnect</h2>
                <div className='p-3 text-center'>
                    {tipo === "student" && <span>Estudiante</span> }
                    {tipo === "teacher" && <span>Docente</span>}
                    {tipo === "recruiter" && <span>Reclutador</span>}
                                    <div className='flex justify-around items-center my-2'>
                        <div>
                            <img className='size-16 rounded-full mx-auto' src={`${user.imagen ? user.imagen :'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true' }`} alt="foto de perfil" />
                        </div>
                        <div>
                            <p className='font-semibold'>{`${user.nombre} ${user.apellido}`}</p>
                            <p className='text-sm text-gray-600'>correo@correo.com</p>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col my-2 '>
                    <Link onClick={handleMyProfile} className='hover:bg-emerald-500/7 p-2'><FiUser className='inline text-green-800' /> Mi Perfil</Link>
                    <Link className='hover:bg-emerald-500/7 p-2'><FiFolder className='inline text-green-800' /> Mis proyectos</Link>
                    <Link className='hover:bg-emerald-500/7 p-2'><FiUsers className='inline text-green-800' /> Colaboraciones</Link>
                    <Link className='hover:bg-emerald-400/7 p-2'><FiLock className='inline text-green-800' />
                        <button onClick={()=>handleAdmin()}>

                            Administrador
                        </button>
                    </Link>
                </div>
                <div className=''>
                    <Link className='hover:bg-emerald-400/7 block p-2' onClick={handleClick}>
                        <IoArrowBackCircleOutline className='rotate-180 inline text-green-800 size-6' />
                        Cerrar sesion
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PorfileMenu