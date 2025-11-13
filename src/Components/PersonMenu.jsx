import React, { useEffect, useState } from 'react'

import Proyects from './Proyects';
import Recommendations from './Recommendations';
import PorfileUser from './PorfileUser';
import { useAppSelector } from '../Hooks/store';
import { useGetUserByIdQuery } from '../services/UserSlice';

export const PersonMenu = () => {

    const [menu, setMenu] = useState(1);
    const token = localStorage.getItem("token");
    const { idStudent } = useAppSelector(state => state.students)
    const { isLoading, error, data } = useGetUserByIdQuery({ id: idStudent, token })
    const [user, setUser] = useState({});

    useEffect(() => {
        if (data) {
            console.log(data)
            setUser(data.object);
        }
    }, [data, isLoading])

    return (
        <div className='mt-10 min-h-[100vh]'>
            <div className='w-[80%] mx-auto flex justify-around items-center shadow-md py-2 rounded'>
                <h2 className='cursor-pointer' onClick={() => setMenu(1)}>Perfil</h2>
                <h2 className='cursor-pointer' onClick={() => setMenu(2)}>Proyectos</h2>
                <h3 className='cursor-pointer' onClick={() => setMenu(3)}>Recomendaciones</h3>
            </div>
            <div className='mt-10'>
                {Object.keys(user).length > 0 && <div>
                    {menu === 1 && <PorfileUser user={user} />}
                    {menu === 2 && <Proyects proyectos={user.proyectos} />}
                    {menu === 3 && <Recommendations recomendaciones={user.recomendaciones} />}
                </div>
                }
            </div>
        </div>
    )
}
