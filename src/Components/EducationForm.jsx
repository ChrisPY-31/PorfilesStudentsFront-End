import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
    IoSchoolOutline,
    IoBookOutline,
    IoCalendarOutline,
    IoDocumentTextOutline,
    IoChevronDownOutline,
    IoAddCircleOutline,
    IoCloseSharp,
    IoCheckmarkCircleOutline,
    IoRadioButtonOffOutline
} from "react-icons/io5";
import { useCreateEducationUserMutation, useUpdateEducationUserMutation } from "../services/UserSlice";
import { useAppSelector } from "../Hooks/store";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useUserAccount } from "../Hooks/useUserAccount";

const EducationForm = ({ onCancel, objectEducation, setObjectEducation }) => {
    const [formErrors, setFormErrors] = useState({});
    const [createEducationUser, { isSuccess, error, data }] = useCreateEducationUserMutation();
    const [updateEducationUser, { isSuccess: success }] = useUpdateEducationUserMutation();
    const { userId, username, userToken } = useAppSelector(state => state.users);
    const [enProgreso, setEnProgreso] = useState(false);
    const { getUserByUsername } = useUserAccount();

    useEffect(() => {

        if (isSuccess) {
            toast.success("educacion creada con exito");
            setTimeout(() => {
                onCancel()
            }, 1000)
            return;
        }

        if (success) {
            toast.success("educacion actualizada con exito");
            setTimeout(() => {
                onCancel()
            }, 1000)
            return
        }

    }, [isSuccess, success])


    const educationTypes = [
        {
            value: "BACHELOR",
            label: "Licenciatura",
            icon: <IoBookOutline className="h-5 w-5 text-blue-600" />,
            borderColor: "border-blue-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            textDarkColor: "text-blue-700"
        },
        {
            value: "MASTER",
            label: "Maestría",
            icon: <IoSchoolOutline className="h-5 w-5 text-purple-600" />,
            borderColor: "border-purple-500",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            textDarkColor: "text-purple-700"
        },
        {
            value: "PHD",
            label: "Doctorado",
            icon: <IoSchoolOutline className="h-5 w-5 text-red-600" />,
            borderColor: "border-red-500",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
            textDarkColor: "text-red-700"
        },
        {
            value: "COURSE",
            label: "Curso",
            icon: <IoDocumentTextOutline className="h-5 w-5 text-green-600" />,
            borderColor: "border-green-500",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            textDarkColor: "text-green-700"
        },
        {
            value: "DIPLOMA",
            label: "Diplomado",
            icon: <IoDocumentTextOutline className="h-5 w-5 text-orange-600" />,
            borderColor: "border-orange-500",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            textDarkColor: "text-orange-700"
        }
    ];


    const handleSubmit = async (values, { setSubmitting }) => {
        let token = localStorage.getItem("token");

        try {
            setFormErrors({});

            if (Object.keys(objectEducation).length > 0) {
                const updateEducation = {
                    idEducacion: objectEducation.idEducacion,
                    idPersona: userId,
                    ...values,

                }
                await updateEducationUser({ updateEducation, token })
                getUserByUsername(username, userToken);
                return
            }

            values.idPersona = userId

            const fechaInicio = values.fechaInicio ? new Date(values.fechaInicio) : null;
            const fechaFin = enProgreso ? null : (values.fechaFin ? new Date(values.fechaFin) : null);

            const newEducationUser = {
                ...values,
                fechaInicio: fechaInicio ? fechaInicio.toISOString().split('T')[0] : null,
                fechaFin: fechaFin ? fechaFin.toISOString().split('T')[0] : null
            }
            await createEducationUser({ newEducationUser, token });
            getUserByUsername(username, userToken);
            setSubmitting(false);
        } catch (err) {
            const errorMap = {};
            errorMap._general = "Ocurrió un error en la validación";
            setFormErrors(errorMap);
            setSubmitting(false);
        }
    };


    return (
        <div className="absolute inset-0 z-50 flex justify-center items-center">
            <div className="bg-gradient-to-br from-gray-50 flex items-center justify-center p-4 w-full h-full overflow-y-auto">
                <div className="w-full max-w-2xl my-4">
                    <div className="bg-white py-5 px-6 shadow-2xl rounded-2xl border border-green-100 relative">
                        <IoCloseSharp
                            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200 size-7 cursor-pointer z-10"
                            onClick={() => {
                                setObjectEducation({})
                                onCancel()
                            }}
                        />

                        <div className="text-center mb-5 flex gap-3 justify-center items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <IoSchoolOutline className="h-7 w-7 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Agregar Educación
                            </h2>
                        </div>

                        <Formik
                            initialValues={{
                                institucion: `${objectEducation.institucion ? objectEducation.institucion : ''}`,
                                grado: `${objectEducation.grado ? objectEducation.grado : ''}`,
                                descripcion: `${objectEducation.descripcion ? objectEducation.descripcion : ''}`,
                                educacionTipo: `${objectEducation.educacionTipo ? objectEducation.educacionTipo : ''}`,
                                fechaInicio: `${objectEducation.fechaInicio ? objectEducation.fechaInicio : ''}`,
                                fechaFin: `${objectEducation.fechaFin ? objectEducation.fechaFin : ''}`
                            }}
                            onSubmit={handleSubmit}
                            validateOnChange={false}
                            validateOnBlur={false}
                        >
                            {({ isSubmitting, resetForm, values, setFieldValue }) => (
                                <Form className="space-y-3">
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <IoSchoolOutline className="h-4 w-4 text-blue-500 mr-2" />
                                            Institución
                                        </label>
                                        <Field
                                            name="institucion"
                                            type="text"
                                            className="block w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                            placeholder="Universidad Autónoma del Estado de México"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                <IoBookOutline className="h-4 w-4 text-purple-500 mr-2" />
                                                Grado
                                            </label>
                                            <Field
                                                name="grado"
                                                type="text"
                                                className="block w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                                placeholder="Ingeniería en Software"
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                <IoDocumentTextOutline className="h-4 w-4 text-green-500 mr-2" />
                                                Tipo de Educación
                                            </label>
                                            <div className="relative">
                                                <Field
                                                    as="select"
                                                    name="educacionTipo"
                                                    className="block w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none appearance-none hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 bg-white text-gray-500"
                                                >
                                                    <option value="">Selecciona un tipo</option>
                                                    {educationTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <IoChevronDownOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Selecciona el tipo de educación
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {educationTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setFieldValue("educacionTipo", type.value)}
                                                    className={`p-2 border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center gap-1 ${values.educacionTipo === type.value
                                                        ? `${type.borderColor} ${type.bgColor} scale-105`
                                                        : "border-gray-300 bg-white hover:border-gray-400"
                                                        }`}
                                                >
                                                    <div className={values.educacionTipo === type.value ? type.textColor : 'text-gray-600'}>
                                                        {type.icon}
                                                    </div>
                                                    <span className={`text-xs font-medium text-center ${values.educacionTipo === type.value ? type.textDarkColor : 'text-gray-700'
                                                        }`}>
                                                        {type.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                <IoCalendarOutline className="h-4 w-4 text-blue-500 mr-2" />
                                                Fecha de Inicio
                                            </label>
                                            <Field
                                                name="fechaInicio"
                                                type="date"
                                                className="block w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-gray-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                <IoCalendarOutline className="h-4 w-4 text-red-500 mr-2" />
                                                Fecha de Finalización
                                            </label>
                                            <Field
                                                name="fechaFin"
                                                type="date"
                                                disabled={enProgreso}
                                                className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${enProgreso
                                                    ? "border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500"
                                                    : "border-gray-300 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-700"
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            {enProgreso ? (
                                                <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <IoRadioButtonOffOutline className="h-5 w-5 text-gray-400" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700">En progreso</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEnProgreso(!enProgreso);
                                                if (!enProgreso) {
                                                    setFieldValue("fechaFin", "");
                                                }
                                            }}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enProgreso ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enProgreso ? 'translate-x-5' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                            <IoDocumentTextOutline className="h-4 w-4 text-orange-500 mr-2" />
                                            Descripción
                                        </label>
                                        <Field
                                            as="textarea"
                                            name="descripcion"
                                            rows="3"
                                            className="block w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
                                            placeholder="Describe tus logros académicos, proyectos, actividades extracurriculares..."
                                        />
                                        <div className="flex justify-end mt-1">
                                            <div className="text-xs text-gray-500">
                                                {values.descripcion?.length || 0}/500 caracteres
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                setEnProgreso(false);
                                                onCancel();
                                            }}
                                            className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 font-semibold text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center justify-center px-5 py-2 border border-transparent rounded-lg shadow text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer disabled:opacity-50"
                                        >
                                            <IoAddCircleOutline className="h-4 w-4 mr-1" />
                                            Agregar Educación
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

export default EducationForm;