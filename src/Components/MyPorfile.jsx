import React, { useEffect } from 'react'
import { useAppSelector } from '../Hooks/store'
import PorfileUser from './PorfileUser';
import Proyects from './Proyects';
import Recommendations from './Recommendations';

const MyPorfile = () => {

    const { user } = useAppSelector(state => state.users)
    const [menu, setMenu] = React.useState(1);


    return (
        <div className='mt-10 min-h-[100vh] '>
            <div className='w-[80%] mx-auto flex justify-around items-center shadow-md py-2 rounded'>
                <h2 className='cursor-pointer' onClick={() => setMenu(1)}>Perfil</h2>
                {user.tipo === 'student' ? <h2 className='cursor-pointer' onClick={() => setMenu(2)}>Proyectos</h2> : null}
                {user.tipo === "recruiter" ? null : <h3 className='cursor-pointer' onClick={() => setMenu(3)}>Recomendaciones</h3>}
            </div>
            <div className='mt-10'>
                {menu === 1 && <PorfileUser user={user} myAccount={true} tipo={user.tipo} />}
                {menu === 2 && <Proyects proyectos={user.proyectos} myAccount={true} tipo={user.tipo} />}
                {menu === 3 && <Recommendations recomendaciones={user.recomendaciones} myAccount={true} tipo={user.tipo} user={user} />}
            </div>
        </div>
    )
}

export default MyPorfile