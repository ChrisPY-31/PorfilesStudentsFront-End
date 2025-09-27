import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Proyects from './Proyects';
import Recommendations from './Recommendations';
import PorfileUser from './PorfileUser';

export const PersonMenu = () => {

    const [menu, setMenu] = useState(1);

    return (
        <div className='mt-10'>
            <div className='w-[80%] mx-auto flex justify-around items-center shadow-md py-2 rounded'>
                <h2 className='cursor-pointer' onClick={() => setMenu(1)}>Perfil</h2>
                <h2 className='cursor-pointer' onClick={() => setMenu(2)}>Proyectos</h2>
                <h3 className='cursor-pointer' onClick={() => setMenu(3)}>Recomendaciones</h3>
            </div>
            <div className='mt-10'>
                {menu === 1 && <PorfileUser />}
                {menu === 2 && <Proyects />}
                {menu === 3 && <Recommendations />}
            </div>
        </div>
    )
}
