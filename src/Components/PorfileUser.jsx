import React, { useEffect, useState } from 'react'
import { estudianteById } from '../Estudiantes'
import Person from './Person';
import { SlPencil } from 'react-icons/sl';
import Contactos from './Contactos';
import Educations from './Educations';
import { IoMdAdd } from 'react-icons/io';
import Mensaje from './Mensaje';
import EditProfileForm from './EditPorfileForm';
import EducationForm from './EducationForm';
import SkillForm from './SkillForm';
import ContactForm from './ContactForm';
import Habilities from './Habilities';
import { useAppSelector } from '../Hooks/store';
import { useUserAccount } from '../Hooks/useUserAccount';
import MenuContact from './MenuContact';

const PorfileUser = ({ user, myAccount, tipo }) => {
    const [updateAccount, setUpdateAccount] = useState(false);
    const [menuSkillUser, setMenuSkillUser] = useState(false)
    const [menuEducationForm, setMenuEdutacionForm] = useState(false)
    const [menuRedesContacto, setMenuRedesContacto] = useState(false)
    const [objectEducation, setObjectEducation] = useState({})
    const [updateContact, setUpdateContact] = useState([])
    const [menuContact, setMenuContact] = useState(false)

    const { username, userToken } = useAppSelector(state => state.users)

    const { nombre,
        apellido,
        imagen,
        curriculum,
        especialidad,
        semestre,
        ubicacion,
        carrera,
        descripcion,
        lenguajes,
        redContactos,
        educaciones
    } = user;

    console.log(menuContact)

    return (
        <div className='w-[60%] mx-auto '>
            <Person
                nombre={nombre}
                apellido={apellido}
                imagen={imagen}
                curriculum={curriculum}
                especialidad={especialidad}
                semestre={semestre}
                ubicacion={ubicacion}
                carrera={carrera?.carrera}
                myAccount={myAccount}
                setUpdateAccount={setUpdateAccount}
                contactos={redContactos}
                openMenuContact={() => setMenuContact(true)}
            />


            <div className='flex gap-3'>
                <div className='w-3/4'>
                    <div className='relative rounded-xl mt-4 p-4 min-h-[125px] border border-gray-200'>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl font-semibold'>Acerca de: </h3>
                        </div>
                        <p className="text-[14px] font-li">{descripcion}</p>
                    </div>
                    <div className='relative rounded-xl min-h-[150px] my-5 p-4 border border-gray-200'>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl font-semibold'>Educaciones</h3>
                            {myAccount && <IoMdAdd className='size-5 cursor-pointer' onClick={() => setMenuEdutacionForm(true)} />}
                        </div>
                        {
                            educaciones?.length > 0 ?
                                educaciones?.map(educacion => {
                                    return <Educations
                                        key={educacion.idEducacion}
                                        id={educacion.idEducacion}
                                        myAccount={myAccount}
                                        institucion={educacion.institucion}
                                        grado={educacion.grado}
                                        fechaInicio={educacion.fechaInicio}
                                        fechaFin={educacion.fechaFin}
                                        descripcion={educacion.descripcion}
                                        educacion={educacion.educacionTipo}
                                        openMenu={() => setMenuEdutacionForm(true)}
                                        onEdit={() => setObjectEducation(educacion)}
                                    />
                                })
                                : <Mensaje mensaje={"No hay educaciones agregadas aún."} />}

                    </div>

                </div>

                <div className='w-1/4'>
                    <div className='relative rounded-xl mt-4 p-4 min-h-[100px] border border-gray-200 '>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl font-semibold'>Habilidades </h3>
                            {myAccount && <SlPencil className='size-5  cursor-pointer' />}
                            {myAccount && <IoMdAdd className='size-5 cursor-pointer' onClick={() => setMenuSkillUser(true)} />}
                        </div>
                        {lenguajes?.map(lenguaje => {
                            return <Habilities
                                key={lenguaje.idIdioma}
                                id={lenguaje.idIdioma}
                                nombre={lenguaje.nombre}
                                nivel={lenguaje.nivel.toLowerCase()}
                            />
                        })}

                    </div>

                    
                </div>
            </div>
            {updateAccount && <EditProfileForm
                user={user}
                onClose={() => setUpdateAccount(false)}
                tipo={tipo}
            />}
            {menuEducationForm && <EducationForm
                objectEducation={objectEducation}
                setObjectEducation={setObjectEducation}
                onCancel={() => setMenuEdutacionForm(false)}
            />}
            {menuSkillUser && <SkillForm
                onCancel={() => setMenuSkillUser(false)}
            />}

            {menuRedesContacto && <ContactForm
                updateContact={updateContact}
                onClose={() => setUpdateContact([])}
                onCancel={() => setMenuRedesContacto(false)}
            />
            }

            {
                menuContact && <MenuContact
                    nombreUser={`${user.nombre} ${user.apellido}`}
                    contactos={redContactos}
                    onClose={()=>setMenuContact(false)}
                    myAccount={myAccount}
                    setMenuRedesContacto={setMenuRedesContacto}
                />
            }
        </div>
    )
}

export default PorfileUser