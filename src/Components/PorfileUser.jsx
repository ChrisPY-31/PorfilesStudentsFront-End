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
import LanguageForm from './LanguageForm';
import { NIVELES_IDIOMA } from '../helpers';
import ContactForm from './ContactForm';
import Habilities from './Habilities';
import { useAppSelector } from '../Hooks/store';
import { useUserAccount } from '../Hooks/useUserAccount';
import MenuContact from './MenuContact';

const PorfileUser = ({ user, myAccount, tipo }) => {
    const [updateAccount, setUpdateAccount] = useState(false);
    const [menuSkillUser, setMenuSkillUser] = useState(false)
    const [menuIdiomas, setMenuIdiomas] = useState(false)
    // null = cerrado, {} = nueva, educacion = editando
    const [educacionEnForm, setEducacionEnForm] = useState(null)
    const [menuRedesContacto, setMenuRedesContacto] = useState(false)
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
        habilidades: habilidadesUser,
        lenguajes,
        redContactos,
        educaciones
    } = user;

    const habilidades = habilidadesUser ?? []
    const idiomas = lenguajes ?? []
    const etiquetaNivel = (nivel) => NIVELES_IDIOMA.find(n => n.value === nivel)?.label ?? nivel
    // La mas reciente primero (fechas "YYYY-MM-DD" se comparan como texto)
    const educacionesOrdenadas = [...(educaciones ?? [])]
        .sort((a, b) => (b.fechaInicio ?? "").localeCompare(a.fechaInicio ?? ""))
    const tecnologias = habilidades.filter(h => h.tipo === "TECNOLOGIA")
    const aptitudes = habilidades.filter(h => h.tipo === "APTITUD")


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
                user={user}
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
                            {myAccount && <IoMdAdd className='size-5 cursor-pointer' onClick={() => setEducacionEnForm({})} />}
                        </div>
                        {
                            educacionesOrdenadas.length > 0 ?
                                <div className='mt-1'>
                                    {educacionesOrdenadas.map(educacion => (
                                        <Educations
                                            key={educacion.idEducacion}
                                            educacion={educacion}
                                            myAccount={myAccount}
                                            onEdit={() => setEducacionEnForm(educacion)}
                                        />
                                    ))}
                                </div>
                                : <Mensaje mensaje={"No hay educaciones agregadas aún."} />}

                    </div>

                </div>

                <div className='w-1/4'>
                    <div className='relative rounded-xl mt-4 p-4 min-h-[100px] border border-gray-200 '>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl font-semibold'>Habilidades</h3>
                            {myAccount && (habilidades.length > 0
                                ? <SlPencil className='size-5 cursor-pointer' onClick={() => setMenuSkillUser(true)} />
                                : <IoMdAdd className='size-5 cursor-pointer' onClick={() => setMenuSkillUser(true)} />)}
                        </div>
                        {habilidades.length > 0
                            ? <>
                                <Habilities titulo="Tecnologías" tipo="TECNOLOGIA" habilidades={tecnologias} />
                                <Habilities titulo="Aptitudes" tipo="APTITUD" habilidades={aptitudes} />
                            </>
                            : <Mensaje mensaje={"No hay habilidades agregadas aún."} />}

                    </div>

                    <div className='relative rounded-xl mt-4 p-4 min-h-[100px] border border-gray-200'>
                        <div className='flex justify-between items-center'>
                            <h3 className='text-xl font-semibold'>Idiomas</h3>
                            {myAccount && (idiomas.length > 0
                                ? <SlPencil className='size-5 cursor-pointer' onClick={() => setMenuIdiomas(true)} />
                                : <IoMdAdd className='size-5 cursor-pointer' onClick={() => setMenuIdiomas(true)} />)}
                        </div>
                        {idiomas.length > 0
                            ? <ul className='mt-3 space-y-2'>
                                {idiomas.map(idioma => (
                                    <li key={idioma.idIdioma} className='flex items-center justify-between gap-2 text-sm'>
                                        <span className='font-medium text-gray-800'>{idioma.nombre}</span>
                                        <span className='px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium'>
                                            {etiquetaNivel(idioma.nivel)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            : <Mensaje mensaje={"No hay idiomas agregados aún."} />}
                    </div>


                </div>
            </div>
            {updateAccount && <EditProfileForm
                user={user}
                onClose={() => setUpdateAccount(false)}
                tipo={tipo}
            />}
            {menuIdiomas && <LanguageForm
                idiomasActuales={idiomas}
                onCancel={() => setMenuIdiomas(false)}
            />}
            {educacionEnForm && <EducationForm
                educacion={educacionEnForm}
                onClose={() => setEducacionEnForm(null)}
            />}
            {menuSkillUser && <SkillForm
                habilidadesActuales={habilidades}
                onCancel={() => setMenuSkillUser(false)}
            />}

            {menuRedesContacto && <ContactForm
                updateContact={updateContact}
                contactosExistentes={redContactos}
                onClose={() => setUpdateContact([])}
                onCancel={() => {
                    setMenuRedesContacto(false)
                    setUpdateContact([])
                }}
            />
            }

            {
                menuContact && <MenuContact
                    nombreUser={`${user.nombre} ${user.apellido}`}
                    contactos={redContactos}
                    onClose={() => setMenuContact(false)}
                    myAccount={myAccount}
                    onAgregarContacto={() => {
                        setUpdateContact([])
                        setMenuRedesContacto(true)
                    }}
                    onEditarContactos={() => {
                        setUpdateContact(redContactos)
                        setMenuRedesContacto(true)
                    }}
                />
            }
        </div>
    )
}

export default PorfileUser