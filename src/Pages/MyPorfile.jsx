import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '../Hooks/store'
import PorfileUser from '../Components/PorfileUser';
import Proyects from './Proyects';
import Recommendations from '../Components/Recommendations';
import PerfilTabs from '../Components/PerfilTabs';
import { useUserAccount } from '../Hooks/useUserAccount';

const MyPorfile = () => {

    const { user, username, userToken } = useAppSelector(state => state.users)
    const { getUserByUsername } = useUserAccount()
    const location = useLocation()
    const [menu, setMenu] = React.useState(location.state?.pestana ?? 1);

    // Al abrir una notificacion se llega con la pestaña indicada, aunque ya se este en el perfil
    useEffect(() => {
        if (location.state?.pestana) setMenu(location.state.pestana)
    }, [location.key, location.state?.pestana])


    return (
        <div className='mt-8'>
            <PerfilTabs
                activa={menu}
                onChange={setMenu}
                pestanas={[
                    { id: 1, label: 'Perfil' },
                    ...(user.tipo === 'student' ? [{ id: 2, label: 'Proyectos' }] : []),
                    ...(user.tipo !== 'recruiter' ? [{ id: 3, label: 'Recomendaciones' }] : []),
                ]}
            />
            <div className='mt-8'>
                {menu === 1 && <PorfileUser user={user} myAccount={true} tipo={user.tipo} />}
                {menu === 2 && <Proyects proyectos={user.proyectos} myAccount={true} tipo={user.tipo} />}
                {menu === 3 && <Recommendations
                    recomendaciones={user.recomendaciones}
                    perfil={user}
                    esMiPerfil
                    onGuardado={() => getUserByUsername(username, userToken).catch(() => {})}
                />}
            </div>
        </div>
    )
}

export default MyPorfile