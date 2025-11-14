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
import { useCreateSocialLinkMutation } from "../services/UserSlice";
import { toast } from "sonner";
import { useUserAccount } from "../Hooks/useUserAccount";

const ContactForm = ({ onSubmit, onCancel, initialContacts = [], updateContact, onClose }) => {
    const [formErrors, setFormErrors] = useState({});
    const [selectedType, setSelectedType] = useState("");
    const [contacts, setContacts] = useState(initialContacts);
    const [editingContact, setEditingContact] = useState(null);
    const { getUserByUsername } = useUserAccount();
    const { userId, username, userToken } = useAppSelector(state => state.users)
    const [newSocialLink, setNewSocialLink] = useState([])
    const [createSocialLink, { isSuccess, error }] = useCreateSocialLinkMutation()


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
            console.log(error)
        }
    }, [isSuccess, error])


    const contactTypes = [
        {
            value: "LINKEDIN",
            label: "LinkedIn",
            icon: <IoLogoLinkedin className="h-5 w-5 text-blue-600" />,
            placeholder: "https://linkedin.com/in/tu-perfil",
            color: "blue"
        },
        {
            value: "EMAIL",
            label: "Email",
            icon: <IoMailOutline className="h-5 w-5 text-red-500" />,
            placeholder: "tu.email@ejemplo.com",
            color: "red"
        },
        {
            value: "PHONE",
            label: "Teléfono",
            icon: <IoCallOutline className="h-5 w-5 text-green-500" />,
            placeholder: "+52 123 456 7890",
            color: "green"
        },
        {
            value: "WEB",
            label: "Sitio Web",
            icon: <IoGlobeOutline className="h-5 w-5 text-purple-500" />,
            placeholder: "https://tu-sitio-web.com",
            color: "purple"
        },
        {
            value: "OTHER",
            label: "Otro",
            icon: <IoEllipsisHorizontal className="h-5 w-5 text-gray-500" />,
            placeholder: "Agrega el enlace o información",
            color: "gray"
        }
    ];

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

            const formateRed = (red) => {
                const redes = {
                    "LINKEDIN": 1,
                    "EMAIL": 2,
                    "PHONE": 3,
                    "WEB": 4
                };
                return redes[red] || null;
            }

            const contactData = {
                id: {
                    idPerson: userId,
                    idContact: formateRed(values.red)
                },
                url: values.valor,
                contactos: {
                    idContacto: editingContact?.contactos?.idContacto || null,
                    red: values.red
                }
            };

            if (editingContact) {
                setContacts(contacts.map(c =>
                    c.id.contactId === editingContact.id.contactId ? contactData : c
                ));
            } else {
                setContacts([...contacts, contactData]);
                const { id, url } = contactData;
                setNewSocialLink([{ id, url }, ...contacts])
            }

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

    const handleDeleteContact = (idContact) => {
        console.log(idContact)
        setContacts(contacts.filter(c => c.id.idContact !== idContact));
    };

    const handleFinalSubmit = async () => {
        console.log("entro aqui")
        const token = localStorage.getItem("token")
        await createSocialLink({ newSocialLink, token });
        console.log("salio aqui")
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
                                        <div key={contact.id?.idContact} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
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
                                                    onClick={() => handleDeleteContact(contact.id.idContact)}
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
                                id: editingContact?.id || { contactId: "", personId: null },
                                red: editingContact?.contactos?.red || "",
                                valor: editingContact?.url || "",
                                otroTipo: ""
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
                                            {contactTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedType(type.value);
                                                        setFieldValue("red", type.value);
                                                        if (type.value !== "OTHER") {
                                                            setFieldValue("otroTipo", "");
                                                        }
                                                        if (!editingContact || editingContact.contactos.red !== type.value) {
                                                            setFieldValue("valor", "");
                                                        }
                                                    }}
                                                    className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 ${selectedType === type.value
                                                        ? `border-${type.color}-500 bg-${type.color}-50 scale-105`
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

                                    {selectedType === "OTHER" && (
                                        <div className="animate-fade-in">
                                            <label className="flex items-center text-base font-medium text-gray-700 mb-2">
                                                <IoEllipsisHorizontal className="h-5 w-5 text-gray-500 mr-2" />
                                                Especifica el tipo
                                            </label>
                                            <Field
                                                name="otroTipo"
                                                type="text"
                                                className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                                placeholder="Ej: GitHub, Twitter, Instagram, etc."
                                            />
                                        </div>
                                    )}

                                    {selectedType && (
                                        <div className="animate-fade-in">
                                            <label className="flex items-center text-base font-medium text-gray-700 mb-2">
                                                {contactTypes.find(t => t.value === selectedType)?.icon}
                                                <span className="ml-2">
                                                    {selectedType === "OTHER" ? "Valor del contacto" : contactTypes.find(t => t.value === selectedType)?.label}
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

                                    <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !selectedType || !values.valor || (selectedType === "OTHER" && !values.otroTipo)}
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