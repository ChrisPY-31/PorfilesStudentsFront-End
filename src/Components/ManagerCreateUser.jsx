import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoPersonAddOutline,
  IoSchoolOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoIdCardOutline,
  IoMailOutline,
  IoKeyOutline
} from "react-icons/io5";
import { useCreateUserMutation } from "../services/autenticateUser";
import { toast, Toaster } from "sonner";
import { useAppSelector } from "../Hooks/store";

const ManagerCreateUser = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showStudentFields, setShowStudentFields] = useState(false);
  const [createUser, { isLoading, isSuccess, error }] = useCreateUserMutation();

  useEffect(() => {

    if (isSuccess) {
      toast.success("Usuario creado correctamente");
      return
    }

    if (error) {
      console.error(error)
      if (error.status === 'FETCH_ERROR') {
        toast.error("Error del servidor. Por favor, intenta de nuevo más tarde.");
        return;
      }
      toast.error(`Error : ${error?.data?.mensaje === "El correo ya esta en uso." ? error?.data?.mensaje : " Numero de cuenta ya esta en uso"}` || '');
      return
    }
  }, [error, isSuccess]);


  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const registerSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .required("El nombre es requerido"),
    apellidoPaterno: Yup.string()
      .min(2, "El apellido paterno debe tener al menos 2 caracteres")
      .required("El apellido paterno es requerido"),
    numeroCuenta: Yup.string()
      .matches(/^[0-9]+$/, "El número de cuenta debe contener solo números")
      .length(7, "El número de cuenta debe tener 7 dígitos")
      .required("El número de cuenta es requerido"),
    correoInstitucional: Yup.string()
      .matches(
        /^[a-z]+[0-9]{3}@alumno\.uaemex\.mx$/,
        "El correo debe seguir el formato: mtorres001@alumno.uaemex.mx"
      )
      .required("El correo institucional es requerido"),
    password: Yup.string().required("La contraseña es requerida"),
    tipoUsuario: Yup.string().required("Debes seleccionar un tipo de usuario"),
    carrera: Yup.string().when("tipoUsuario", (tipoUsuario, schema) => {
      return tipoUsuario === "estudiante"
        ? schema.required("La carrera es requerida para estudiantes")
        : schema.notRequired();
    }),
    semestre: Yup.string().when("tipoUsuario", (tipoUsuario, schema) => {
      return tipoUsuario === "estudiante"
        ? schema.required("El semestre es requerido para estudiantes")
        : schema.notRequired();
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await registerSchema.validate(values, { abortEarly: false });
      setFormErrors({});
      setSubmitting(false);

      let tipoUserRol = values.tipoUsuario === "estudiante" ? "STUDENT" : "TEACHER"

      const user = {
        username: values.numeroCuenta,
        password: values.password,
        email: values.correoInstitucional,
        roleRequest: {
          roleListName: [
            tipoUserRol
          ]
        }
      }

      const person = {
        nombre: values.nombre,
        apellido: values.apellidoPaterno
      }
       await createUser({ user, person });


      values.nombre = "";
      values.apellidoPaterno = "";
      values.numeroCuenta = "";
      values.correoInstitucional = "";
      values.password = "";
      values.tipoUsuario = "";
      values.carrera = "";
      values.semestre = "";

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
      setSubmitting(false);
    }
  };

  const handleTipoUsuarioChange = (value, setFieldValue) => {
    setFieldValue("tipoUsuario", value);
    setShowStudentFields(value === "estudiante");
  };

  const handleGeneratePassword = (setFieldValue) => {
    const newPassword = generatePassword();
    setFieldValue("password", newPassword);
    setShowPassword(true);
  };

  return (
    <div className=" w-full bg-gradient-to-br bg-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-right" autoClose={5000} hideProgressBar={false} />
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
          <div className="p-7">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-3 rounded-full">
                  <IoPersonAddOutline className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Registro de estudiantes y docentes
                </h2>
              </div>
            </div>

            <Formik
              initialValues={{
                nombre: "",
                apellidoPaterno: "",
                numeroCuenta: "",
                correoInstitucional: "",
                password: "",
                tipoUsuario: "",
                carrera: "",
                semestre: "",
              }}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-2">
                  <div className="grid grid-cols-2 gap-5 justify-center">
                    <div className="flex flex-col items-end">
                      <div className="relative w-4/5 h-12">
                        <Field
                          type="text"
                          name="nombre"
                          className={`peer w-full h-full border border-gray-300 rounded-xl px-5 pl-12 outline-none bg-transparent z-10 transition-all duration-300 placeholder-transparent ${formErrors.nombre
                            ? "border-red-400 bg-red-50"
                            : "focus:border-2 focus:border-green-500"
                            }`}
                          placeholder=" "
                        />
                        <IoPersonAddOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-20" />
                        <label
                          className="absolute top-3 left-12 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                         peer-focus:top-[-0.5rem] peer-focus:left-10 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                         peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-10 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Nombre
                        </label>
                      </div>
                      {formErrors.nombre && (
                        <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                          {formErrors.nombre}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start">
                      <div className="relative w-4/5 h-12 mb-1.5">
                        <Field
                          type="text"
                          name="apellidoPaterno"
                          className={`peer w-full h-full border border-gray-300 rounded-xl px-5 pl-12 outline-none bg-transparent z-10 transition-all duration-300 placeholder-transparent ${formErrors.apellidoPaterno
                            ? "border-red-400 bg-red-50"
                            : "focus:border-2 focus:border-green-500"
                            }`}
                          placeholder=" "
                        />
                        <IoPersonAddOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-20" />
                        <label
                          className="absolute top-3 left-12 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                         peer-focus:top-[-0.5rem] peer-focus:left-10 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                         peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-10 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Apellido paterno
                        </label>
                      </div>
                      {formErrors.apellidoPaterno && (
                        <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                          {formErrors.apellidoPaterno}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex flex-col items-center w-full">
                      <div className="relative w-4/5 h-12">
                        <Field
                          type="text"
                          name="numeroCuenta"
                          className={`peer w-full h-full border border-gray-300 rounded-xl px-5 pl-12 outline-none bg-transparent z-10 transition-all duration-300 placeholder-transparent ${formErrors.numeroCuenta
                            ? "border-red-400 bg-red-50"
                            : "focus:border-2 focus:border-green-500"
                            }`}
                          placeholder=" "
                        />
                        <IoIdCardOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-20" />
                        <label
                          className="absolute top-3 left-12 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                         peer-focus:top-[-0.5rem] peer-focus:left-10 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                         peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-10 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Número de cuenta
                        </label>
                      </div>
                      {formErrors.numeroCuenta && (
                        <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                          {formErrors.numeroCuenta}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center w-full">
                      <div className="relative w-4/5 h-12 mb-1.5">
                        <Field
                          type="email"
                          name="correoInstitucional"
                          className={`peer w-full h-full border border-gray-300 rounded-xl px-5 pl-12 outline-none bg-transparent z-10 transition-all duration-300 placeholder-transparent ${formErrors.correoInstitucional
                            ? "border-red-400 bg-red-50"
                            : "focus:border-2 focus:border-green-500"
                            }`}
                          placeholder=" "
                        />
                        <IoMailOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-20" />
                        <label
                          className="absolute top-3 left-12 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                         peer-focus:top-[-0.5rem] peer-focus:left-10 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                         peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-10 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                        >
                          Correo institucional
                        </label>
                      </div>
                      {formErrors.correoInstitucional && (
                        <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                          {formErrors.correoInstitucional}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative w-4/5 h-12">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`peer w-full h-full border border-gray-300 rounded-xl px-5 pl-12 pr-12 outline-none bg-transparent z-10 transition-all duration-300 placeholder-transparent ${formErrors.password
                          ? "border-red-400 bg-red-50"
                          : "focus:border-2 focus:border-green-500"
                          }`}
                        placeholder=" "
                      />
                      <IoKeyOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-20" />
                      <label
                        className="absolute top-3 left-12 px-1 bg-white text-gray-400 text-base transition-all duration-300 z-0 pointer-events-none
                                       peer-focus:top-[-0.5rem] peer-focus:left-10 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-green-600
                                       peer-not-placeholder-shown:top-[-0.5rem] peer-not-placeholder-shown:left-10 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-gray-600"
                      >
                        Contraseña
                      </label>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center z-20 transition-transform duration-200 hover:scale-110"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <IoEyeOffOutline className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                        ) : (
                          <IoEyeOutline className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <div className="mt-2 text-sm text-red-600 font-medium w-4/5">
                        {formErrors.password}
                      </div>
                    )}

                    <div className="w-4/5 mt-1 flex justify-start items-center">
                      <div className="flex justify-start items-center">
                        <button
                          type="button"
                          onClick={() => handleGeneratePassword(setFieldValue)}
                          className="py-1 px-3 border-b-2 border-green-500 text-green-600 rounded-none font-semibold hover:bg-green-50 
                          focus:outline-none transition-all duration-300 text-xs bg-transparent cursor-pointer"
                        >
                          <IoKeyOutline className="inline h-3 w-3 mr-1" />
                          Generar contraseña
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-300 w-4/5 ">
                      <label className="block text-16px font-semibold text-gray-700 mb-4 text-center">
                        Rol del usuario:
                      </label>
                      <div className="flex space-x-8 justify-around">
                        <label className="flex items-center cursor-pointer group">
                          <Field
                            type="radio"
                            name="tipoUsuario"
                            value="estudiante"
                            className="form-radio h-5 w-5 text-green-600 border-2 border-gray-300 group-hover:border-green-400 transition-colors cursor-pointer"
                            onChange={() =>
                              handleTipoUsuarioChange(
                                "estudiante",
                                setFieldValue
                              )
                            }
                          />
                          <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors flex items-center gap-1">
                            <IoSchoolOutline className="h-4 w-4" />
                            Estudiante
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                          <Field
                            type="radio"
                            name="tipoUsuario"
                            value="docente"
                            className="form-radio h-5 w-5 text-green-600 border-2 border-gray-300 group-hover:border-green-400 transition-colors cursor-pointer"
                            onChange={() =>
                              handleTipoUsuarioChange("docente", setFieldValue)
                            }
                          />
                          <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors flex items-center gap-1">
                            <IoBusinessOutline className="h-4 w-4" />
                            Docente
                          </span>
                        </label>
                      </div>
                      {formErrors.tipoUsuario && (
                        <div className="mt-3 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                          {formErrors.tipoUsuario}
                        </div>
                      )}
                    </div>
                  </div>

                  {showStudentFields && (
                    <div className="flex justify-center">
                      <div className="flex gap-5 p-4 rounded-2xl border border-green-300 transition-all duration-300 w-4/5">
                        <div className="flex flex-col items-center w-1/2">
                          <label
                            htmlFor="carrera"
                            className="text-sm font-semibold text-gray-700 mb-2 w-full text-left flex items-center gap-1"
                          >
                            <IoBusinessOutline className="h-4 w-4" />
                            Carrera:
                          </label>
                          <Field
                            as="select"
                            name="carrera"
                            className={`block w-full px-4 py-3 text-base border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 cursor-pointer ${formErrors.carrera
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              }`}
                          >
                            <option value="">Seleccionar carrera</option>
                            <option value="ingenieriaSW">
                              Ingeniería en Software
                            </option>
                            <option value="ingenieriaC">
                              Ingeniería en Computación
                            </option>
                            <option value="ciberseguridad">
                              Ciberseguridad
                            </option>
                          </Field>
                          {formErrors.carrera && (
                            <div className="mt-2 text-sm text-red-600 font-medium w-full">
                              {formErrors.carrera}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center w-1/2">
                          <label
                            htmlFor="semestre"
                            className="text-sm font-semibold text-gray-700 mb-2 w-full text-left flex items-center gap-1"
                          >
                            <IoCalendarOutline className="h-4 w-4" />
                            Semestre:
                          </label>
                          <Field
                            as="select"
                            name="semestre"
                            className={`block w-full px-4 py-3 text-base border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 cursor-pointer ${formErrors.semestre
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              }`}
                          >
                            <option value="">Seleccionar semestre</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                              <option key={sem} value={sem}>
                                {sem}° Semestre
                              </option>
                            ))}
                          </Field>
                          {formErrors.semestre && (
                            <div className="mt-2 text-sm text-red-600 font-medium w-full">
                              {formErrors.semestre}
                            </div>
                          )}
                        </div>
                        
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-center">
                    <button
                      type="submit"
                      className="w-4/5 py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r
                       from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                        focus:ring-green-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    
                    >
                      {isLoading ? 'Cargando...' : 'Registrar'}
                      
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

export default ManagerCreateUser;
