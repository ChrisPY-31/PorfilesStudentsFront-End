import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { toast } from "sonner";
import { useUpdateMyAccountMutation, useUpdateMyPhotoMutation } from "../services/updatePerson";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import { formatearCarrera } from "../helpers";


const EditProfileForm = ({ user, onClose, tipo }) => {
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({});
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [tipoUsuario, setTipoUsuario] = useState(tipo);
    const [updateMyAccount, { isSuccess, isError }] = useUpdateMyAccountMutation();
    const { getUserByUsername } = useUserAccount();
    const [updateMyPhoto] = useUpdateMyPhotoMutation();
    const { userId, username, userToken } = useAppSelector(state => state.users)

    const validationSchemas = {
        student: Yup.object().shape({}),
        teacher: Yup.object().shape({}),
        recruiter: Yup.object().shape({}),
    };

    useEffect(() => {
        if (Object.keys(user).length > 0) {
            setVistaPrevia(user.imagen && user.imagen)
        }
    }, [user])

    useEffect(() => {
        if (isSuccess) {
            toast.success("Perfil actualizado con exito")
            getUserByUsername(username, userToken);
            setTimeout(() => {
                onClose()
            }, [1500])
        }
        if (isError) {
            toast.error("Error al actualizar")
        }
    }, [isSuccess, isError])


    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await validationSchemas[tipoUsuario].validate(values, {
                abortEarly: false,
            });
            setFormErrors({});

            const token = localStorage.getItem("token");

            if (tipo === "student") {
                const valor = `${(values.carrera === "ingenieriaSW" && 1) || (values.carrera === "ingenieriaC" && 2) || (values.carrera === "ciberseguridad" && 3)}`;

                const updatePerson = {
                    id: userId,
                    idUbicacion: 2,
                    idCarrera: parseInt(valor),
                    nombre: values.nombre,
                    apellido: values.apellidoPaterno,
                    descripcion: values.descripcion,
                    fechaNacimiento: values.fechaNacimiento,
                    imagen: user.imagen,
                    especialidad: values.especialidad,
                    curriculum: values.linkCV,
                    semestre: values.semestre,
                    tipo: tipo
                };

                // Primero actualizar los datos de la cuenta
                await updateMyAccount({
                    updatePerson,
                    token,
                    tipo,
                    userId
                }).unwrap();


                if (archivoSeleccionado) {
                    const formData = new FormData();
                    formData.append("image", archivoSeleccionado);
                    formData.append("tipo", tipo);
                    console.log(archivoSeleccionado)
                    try {
                        await updateMyPhoto({
                            userId,
                            formData,
                            token
                        }).unwrap();
                        toast.success("Foto actualizada con éxito");
                        getUserByUsername(username, userToken);
                        return
                    } catch (photoError) {
                        toast.error("Error al actualizar la foto, pero los datos se guardaron");
                    }

                } else if (!archivoSeleccionado) {
                    return
                }
                // getUserByUsername(username, userToken);

            }

            if (tipo === "teacher") {
                const updatePerson = {
                    id: userId,
                    idUbicacion: 2,
                    nombre: values.nombre,
                    apellido: values.apellidoPaterno,
                    descripcion: values.descripcion,
                    fechaNacimiento: values.fechaNacimiento,
                    imagen: user.imagen,
                    especialidad: values.especialidad,
                    curriculum: values.linkCV,
                    tipo: tipo,
                    departamento: values.departamento,
                    gradoAcademico: values.gradoAcademico.toUpperCase()
                };

                await updateMyAccount({
                    updatePerson,
                    token,
                    tipo,
                    userId
                }).unwrap();

                console.log(archivoSeleccionado)
                if (archivoSeleccionado) {
                    console.log("entro aqui la peticon")
                    const formData = new FormData();
                    formData.append("image", archivoSeleccionado);
                    formData.append("tipo", tipo);
                    // console.log(archivoSeleccionado)
                    try {
                        await updateMyPhoto({
                            userId,
                            formData,
                            token
                        }).unwrap();
                        toast.success("Foto actualizada con éxito");
                        getUserByUsername(username, userToken);
                        return
                    } catch (photoError) {
                        toast.error("Error al actualizar la foto, pero los datos se guardaron");
                    }
                } else if (!archivoSeleccionado) {
                    console.log("no entro a la peticion")
                    return;
                }

            }
            // ... resto de tu lógica para teacher y recruiter

            setSubmitting(false);

        } catch (err) {

            if (err?.data) {
                console.error("Error del servidor:", err.data);
                toast.error(`Error: ${err.data.message || 'Error del servidor'}`);
            } else if (err && Array.isArray(err.inner)) {
                // Error de validación
                const errorMap = {};
                err.inner.forEach((e) => {
                    if (e && e.path) errorMap[e.path] = e.message;
                });
                setFormErrors(errorMap);
            } else {
                toast.error("Error inesperado al actualizar los datos");
            }
            setSubmitting(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setArchivoSeleccionado(file);
            const reader = new FileReader();
            reader.onload = (e) => setVistaPrevia(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const eliminarImagen = () => {
        setArchivoSeleccionado(null);
        setVistaPrevia(null);
        const el = document.getElementById("file-input-profile");
        if (el) el.value = "";
    };

    const getInitialValues = () =>
    ({
        student: {
            nombre: `${user?.nombre && user.nombre}`,
            apellidoPaterno: `${user?.apellido && user.apellido}`,
            fechaNacimiento: `${user?.fechaNacimiento && user.fechaNacimiento}`,
            carrera: `${user?.carrera?.carrera ? formatearCarrera(user.carrera.carrera) : ""}`,
            semestre: `${user?.semestre ? user.semestre : ""}`,
            linkCV: `${user?.curriculum ? user.curriculum : ''}`,
            especialidad: `${user.especialidad ? user.especialidad : ""}`,
            ubicacion: `${user?.ubicacion?.ciudad ? user?.ubicacion?.ciudad : ""}`,
            estatus: "",
            descripcion: `${user?.descripcion ? user.descripcion : ""}`,
        },
        teacher: {
            nombre: `${user?.nombre && user.nombre}`,
            apellidoPaterno: `${user?.apellido && user.apellido}`,
            fechaNacimiento: `${user?.fechaNacimiento && user.fechaNacimiento}`,
            departamento: `${user.departamento ? user.departamento : ""}`,
            especialidad: `${user.especialidad ? user.especialidad : ""}`,
            gradoAcademico: `${user.gradoAcademico ? user.gradoAcademico.toLowerCase() : ""}`,
            linkCV: `${user?.curriculum ? user.curriculum : ''}`,
            ubicacion: `${user?.ubicacion?.ciudad ? user?.ubicacion?.ciudad : ''}`,
            descripcion: `${user?.descripcion ? user.descripcion : ""}`,
        },
        recruiter: {
            nombre: "",
            apellidoPaterno: "",
            fechaNacimiento: "",
            empresa: "",
            especialidad: "",
            linkCV: "",
            ubicacion: "",
            descripcion: "",
        },
    }[tipoUsuario]);

    return (
        <div className="absolute inset-0 bg-black/15 z-50 flex justify-center items-center publicacion__menu">
            <div className="w-full bg-gradient-to-b flex items-center justify-center pt-2">
                <div className="w-full max-w-5xl px-6">
                    <div className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(16,185,129,0.09)] border border-gray-100 overflow-hidden relative">
                        <IoCloseSharp
                            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200 size-7 cursor-pointer z-10"
                            onClick={onClose}
                        />
                        <div className="p-5">
                            <div className="text-center mb-6">
                                <h2 className="text-4xl font-extrabold text-green-600">
                                    Editar perfil
                                </h2>
                            </div>

                            <Formik
                                initialValues={getInitialValues()}
                                onSubmit={handleSubmit}
                                enableReinitialize
                                validateOnChange={false}
                                validateOnBlur={false}
                            >
                                {({ isSubmitting, resetForm }) => (
                                    <Form className="flex flex-col space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div className="lg:col-span-2 space-y-4">
                                                <div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex flex-col">
                                                            <div className="relative w-full h-12">
                                                                <Field
                                                                    type="text"
                                                                    name="nombre"
                                                                    value={user.nombre}
                                                                    placeholder=" "
                                                                    className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 ${formErrors.nombre
                                                                        ? "border-red-400 bg-red-50"
                                                                        : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                        }`}
                                                                />
                                                                <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                    Nombre
                                                                </label>
                                                            </div>
                                                            <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                {formErrors.nombre || " "}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <div className="relative w-full h-12">
                                                                <Field
                                                                    type="text"
                                                                    name="apellidoPaterno"
                                                                    value={user.apellido}
                                                                    placeholder=" "
                                                                    className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 ${formErrors.apellidoPaterno
                                                                        ? "border-red-400 bg-red-50"
                                                                        : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                        }`}
                                                                />
                                                                <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                    Apellido
                                                                </label>
                                                            </div>
                                                            <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                {formErrors.apellidoPaterno || " "}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col">
                                                        <div className="relative w-full h-12">
                                                            <Field
                                                                type="date"
                                                                name="fechaNacimiento"
                                                                placeholder=" "
                                                                className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 text-slate-500 ${formErrors.fechaNacimiento
                                                                    ? "border-red-400 bg-red-50"
                                                                    : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                    }`}
                                                            />
                                                            <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                Fecha de Nacimiento
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                            {formErrors.fechaNacimiento || " "}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <div className="relative w-full h-12">
                                                            <Field
                                                                type="text"
                                                                name="linkCV"
                                                                placeholder=" "
                                                                className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 ${formErrors.linkCV
                                                                    ? "border-red-400 bg-red-50"
                                                                    : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                    }`}
                                                            />
                                                            <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                Link CV
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                            {formErrors.linkCV || " "}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col">
                                                        <div className="relative w-full h-12">
                                                            <Field
                                                                type="text"
                                                                name="especialidad"
                                                                placeholder=" "
                                                                className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 ${formErrors.especialidad
                                                                    ? "border-red-400 bg-red-50"
                                                                    : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                    }`}
                                                            />
                                                            <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                Especialidad
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                            {formErrors.especialidad || " "}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <div className="relative w-full h-12">
                                                            <Field
                                                                type="text"
                                                                name="ubicacion"
                                                                placeholder=" "
                                                                className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 ${formErrors.ubicacion
                                                                    ? "border-red-400 bg-red-50"
                                                                    : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                    }`}
                                                            />
                                                            <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                Ubicación
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                            {formErrors.ubicacion || " "}
                                                        </div>
                                                    </div>
                                                </div>

                                                {tipoUsuario === "student" && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="flex flex-col">
                                                                <div className="relative w-full h-12">
                                                                    <Field
                                                                        as="select"
                                                                        name="carrera"
                                                                        className={`w-full h-full rounded-2xl px-4 outline-none transition-all duration-200 appearance-none bg-white shadow-sm border-2 text-gray-500 ${formErrors.carrera
                                                                            ? "border-red-400"
                                                                            : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                            }`}
                                                                    >
                                                                        <option value="" className="text-gray-400">
                                                                            Seleccionar carrera
                                                                        </option>
                                                                        <option
                                                                            value="ingenieriaSW"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Ingeniería en Software
                                                                        </option>
                                                                        <option
                                                                            value="ingenieriaC"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Ingeniería en Computación
                                                                        </option>
                                                                        <option
                                                                            value="ciberseguridad"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Ciberseguridad
                                                                        </option>
                                                                    </Field>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <svg
                                                                            className="h-5 w-5 text-green-500"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                    {formErrors.carrera || " "}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <div className="relative w-full h-12">
                                                                    <Field
                                                                        as="select"
                                                                        name="semestre"
                                                                        className={`w-full h-full rounded-2xl px-4 outline-none transition-all duration-200 appearance-none bg-white shadow-sm border-2 text-gray-500 ${formErrors.semestre
                                                                            ? "border-red-400"
                                                                            : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                            }`}
                                                                    >
                                                                        <option value="" className="text-gray-400">
                                                                            Seleccionar semestre
                                                                        </option>
                                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                                                            (sem) => (
                                                                                <option
                                                                                    key={sem}
                                                                                    value={sem}
                                                                                    className="text-gray-700"
                                                                                >
                                                                                    {sem}° Semestre
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Field>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <svg
                                                                            className="h-5 w-5 text-green-500"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                    {formErrors.semestre || " "}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <div className="relative w-full h-12">
                                                                <Field
                                                                    as="select"
                                                                    name="estatus"
                                                                    className={`w-full h-full rounded-2xl px-4 outline-none transition-all duration-200 appearance-none bg-white shadow-sm border-2 text-gray-500 ${formErrors.estatus
                                                                        ? "border-red-400"
                                                                        : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                        }`}
                                                                >
                                                                    <option value="" className="text-gray-400">
                                                                        Seleccionar estatus
                                                                    </option>
                                                                    <option
                                                                        value="activo"
                                                                        className="text-gray-700"
                                                                    >
                                                                        Activo
                                                                    </option>
                                                                    <option
                                                                        value="inactivo"
                                                                        className="text-gray-700"
                                                                    >
                                                                        Inactivo
                                                                    </option>
                                                                </Field>
                                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                    <svg
                                                                        className="h-5 w-5 text-green-500"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                {formErrors.estatus || " "}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {tipoUsuario === "teacher" && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="flex flex-col">
                                                                <div className="relative w-full h-12">
                                                                    <Field
                                                                        as="select"
                                                                        name="departamento"
                                                                        className={`w-full h-full rounded-2xl px-4 outline-none transition-all duration-200 appearance-none bg-white shadow-sm border-2 text-gray-500 ${formErrors.departamento
                                                                            ? "border-red-400"
                                                                            : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                            }`}
                                                                    >
                                                                        <option value="" className="text-gray-400">
                                                                            Seleccionar departamento
                                                                        </option>
                                                                        <option
                                                                            value="sistemas"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Sistemas Computacionales
                                                                        </option>
                                                                        <option
                                                                            value="software"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Ingeniería de Software
                                                                        </option>
                                                                        <option
                                                                            value="computacion"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Computación
                                                                        </option>
                                                                        <option
                                                                            value="ciencias"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Ciencias Básicas
                                                                        </option>
                                                                    </Field>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <svg
                                                                            className="h-5 w-5 text-green-500"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                    {formErrors.departamento || " "}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <div className="relative w-full h-12">
                                                                    <Field
                                                                        as="select"
                                                                        name="gradoAcademico"
                                                                        className={`w-full h-full rounded-2xl px-4 outline-none transition-all duration-200 appearance-none bg-white shadow-sm border-2 text-gray-500 ${formErrors.gradoAcademico
                                                                            ? "border-red-400"
                                                                            : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                            }`}
                                                                    >
                                                                        <option value="" className="text-gray-400">
                                                                            Seleccionar grado académico
                                                                        </option>
                                                                        <option
                                                                            value="licenciatura"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Licenciatura
                                                                        </option>
                                                                        <option
                                                                            value="maestria"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Maestría
                                                                        </option>
                                                                        <option
                                                                            value="doctorado"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Doctorado
                                                                        </option>
                                                                        <option
                                                                            value="postdoctorado"
                                                                            className="text-gray-700"
                                                                        >
                                                                            Postdoctorado
                                                                        </option>
                                                                    </Field>
                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                        <svg
                                                                            className="h-5 w-5 text-green-500"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                                    {formErrors.gradoAcademico || " "}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {tipoUsuario === "recruiter" && (
                                                    <div className="flex flex-col">
                                                        <div className="relative w-full h-12">
                                                            <Field
                                                                type="text"
                                                                name="empresa"
                                                                placeholder=" "
                                                                className={`peer w-full h-full rounded-2xl px-4 outline-none bg-white z-10 shadow-sm border-2 ${formErrors.empresa
                                                                    ? "border-red-400 bg-red-50"
                                                                    : "border-gray-300 focus:border-green-500 focus:ring-0"
                                                                    }`}
                                                            />
                                                            <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-3 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                                Empresa
                                                            </label>
                                                        </div>
                                                        <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                            {formErrors.empresa || " "}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="lg:col-span-1 flex flex-col items-center">
                                                <div className="mt-1 w-48 h-48 relative mb-3">
                                                    <div
                                                        className="w-full h-full rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center border border-dashed border-green-200 bg-white/40 shadow-inner hover:shadow-md transition-all duration-200"
                                                        onClick={() =>
                                                            document
                                                                .getElementById("file-input-profile")
                                                                .click()
                                                        }
                                                    >
                                                        <input
                                                            id="file-input-profile"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleFileChange}
                                                        />

                                                        {vistaPrevia ? (
                                                            <div className="relative w-full h-full">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        eliminarImagen();
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-white text-red-600 p-1 rounded-full hover:scale-105 transition-transform z-10 shadow-sm"
                                                                    aria-label="Eliminar imagen"
                                                                >
                                                                    <FaTimes className="w-4 h-4" />
                                                                </button>
                                                                <img
                                                                    src={vistaPrevia}
                                                                    alt="Vista previa"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-center px-4">
                                                                <FaCloudUploadAlt className="w-12 h-12 text-green-500 mx-auto mb-2 animate-pulse" />
                                                                <span className="text-sm text-gray-500">
                                                                    Subir foto
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 text-center">
                                                    Haz clic para subir una foto de perfil
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="relative">
                                                <Field
                                                    as="textarea"
                                                    name="descripcion"
                                                    rows="4"
                                                    placeholder=" "
                                                    className={`peer w-full border-2 rounded-2xl px-4 py-3 outline-none bg-white z-10 transition-all duration-200 placeholder-transparent shadow-sm ${formErrors.descripcion
                                                        ? "border-red-400 bg-red-50"
                                                        : "border-gray-300 focus:ring-0 focus:border-green-500"
                                                        }`}
                                                />
                                                <label className="absolute top-2 left-4 px-1 bg-white/95 text-slate-400 text-sm transition-all duration-200 z-0 pointer-events-none peer-focus:-translate-y-4 peer-focus:scale-90 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600 peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-slate-600">
                                                    Descripción
                                                </label>
                                            </div>
                                            <div className="mt-1 min-h-4 text-sm text-red-600 font-medium">
                                                {formErrors.descripcion || " "}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-5 p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetForm();
                                                    setFormErrors({});
                                                    eliminarImagen();
                                                }}
                                                className="px-7 py-2 border rounded-2xl text-base font-semibold text-slate-700 bg-white/60 hover:bg-white transition-all duration-200 shadow-sm cursor-pointer"
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-8 py-2 rounded-2xl shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                            >
                                                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileForm;