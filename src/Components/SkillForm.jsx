import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
    IoCodeSlashOutline,
    IoServerOutline,
    IoColorPaletteOutline,
    IoDocumentTextOutline,
    IoAddCircleOutline,
    IoCheckmarkCircleOutline,
    IoAlertCircleOutline,
    IoBriefcaseOutline,
    IoCloseSharp
} from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useCreateSkillsMutation } from "../services/UserSlice";
import { toast } from "sonner";
import { useUserAccount } from "../Hooks/useUserAccount";

const SkillForm = ({ onSubmit, onCancel }) => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [skillsList, setSkillsList] = useState([]); // NUEVO ARRAY
    const { userId, username, userToken } = useAppSelector(state => state.users);
    const [createSkillMutation, { isSuccess, error, data }] = useCreateSkillsMutation();
    const { getUserByUsername } = useUserAccount();


    const skillCategories = {
        frontend: [
            "React", "Vue.js", "Angular", "HTML/CSS", "JavaScript",
            "TypeScript", "Tailwind CSS", "Bootstrap", "Next.js", "Sass"
        ],
        backend: [
            "Node.js", "Python", "Java", "PHP", "C#",
            "Ruby", "Go", "Spring Boot", "Django", "Express.js"
        ],
        database: [
            "MySQL", "PostgreSQL", "MongoDB", "Oracle",
            "SQL Server", "Firebase", "Redis", "SQLite"
        ],
        tools: [
            "Git", "Docker", "Kubernetes", "Jenkins", "GitHub Actions",
            "VS Code", "IntelliJ IDEA", "Postman", "Figma", "Jira"
        ],
        other: [
            "Testing", "Documentación", "Metodologías Ágiles", "API REST",
            "Microservicios", "Clean Code", "DevOps", "Seguridad", "CI/CD"
        ]
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required("Debes seleccionar o escribir una habilidad")
            .min(2, "La habilidad debe tener al menos 2 caracteres")
            .max(100, "La habilidad no puede exceder 100 caracteres"),
        level: Yup.string()
            .required("Debes seleccionar un nivel de dominio")
            .oneOf(["Basico", "Intermedio", "Avanzado"], "Nivel inválido"),
        category: Yup.string()
            .required("Debes seleccionar una categoría")
    });

    const initialValues = {
        name: "",
        level: "",
        category: "",
        customSkill: ""
    };

    // ✅ Agregar al array
    const handleAddSkillToList = (values, resetForm, setFieldValue) => {
        const skillName = values.customSkill || values.name;

        const newSkill = {
            idPersona: userId,
            nombre: skillName,
            nivel: values.level.toUpperCase()
        };

        setSkillsList(prev => [...prev, newSkill]);

        resetForm();
        setSelectedCategory("");
        setFieldValue("category", "");
    };

    // ✅ Eliminar skill
    const handleRemoveSkill = (index) => {
        setSkillsList(prev => prev.filter((_, i) => i !== index));
    };

    // ✅ Enviar todo el array
    const handleFinalSubmit = () => {
        if (skillsList.length === 0) {
            toast.message("Agrega al menos una habilidad primero");
            return;
        }
        if (onSubmit) onSubmit(skillsList);
        const token = localStorage.getItem("token")
        createSkillMutation({ skillsList, token })
        setSkillsList([])
    };

    const categories = [
        { value: "frontend", label: "Frontend", icon: IoColorPaletteOutline },
        { value: "backend", label: "Backend", icon: IoServerOutline },
        { value: "database", label: "Base de Datos", icon: IoDocumentTextOutline },
        { value: "tools", label: "Herramientas", icon: IoBriefcaseOutline },
        { value: "other", label: "Otras", icon: IoCheckmarkCircleOutline }
    ];

    const levels = [
        { value: "Basico", label: "Básico", description: "Conocimientos fundamentales" },
        { value: "Intermedio", label: "Intermedio", description: "Puedo trabajar con confianza" },
        { value: "Avanzado", label: "Avanzado", description: "Dominio experto" }
    ];

    useEffect(() => {

        if (isSuccess) {
            toast.success("Habilidades agregadas correctamente")
            getUserByUsername(username, userToken);
            setTimeout(() => {
                onCancel()
            }, 1000)
            return;
        }
        if (error) {
            toast.error("Error intentelo mas tarde")
        }
    }, [isSuccess, error])


    return (
        <div className="absolute inset-0 z-50 flex justify-center items-center">
            <IoCloseSharp
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200 size-7 cursor-pointer z-10"
                onClick={onCancel}
            />

            <div className="bg-gradient-to-br from-green-50 min-h-screen flex items-center justify-center p-4 w-full">
                <div className="w-full max-w-3xl">
                    <div className="bg-white py-8 px-8 shadow-2xl rounded-3xl border-2 border-green-100">

                        <div className="text-center mb-8">
                            <div className="flex justify-center items-center gap-3">
                                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <IoCodeSlashOutline className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-900">
                                    Agregar Habilidad
                                </h2>
                            </div>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            validateOnChange={false}
                            validateOnBlur={false}
                        >
                            {({ values, errors, touched, setFieldValue, resetForm }) => (
                                <Form className="space-y-6">

                                    {/* CATEGORÍAS */}
                                    <div>
                                        <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                            <IoServerOutline className="h-6 w-6 text-green-600 mr-2" />
                                            Categoría de Habilidad
                                        </label>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {categories.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => {
                                                        setFieldValue("category", value);
                                                        setFieldValue("name", "");
                                                        setFieldValue("customSkill", "");
                                                        setSelectedCategory(value);
                                                    }}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${values.category === value
                                                        ? "border-green-500 bg-green-50 shadow-md scale-105"
                                                        : "border-gray-300 hover:border-green-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <Icon className={`h-7 w-7 ${values.category === value ? "text-green-600" : "text-gray-500"}`} />
                                                    <span className={`font-semibold text-sm ${values.category === value ? "text-green-700" : "text-gray-700"}`}>
                                                        {label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {errors.category && touched.category && (
                                            <p className="mt-2 text-red-600 text-sm font-medium flex items-center gap-1">
                                                <IoAlertCircleOutline className="h-4 w-4" />
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    {/* SKILLS */}
                                    {values.category && (
                                        <div className="animate-fadeIn">
                                            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                                <IoCodeSlashOutline className="h-6 w-6 text-green-600 mr-2" />
                                                Selecciona la Habilidad
                                            </label>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                                {skillCategories[values.category]?.map((skill) => (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => {
                                                            setFieldValue("name", skill);
                                                            setFieldValue("customSkill", "");
                                                        }}
                                                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${values.name === skill && !values.customSkill
                                                            ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                                                            : "border-gray-300 text-gray-700 hover:border-green-300 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {skill}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* CUSTOM SKILL */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    O escribe una habilidad personalizada:
                                                </label>
                                                <Field
                                                    name="customSkill"
                                                    placeholder="Escribe tu habilidad personalizada..."
                                                    className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                                />
                                            </div>

                                            {errors.name && touched.name && (
                                                <p className="mt-2 text-red-600 text-sm font-medium flex items-center gap-1">
                                                    <IoAlertCircleOutline className="h-4 w-4" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* NIVEL */}
                                    <div>
                                        <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                                            <IoCheckmarkCircleOutline className="h-6 w-6 text-green-600 mr-2" />
                                            Nivel de Dominio
                                        </label>

                                        <Field
                                            as="select"
                                            name="level"
                                            className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                                        >
                                            <option value="">Selecciona un nivel</option>
                                            {levels.map((lvl) => (
                                                <option key={lvl.value} value={lvl.value}>
                                                    {lvl.label} - {lvl.description}
                                                </option>
                                            ))}
                                        </Field>

                                        {errors.level && touched.level && (
                                            <p className="mt-2 text-red-600 text-sm font-medium flex items-center gap-1">
                                                <IoAlertCircleOutline className="h-4 w-4" />
                                                {errors.level}
                                            </p>
                                        )}
                                    </div>

                                    {/* RESUMEN TEMPORAL */}
                                    {(values.customSkill || values.name) && values.level && (
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 animate-fadeIn">
                                            <div className="flex items-center gap-3">
                                                <IoCheckmarkCircleOutline className="h-8 w-8 text-green-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600 font-medium">Habilidad seleccionada:</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {values.customSkill || values.name}
                                                        <span className="text-green-600 ml-2">
                                                            Nivel {values.level}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ✅ BOTÓN PARA AGREGAR A LA LISTA */}
                                    <button
                                        type="button"
                                        onClick={() => handleAddSkillToList(values, resetForm, setFieldValue)}
                                        className="w-full py-3 bg-green-200 hover:bg-green-300 text-green-900 font-semibold rounded-xl transition-all"
                                    >
                                        ➕ Agregar habilidad a la lista
                                    </button>

                                    {/* ✅ LISTA DE HABILIDADES AGREGADAS */}
                                    {skillsList.length > 0 && (
                                        <div className="mt-6 bg-white border-2 border-green-200 rounded-xl p-4 animate-fadeIn">
                                            <h3 className="text-lg font-bold mb-3 text-gray-800">Habilidades agregadas:</h3>

                                            <div className="flex flex-wrap gap-3">
                                                {skillsList.map((skill, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 bg-green-50 border border-green-300 px-4 py-2 rounded-xl"
                                                    >
                                                        <span className="font-semibold text-green-700">
                                                            {skill.nombre} ({skill.nivel})
                                                        </span>

                                                        <button
                                                            className="text-red-500 font-bold hover:text-red-700"
                                                            onClick={() => handleRemoveSkill(index)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ✅ BOTONES FINALES */}
                                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">

                                        <button
                                            type="button"
                                            onClick={onCancel}
                                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                                        >
                                            Cancelar
                                        </button>

                                        {/* ✅ ENVIAR TODO EL ARRAY */}
                                        <button
                                            type="button"
                                            onClick={handleFinalSubmit}
                                            className="flex items-center justify-center px-8 py-3 rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer"
                                        >
                                            Guardar todas las habilidades
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

export default SkillForm;
