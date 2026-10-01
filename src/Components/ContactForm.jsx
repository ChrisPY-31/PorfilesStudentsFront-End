import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
    IoLogoLinkedin,
    IoMailOutline,
    IoCallOutline,
    IoGlobeOutline,
    IoAddCircleOutline,
    IoEllipsisHorizontal,
    IoPencilOutline,
    IoTrashOutline,
    IoCloseSharp
} from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useCreateSocialLinkMutation, useDeleteSocialLinkMutation, useGetContactTypesQuery } from "../services/UserSlice";
import { toast } from "sonner";
import { useUserAccount } from "../Hooks/useUserAccount";
import { obtenerMensajeError } from "../helpers";

const ContactForm = ({ onSubmit, onCancel, initialContacts = [], updateContact = [], contactosExistentes = [], onClose }) => {
    const [formErrors, setFormErrors] = useState({});
    const [selectedType, setSelectedType] = useState("");
    const [contacts, setContacts] = useState(initialContacts);
    const [editingContact, setEditingContact] = useState(null);
    const { getUserByUsername } = useUserAccount();
    const { userId, username, userToken } = useAppSelector(state => state.users)
    const [createSocialLink, { isSuccess, error }] = useCreateSocialLinkMutation()
    const [deleteSocialLink] = useDeleteSocialLinkMutation()
    // Catalogo de redes del back: [{ idContacto, red }]
    const { data: tiposContacto = [] } = useGetContactTypesQuery({ token: userToken })


    useEffect(() => {
        if (updateContact.length > 0) {
            setContacts(updateContact)

        }
    }, [updateContact])

    useEffect(() => {
        if (isSuccess) {
            toast.success("Contactos se agregaron correctamente ")
            getUserByUsername(username, userToken);

            setTimeout(() => {
                onCancel()
            }, [1000])
        }

        if (error) {
            toast.error(obtenerMensajeError(error, "No se pudieron guardar los contactos"))
        }
    }, [isSuccess, error])


    // Solo la parte visual de cada red; las redes disponibles vienen del back (/contact)
    // Las clases van completas para que Tailwind las genere
    const estiloRedes = {
        LINKEDIN: {
            label: "LinkedIn",
            icon: <IoLogoLinkedin className="h-5 w-5 text-blue-600" />,
            placeholder: "https://linkedin.com/in/tu-perfil",
            selectedClass: "border-blue-500 bg-blue-50 scale-105"
        },
        EMAIL: {
            label: "Email",
            icon: <IoMailOutline className="h-5 w-5 text-red-500" />,
            placeholder: "tu.email@ejemplo.com",
            selectedClass: "border-red-500 bg-red-50 scale-105"
        },
        PHONE: {
            label: "Teléfono",
            icon: <IoCallOutline className="h-5 w-5 text-green-500" />,
            placeholder: "+52 123 456 7890",
            selectedClass: "border-green-500 bg-green-50 scale-105"
        },
        WEB: {
            label: "Sitio Web",
            icon: <IoGlobeOutline className="h-5 w-5 text-purple-500" />,
            placeholder: "https://tu-sitio-web.com",
            selectedClass: "border-purple-500 bg-purple-50 scale-105"
        }
    };

    const estiloDefault = (red) => ({
        label: red,
        icon: <IoEllipsisHorizontal className="h-5 w-5 text-gray-500" />,
        placeholder: "Agrega el enlace",
        selectedClass: "border-gray-500 bg-gray-50 scale-105"
    });

    const contactTypes = tiposContacto.map(tipo => ({
        ...(estiloRedes[tipo.red] ?? estiloDefault(tipo.red)),
        value: tipo.red,
        idContacto: tipo.idContacto
    }));

    // Una red ya usada (guardada o agregada en este formulario) no se puede volver a elegir.
    // Al editar se bloquea la red: el POST del back solo agrega o sobrescribe, no cambia de red
    const redesUsadas = new Set([
        ...contactosExistentes.map(c => c.contactos?.red),
        ...contacts.map(c => c.contactos?.red)
    ]);
    const redDisponible = (red) => editingContact
        ? editingContact.contactos?.red === red
        : !redesUsadas.has(red);

    const getContactIcon = (type) => {
        const contactType = contactTypes.find(t => t.value === type);
        return contactType ? contactType.icon : <IoEllipsisHorizontal className="h-4 w-4 text-gray-500" />;
    };

    const getContactLabel = (type) => {
        const contactType = contactTypes.find(t => t.value === type);
        return contactType ? contactType.label : "Otro";
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setFormErrors({});

            const tipo = tiposContacto.find(t => t.red === values.red);
            if (!tipo) {
                setFormErrors({ _general: "Este tipo de contacto no esta disponible en el servidor" });
                setSubmitting(false);
                return;
            }

            const contactData = {
                id: {
                    idPerson: userId,
                    idContact: tipo.idContacto
                },
                url: values.valor,
                contactos: {
                    idContacto: tipo.idContacto,
                    red: values.red
                }
            };

            // Una persona solo puede tener un contacto por red (la PK es idPerson + idContact)
            const sinDuplicado = contacts.filter(c =>
                c.contactos.red !== values.red && (!editingContact || c.contactos.red !== editingContact.contactos.red)
            );
            setContacts([...sinDuplicado, contactData]);

            resetForm();
            setSelectedType("");
            setEditingContact(null);
            setSubmitting(false);

        } catch (err) {
            const errorMap = {};
            errorMap._general = "Ocurrió un error en la validación";
            setFormErrors(errorMap);
            setSubmitting(false);
        }
    };

    const handleEditContact = (contact) => {
        setEditingContact(contact);
        setSelectedType(contact.contactos.red);
    };

    const handleDeleteContact = async (idContact) => {
        const guardado = updateContact?.some(c => c.contactos?.idContacto === idContact);
        if (guardado) {
            const token = localStorage.getItem("token")
            const result = await deleteSocialLink({ idContact, token });
            if (result.error) {
                toast.error(obtenerMensajeError(result.error, "No se pudo eliminar el contacto"));
                return;
            }
            getUserByUsername(username, userToken);
        }
        setContacts(contacts.filter(c => c.contactos?.idContacto !== idContact));
    };

    const handleFinalSubmit = async () => {
        const token = localStorage.getItem("token")
        const newSocialLink = contacts.map(({ contactos, url }) => ({
            id: { idPerson: userId, idContact: contactos.idContacto },
            url,
        }));
        await createSocialLink({ newSocialLink, token });
    };


    const handleCloseMenu = () => {
        onClose()
        onCancel()
    }

    return (
        <div className="absolute inset-0 z-[100] flex justify-center items-center">
            <IoCloseSharp
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200 size-7 cursor-pointer z-10"
                onClick={handleCloseMenu}
            />
            <div className="bg-gradient-to-br from-gray-50 flex items-center justify-center p-4 w-full">
                <div className="w-full max-w-2xl">
                    <div className="bg-white py-6 px-6 shadow-2xl rounded-2xl border border-green-100">
                        <div className="text-center mb-6 flex gap-3 justify-center items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <IoGlobeOutline className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                Gestionar Contactos
                            </h2>
                        </div>

                        {contacts.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Tus contactos</h3>
                                <div className="space-y-2">
                                    {contacts.map((contact) => (
                                        <div key={contact.contactos?.idContacto} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                {getContactIcon(contact.contactos.red)}
                                                <div>
                                                    <p className="font-medium text-gray-700">{getContactLabel(contact.contactos.red)}</p>
                                                    <p className="text-sm text-gray-500">{contact.url}</p>
                                                    {contact.contactos.idContacto && (
                                                        <p className="text-xs text-gray-400">ID: {contact.contactos.idContacto}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditContact(contact)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <IoPencilOutline className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteContact(contact.contactos?.idContacto)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <IoTrashOutline className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Formik
                            initialValues={{
                                red: editingContact?.contactos?.red || "",
                                valor: editingContact?.url || ""
                            }}
                            onSubmit={handleSubmit}
                            enableReinitialize
                            validateOnChange={false}
                            validateOnBlur={false}
                        >
                            {({ isSubmitting, resetForm, values, setFieldValue }) => (
                                <Form className="space-y-6">
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-3">
                                            {editingContact ? "Editando contacto" : "Agregar nuevo contacto"}
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {contactTypes.length === 0 && (
                                                <p className="col-span-3 text-sm text-gray-500">Cargando redes...</p>
                                            )}
                                            {contactTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    disabled={!redDisponible(type.value)}
                                                    title={!redDisponible(type.value) ? "Ya tienes un contacto de esta red" : undefined}
                                                    onClick={() => {
                                                        setSelectedType(type.value);
                                                        setFieldValue("red", type.value);
                                                        if (!editingContact || editingContact.contactos.red !== type.value) {
                                                            setFieldValue("valor", "");
                                                        }
                                                    }}
                                                    className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${selectedType === type.value
                                                        ? type.selectedClass
                                                        : "border-gray-300 bg-white hover:border-gray-400 hover:scale-105"
                                                        }`}
                                                >
                                                    {type.icon}
                                                    <span className="text-sm font-medium text-gray-700 text-center">
                                                        {type.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedType && (
                                        <div className="animate-fade-in">
                                            <label className="flex items-center text-base font-medium text-gray-700 mb-2">
                                                {contactTypes.find(t => t.value === selectedType)?.icon}
                                                <span className="ml-2">
                                                    {contactTypes.find(t => t.value === selectedType)?.label}
                                                </span>
                                            </label>
                                            <Field
                                                name="valor"
                                                type="text"
                                                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                                placeholder={contactTypes.find(t => t.value === selectedType)?.placeholder}
                                            />
                                        </div>
                                    )}

                                    {formErrors._general && (
                                        <div className="text-sm text-red-600 font-medium">
                                            {formErrors._general}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !selectedType || !values.valor}
                                                className="flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <IoAddCircleOutline className="h-4 w-4 mr-2" />
                                                {editingContact ? "Actualizar" : "Agregar"} Contacto
                                            </button>

                                            {editingContact && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingContact(null);
                                                        setSelectedType("");
                                                        resetForm();
                                                    }}
                                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 font-semibold text-sm"
                                                >
                                                    Cancelar Edición
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                setSelectedType("");
                                                setEditingContact(null);
                                                onCancel();
                                            }}
                                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 font-semibold hover:scale-105 transform"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleFinalSubmit}
                                            disabled={contacts.length === 0}
                                            className="flex items-center justify-center px-8 py-3 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;