import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Proyects from './Proyects';
import Recommendations from './Recommendations';
import PorfileUser from './PorfileUser';
import { useAppSelector } from '../Hooks/store';
import { useGetUserByIdQuery } from '../services/UserSlice';
import { useUserAccount } from '../Hooks/useUserAccount';

export const PersonMenu = () => {

    const [menu, setMenu] = useState(1);
    const { userId, userToken, user } = useAppSelector(state => state.users)
    const { data, isLoading, error } = useGetUserByIdQuery({ id: userId, token: userToken });
    const { getUser } = useUserAccount();


    if (data) {
        getUser(data.object)
    }


    if (isLoading) return console.log("cargando")
    if (error) return console.log("errorrrr chavalin")

    return (
        <div className='mt-10 min-h-[100vh]'>
            <div className='w-[80%] mx-auto flex justify-around items-center shadow-md py-2 rounded'>
                <h2 className='cursor-pointer' onClick={() => setMenu(1)}>Perfil</h2>
                <h2 className='cursor-pointer' onClick={() => setMenu(2)}>Proyectos</h2>
                <h3 className='cursor-pointer' onClick={() => setMenu(3)}>Recomendaciones</h3>
            </div>
            <div className='mt-10'>
                {menu === 1 && <PorfileUser user={user} />}
                {menu === 2 && <Proyects proyectos={user.proyectos} />}
                {menu === 3 && <Recommendations recomendaciones={user.recomendaciones} />}
            </div>
        </div>
    )
}
