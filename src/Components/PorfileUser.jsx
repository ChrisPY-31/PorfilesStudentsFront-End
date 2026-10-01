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

// Recuadro con el mismo espaciado para todas las secciones del perfil
const Seccion = ({ titulo, accion, children }) => (
    <section className='bg-white rounded-2xl border border-gray-200 p-6'>
        <div className='flex items-center justify-between gap-3 mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>{titulo}</h2>
            {accion}
        </div>
        {children}
    </section>
)

const BotonAccion = ({ icono: Icono, etiqueta, onClick }) => (
    <button
        type='button'
        onClick={onClick}
        title={etiqueta}
        aria-label={etiqueta}
        className='p-2 -m-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors'
    >
        <Icono className='size-5' />
    </button>
)

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
        <div className='w-full max-w-5xl mx-auto px-4 pb-12'>
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

            <div className='mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
                <div className='lg:col-span-2 space-y-6'>
                    <Seccion titulo='Acerca de'>
                        {descripcion
                            ? <p className='text-gray-700 leading-relaxed whitespace-pre-line break-words'>{descripcion}</p>
                            : <Mensaje mensaje={"Aún no hay una descripción."} />}
                    </Seccion>

                    <Seccion
                        titulo='Educación'
                        accion={myAccount && <BotonAccion icono={IoMdAdd} etiqueta='Agregar educación' onClick={() => setEducacionEnForm({})} />}
                    >
                        {educacionesOrdenadas.length > 0
                            ? <div className='-my-4'>
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
                    </Seccion>
                </div>

                <div className='space-y-6'>
                    <Seccion
                        titulo='Habilidades'
                        accion={myAccount && <BotonAccion
                            icono={habilidades.length > 0 ? SlPencil : IoMdAdd}
                            etiqueta={habilidades.length > 0 ? 'Editar habilidades' : 'Agregar habilidades'}
                            onClick={() => setMenuSkillUser(true)}
                        />}
                    >
                        {habilidades.length > 0
                            ? <div className='-mt-3 space-y-1'>
                                <Habilities titulo="Tecnologías" tipo="TECNOLOGIA" habilidades={tecnologias} />
                                <Habilities titulo="Aptitudes" tipo="APTITUD" habilidades={aptitudes} />
                            </div>
                            : <Mensaje mensaje={"No hay habilidades agregadas aún."} />}
                    </Seccion>

                    <Seccion
                        titulo='Idiomas'
                        accion={myAccount && <BotonAccion
                            icono={idiomas.length > 0 ? SlPencil : IoMdAdd}
                            etiqueta={idiomas.length > 0 ? 'Editar idiomas' : 'Agregar idiomas'}
                            onClick={() => setMenuIdiomas(true)}
                        />}
                    >
                        {idiomas.length > 0
                            ? <ul className='space-y-3'>
                                {idiomas.map(idioma => (
                                    <li key={idioma.idIdioma} className='flex items-center justify-between gap-2 text-sm'>
                                        <span className='font-medium text-gray-800'>{idioma.nombre}</span>
                                        <span className='px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium'>
                                            {etiquetaNivel(idioma.nivel)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            : <Mensaje mensaje={"No hay idiomas agregados aún."} />}
                    </Seccion>
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