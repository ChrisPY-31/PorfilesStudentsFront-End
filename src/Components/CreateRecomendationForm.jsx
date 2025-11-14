import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { IoCloseSharp } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useCreateRecomedationMutation } from "../services/recomentationStudent";
import { toast } from "sonner";
import { useUserAccount } from "../Hooks/useUserAccount";

const CreateRecommendationForm = ({ onClose, user }) => {
  const { students } = useAppSelector(state => state.students)
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [estudiantes, setEstudiantes] = useState(students)
  const [createRecomendation, { isSuccess }] = useCreateRecomedationMutation();
  const { username } = useAppSelector(state => state.users)
  const token = localStorage.getItem("token")
  const { getUserByUsername } = useUserAccount();


  useEffect(() => {
    if (isSuccess) {
      toast.success("se creo la recomendacion")
      setTimeout(() => {
        onClose()
      }, 1000)
      return
    }

  }, [isSuccess])


  const recommendationSchema = Yup.object().shape({
    idStudent: Yup.number()
      .required("Debe seleccionar un estudiante"),
    contenido: Yup.string()
      .min(10, "La recomendación debe tener al menos 10 caracteres")
      .max(500, "La recomendación no puede exceder los 500 caracteres")
      .required("Campo requerido")
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await recommendationSchema.validate(values, { abortEarly: false });
      setFormErrors({});

      // Crear el objeto con la estructura que espera el backend
      const recomendationData = {
        id: {
          idStudent: values.idStudent,
          idTeacher: user?.id // Asumiendo que el usuario (docente) tiene un id
        },
        comentario: values.contenido,
      };

      await createRecomendation({ recomendationData, token })
      getUserByUsername(username, token)


      setTimeout(() => setSuccessMessage(""), 3000);
      resetForm();
      setSelectedEstudiante(null);

    } catch (err) {
      const errorMap = {};
      if (err && Array.isArray(err.inner) && err.inner.length) {
        err.inner.forEach((e) => {
          if (e && e.path) errorMap[e.path] = e.message;
        });
      } else if (err && err.path && err.message) {
        errorMap[err.path] = err.message;
      } else {
        errorMap._general = "Ocurrió un error en la validación";
      }
      setFormErrors(errorMap);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEstudianteChange = (e, setFieldValue) => {
    const estudianteId = parseInt(e.target.value);
    const estudiante = estudiantes.find(est => est.id === estudianteId);

    setFieldValue("idStudent", estudianteId);
    setSelectedEstudiante(estudiante);
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-center items-center h-[100dvh]">
      <IoCloseSharp className='absolute right-5 top-5 size-7 cursor-pointer' onClick={onClose} />

      <div className="h-full w-full bg-gradient-to-br bg-gray-100 flex items-center justify-center overflow-hidden">

        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
            <div className="p-5">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-3">
                  Crear Recomendación
                </h2>
              </div>

              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
                  {successMessage}
                </div>
              )}

              <Formik
                initialValues={{
                  idStudent: "",
                  contenido: ""
                }}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form className="space-y-6">
                    {/* Campo de docente (solo lectura) */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-4/5 h-12">
                        <Field
                          type="text"
                          name="nombreDocente"
                          value={`${user?.nombre} ${user?.apellido}`}
                          readOnly
                          className="peer w-full h-full border border-gray-300 rounded-xl px-5 outline-none bg-gray-100 z-10 transition-all duration-300 placeholder-transparent"
                          placeholder=" "
                        />
                        <label
                          className="absolute top-3 left-5 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                   peer-focus:top-[-0.5rem] peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                   peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Nombre del docente
                        </label>
                      </div>
                    </div>

                    {/* Campo de estudiantes (dropdown) */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-4/5 h-12">
                        <Field
                          as="select"
                          name="idStudent"
                          onChange={(e) => handleEstudianteChange(e, setFieldValue)}
                          className={`peer w-full h-full border border-gray-300 rounded-xl px-5 outline-none bg-transparent z-10 transition-all duration-300 appearance-none ${formErrors.idStudent
                            ? "border-red-400 bg-red-50"
                            : "focus:border-2 focus:border-green-500"
                            }`}
                        >
                          <option value="">Seleccione un estudiante</option>
                          {estudiantes?.map((estudiante) => (
                            <option key={estudiante.id} value={estudiante.id}>
                              {estudiante.nombre} {estudiante.apellido}
                            </option>
                          ))}
                        </Field>
                        <label
                          className="absolute top-3 left-5 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                   peer-focus:top-[-0.5rem] peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                   peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Estudiante
                        </label>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {formErrors.idStudent && (
                        <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                          {formErrors.idStudent}
                        </div>
                      )}

                      {/* Información del estudiante seleccionado */}
                      {selectedEstudiante && (
                        <div className="mt-3 w-4/5 flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          {selectedEstudiante.foto && (
                            <img
                              src={selectedEstudiante.foto}
                              alt={`${selectedEstudiante.nombre} ${selectedEstudiante.apellido}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {selectedEstudiante.nombre} {selectedEstudiante.apellido}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Campo de recomendación */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-4/5">
                        <Field
                          as="textarea"
                          name="contenido"
                          rows="5"
                          className={`peer w-full border border-gray-300 rounded-xl px-5 py-3 outline-none bg-transparent z-10 transition-all duration-300 placeholder-transparent resize-none ${formErrors.contenido
                            ? "border-red-400 bg-red-50"
                            : "focus:border-2 focus:border-green-500"
                            }`}
                          placeholder=" "
                        />
                        <label
                          className="absolute top-2 left-5 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                   peer-focus:top-[-0.5rem] peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                   peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Recomendación
                        </label>
                      </div>
                      {formErrors.contenido && (
                        <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                          {formErrors.contenido}
                        </div>
                      )}
                      <div className="text-right text-sm text-gray-500 w-4/5 mt-1">
                        {values.contenido.length}/500 caracteres
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-4/5 py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r
                       from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                        focus:ring-green-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creando recomendación...
                          </div>
                        ) : (
                          "Crear Recomendación"
                        )}
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

export default CreateRecommendationForm;