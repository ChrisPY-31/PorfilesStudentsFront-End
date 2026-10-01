import React, { useEffect, useState } from 'react'

import Proyects from './Proyects';
import Recommendations from '../Components/Recommendations';
import PorfileUser from '../Components/PorfileUser';
import { useAppSelector } from '../Hooks/store';
import { useGetUserByIdQuery } from '../services/UserSlice';
import { IoRibbonOutline } from 'react-icons/io5';
import PerfilTabs from '../Components/PerfilTabs';

export const PersonMenu = () => {

    const [menu, setMenu] = useState(1);
    const token = localStorage.getItem("token");
    const { idStudent } = useAppSelector(state => state.students)
    const { isLoading, data, refetch } = useGetUserByIdQuery({ id: idStudent, token })
    const [user, setUser] = useState({});
    const { user: yo, userId } = useAppSelector(state => state.users)
    const [recomendarAhora, setRecomendarAhora] = useState(false)

    // Un maestro viendo el perfil de un alumno puede recomendarlo desde cualquier pestaña
    const puedoRecomendar = yo?.tipo === 'teacher' && user?.tipo === 'student'
    const yaLoRecomende = user?.recomendaciones?.some(r => r.maestro?.id === userId)

    useEffect(() => {
        if (data) {
            setUser(data.object);
        }
    }, [data, isLoading])

    return (
        <div className='mt-8'>
            <PerfilTabs
                activa={menu}
                onChange={setMenu}
                pestanas={[
                    { id: 1, label: 'Perfil' },
                    ...(user?.tipo === 'student' ? [{ id: 2, label: 'Proyectos' }] : []),
                    ...(user?.tipo !== 'recruiter' ? [{ id: 3, label: 'Recomendaciones' }] : []),
                ]}
                extra={puedoRecomendar && (
                    <button
                        type='button'
                        onClick={() => { setMenu(3); setRecomendarAhora(true) }}
                        className='shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors'
                    >
                        <IoRibbonOutline className='size-4' />
                        {yaLoRecomende ? 'Editar mi recomendación' : 'Recomendar'}
                    </button>
                )}
            />
            <div className='mt-8'>
                {Object.keys(user).length > 0 && <div>
                    {menu === 1 && <PorfileUser user={user} />}
                    {menu === 2 && <Proyects proyectos={user.proyectos} />}
                    {menu === 3 && <Recommendations
                        recomendaciones={user.recomendaciones}
                        perfil={user}
                        onGuardado={refetch}
                        abrirRecomendar={recomendarAhora}
                        onRecomendarAbierto={() => setRecomendarAhora(false)}
                    />}
                </div>
                }
            </div>
        </div>
    )
}
