import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser } from "react-icons/fi";
import { FiFolder } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { toast } from 'sonner';

const PorfileMenu = ({ setMenuProfile }) => {

    const navigate = useNavigate();

    const handleClick = () => {
        setMenuProfile(false);
        toast.message("Cerrando sesión...", {
            duration: 1000,
        })
        setTimeout(() => {
            navigate("/");
            localStorage.removeItem("token");
        }, 1500)
    }
    return (
        <div className="absolute top-14 left-5 w-[300px] h-min-[400px] p-4 bg-white rounded shadow-lg z-50">
            <div className='border-2 border-green-800 h-full rounded-sm '>
                <h2 className='font-semibold text-xl mb-2'>UniConnect</h2>
                <div className='p-3 '>
                    <p className='text-center'>Ingeniería en software</p>
                    <div className='flex justify-around items-center my-2'>
                        <div>
                            <img className='size-16 rounded-full mx-auto' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZtWBVfAYfadoSkWDVFTm_TdTD-8me4oTwog&s" alt="" />
                        </div>
                        <div>
                            <p className='font-semibold'>Christian Peña</p>
                            <p className='text-sm text-gray-600'>correo@correo.com</p>
                        </div>
                    </div>
                    <button>Editar Perfil</button>
                </div>
                <div className='flex flex-col my-2 '>
                    <Link className='hover:bg-emerald-500/7 p-2'><FiUser className='inline text-green-800' /> Mi Perfil</Link>
                    <Link className='hover:bg-emerald-500/7 p-2'><FiFolder className='inline text-green-800' /> Mis proyectos</Link>
                    <Link className='hover:bg-emerald-500/7 p-2'><FiUsers className='inline text-green-800' /> Colaboraciones</Link>
                    <Link className='hover:bg-emerald-400/7 p-2'><FiLock className='inline text-green-800' to={"/manager"}/> Administrador</Link>
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