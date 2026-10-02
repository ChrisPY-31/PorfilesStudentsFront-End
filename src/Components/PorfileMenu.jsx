import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiFolder, FiUsers, FiLock, FiAward, FiBriefcase, FiSettings, FiLogOut } from "react-icons/fi";
import { toast } from 'sonner';
import { useAppSelector } from '../Hooks/store';
import { useGetloginAdminQuery } from '../services/autenticateUser';
import { userAccountSlice } from '../store/UserAccount/userAccountSlice';
import { useUserAccount } from '../Hooks/useUserAccount';
import Manager from '../Pages/Manager';
// Opcion del menu; `proximamente` la muestra deshabilitada
const Opcion = ({ icono: Icono, children, onClick, proximamente, peligro }) => (
    <button
        type='button'
        onClick={onClick}
        disabled={proximamente}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors disabled:cursor-not-allowed ${peligro
            ? 'text-red-600 hover:bg-red-50'
            : 'text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent disabled:text-gray-400'
            }`}
    >
        <Icono className={`size-5 shrink-0 ${peligro ? '' : 'text-gray-500'}`} />
        <span className='flex-1'>{children}</span>
        {proximamente && <span className='px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500'>Próximamente</span>}
    </button>
)

const PorfileMenu = ({ setMenuProfile, setMyPorfile }) => {

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { data, error, isLoading } = useGetloginAdminQuery(token);
    const { user, tipo, userId } = useAppSelector(state => state.users)
    const { cerrarSesion } = useUserAccount();

    const handleClick = () => {
        setMenuProfile(false);
        toast.message("Cerrando sesión...", {
            duration: 1000,
        })
        setTimeout(() => {
            navigate("/");
            cerrarSesion()
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

    const handleRecruitment = () => {
        setMenuProfile(false); // Cierra el menú al navegar
        setTimeout(() => {
            navigate('/StudentRecruitment/');
        }, 100);
    }

    const handleInfoMenuUser = () => {
        setMenuProfile(false); // Cierra el menú al navegar
        setTimeout(() => {
            navigate('/sing-in-and-security');
        }, 100);
    }

    const esUsuario = tipo === "student" || tipo === "recruiter" || tipo === "teacher"
    const ROLES = { student: "Estudiante", teacher: "Docente", recruiter: "Reclutador" }

    // Lleva a una pestaña de "Mi perfil" (2 proyectos, 3 recomendaciones)
    const irAPestana = (pestana) => {
        setMenuProfile(false)
        navigate(`/MyProfile/${userId}`, { state: { pestana } })
    }

    return (
        <div className="absolute top-14 right-0 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            {/* Encabezado */}
            <div className='p-4'>
                <div className='flex items-center gap-3'>
                    <img
                        className='size-14 shrink-0 rounded-full object-cover'
                        src={esUsuario
                            ? (user.imagen || 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true')
                            : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWPzckq1VBcfsvTk3ByJnJR-ort0ykcUGROA&s'}
                        alt="foto de perfil"
                    />
                    <div className='min-w-0'>
                        <p className='font-semibold text-gray-900 truncate'>
                            {esUsuario ? `${user.nombre} ${user.apellido}` : 'Centro Universitario Tianguistenco'}
                        </p>
                        {esUsuario && (
                            <span className='inline-block mt-0.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold'>
                                {ROLES[tipo]}
                            </span>
                        )}
                        {user.carrera?.carrera && <p className='mt-1 text-xs text-gray-500 truncate'>{user.carrera.carrera}</p>}
                    </div>
                </div>
                {esUsuario && (
                    <button
                        type='button'
                        onClick={handleMyProfile}
                        className='mt-4 w-full py-2 rounded-xl border-2 border-green-600 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors'
                    >
                        Ver mi perfil
                    </button>
                )}
            </div>

            {/* Accesos segun el rol */}
            {esUsuario && (
                <div className='px-2 py-2 border-t border-gray-100'>
                    {tipo === "student" && <>
                        <Opcion icono={FiFolder} onClick={() => irAPestana(2)}>Mis proyectos</Opcion>
                        <Opcion icono={FiAward} onClick={() => irAPestana(3)}>Mis recomendaciones</Opcion>
                        <Opcion icono={FiUsers} proximamente>Colaboraciones</Opcion>
                    </>}
                    {tipo === "teacher" &&
                        <Opcion icono={FiAward} onClick={() => irAPestana(3)}>Mis recomendaciones</Opcion>
                    }
                    {tipo === "recruiter" && <>
                        <Opcion icono={FiUsers} onClick={handleRecruitment}>Contratar estudiante</Opcion>
                        <Opcion icono={FiBriefcase} proximamente>Publicar empleo</Opcion>
                    </>}
                </div>
            )}

            {/* Cuenta */}
            <div className='px-2 py-2 border-t border-gray-100'>
                {!esUsuario && <Opcion icono={FiLock} onClick={handleAdmin}>Administrador</Opcion>}
                <Opcion icono={FiSettings} onClick={handleInfoMenuUser}>Cuenta y seguridad</Opcion>
            </div>

            <div className='px-2 py-2 border-t border-gray-100'>
                <Opcion icono={FiLogOut} onClick={handleClick} peligro>Cerrar sesión</Opcion>
            </div>
        </div>
    )
}

export default PorfileMenu