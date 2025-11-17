import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  IoCalendarOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoSearchOutline,
  IoAddOutline,
  IoRefreshOutline,
} from "react-icons/io5";

const StudentRecruitmentForm = () => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});

  const [students] = useState([]);
  const [recruiters] = useState([]);
  const [companies] = useState([]);

  const recruitmentSchema = Yup.object().shape({
    fechaContratacion: Yup.date()
      .required("La fecha de contratación es requerida")
      .max(new Date(), "La fecha no puede ser futura"),
    posicion: Yup.string()
      .required("La posición es requerida")
      .min(3, "La posición debe tener al menos 3 caracteres")
      .max(100, "La posición no puede tener más de 100 caracteres"),
    estudiante: Yup.object()
      .shape({
        id: Yup.string().required("El estudiante es requerido"),
      })
      .required("El estudiante es requerido"),
    reclutador: Yup.object()
      .shape({
        id: Yup.string().required("El reclutador es requerido"),
      })
      .required("El reclutador es requerido"),
    compania: Yup.object()
      .shape({
        id: Yup.string().required("La compañía es requerida"),
      })
      .required("La compañía es requerida"),
  });

const handleSubmit = (values, { setSubmitting }) => {
  console.log(values);
  setSubmitting(true);
  
  recruitmentSchema
    .validate(values, { abortEarly: false })
    .then(() => {
      console.log("VALIDACIÓN EXITOSA");
      setFormErrors({});
      console.log("Datos de contratación:", values);

      const recruitmentData = {
        fechaContratacion: values.fechaContratacion,
        posicion: values.posicion,
        estudiante: {
          id: values.estudiante.id,
        },
        reclutador: {
          id: values.reclutador.id,
        },
        compania: {
          id: values.compania.id,
        },
      };

      console.log("Datos a enviar:", recruitmentData);

      setTimeout(() => {
        alert("Contratación registrada exitosamente");
        navigate("/");
        setSubmitting(false);
      }, 1000);
    })
    .catch((errors) => {
      console.log("ERRORES DE VALIDACIÓN:", errors);
      const errorMap = {};
      errors.inner.forEach((error) => {
        errorMap[error.path] = error.message;
      });
      setFormErrors(errorMap);
      setSubmitting(false);
    });
};

  const handleReset = (resetForm) => {
    resetForm();
    setFormErrors({});
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="h-[90vh] bg-gradient-to-br bg-gray-100 flex items-center justify-center overflow-hidden py-8">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white py-6 px-6 shadow-2xl rounded-2xl border border-gray-100">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Contratación de Estudiante
              </h2>
            </div>
 
          </div>

          <Formik
            initialValues={{
              fechaContratacion: "",
              posicion: "",
              estudiante: { id: "" },
              reclutador: { id: "" },
              compania: { id: "" },
            }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue, resetForm }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="fechaContratacion"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoCalendarOutline className="h-4 w-4 text-blue-500 mr-2" />
                    Fecha de Contratación:
                  </label>
                  <Field
                    type="date"
                    name="fechaContratacion"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.fechaContratacion
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 cursor-pointer"
                    }`}
                    max={formatDateForInput(new Date())}
                  />
                  {formErrors.fechaContratacion && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.fechaContratacion}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="posicion"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoBriefcaseOutline className="h-4 w-4 text-green-500 mr-2" />
                    Posición:
                  </label>
                  <Field
                    type="text"
                    name="posicion"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.posicion
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                    }`}
                    placeholder="Ej: Desarrollador Frontend, Data Analyst, etc."
                  />
                  {formErrors.posicion && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.posicion}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="estudiante"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoPersonOutline className="h-4 w-4 text-purple-500 mr-2" />
                    Estudiante:
                  </label>
                  <Field
                    as="select"
                    name="estudiante.id"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.estudiante
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 cursor-pointer"
                    }`}
                  >
                    <option value="">Selecciona un estudiante</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.email}
                      </option>
                    ))}
                  </Field>
                  {formErrors.estudiante && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.estudiante}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reclutador"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoPersonOutline className="h-4 w-4 text-orange-500 mr-2" />
                    Reclutador:
                  </label>
                  <Field
                    type="text"
                    name="reclutador.id" 
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.reclutador
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                    }`}
                    placeholder="Nombre del reclutador"
                  />
                  {formErrors.reclutador && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.reclutador}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="compania"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoBusinessOutline className="h-4 w-4 text-indigo-500 mr-2" />
                    Compañía:
                  </label>
                  <Field
                    as="select"
                    name="compania.id"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300${
                      formErrors.compania
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 cursor-pointer"
                    }`}
                  >
                    <option value="">Selecciona una compañía</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Field>
                  {formErrors.compania && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.compania}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleReset(resetForm)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-100 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Registrando...
                      </div>
                    ) : (
                      "Registrar"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default StudentRecruitmentForm;
