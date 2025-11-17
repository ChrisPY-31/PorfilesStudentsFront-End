import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoRefreshOutline,
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonAddOutline
} from "react-icons/io5";
import { useCreateUserMutation } from "../services/autenticateUser";
import { toast } from "sonner";
import { useUserAccount } from "../Hooks/useUserAccount";

const SignUp = ({ setAutenticate }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [usuarioLengthError, setUsuarioLengthError] = useState(false);
  const [createUser, { isSuccess, isError, error, data ,isLoading}] = useCreateUserMutation()
  const { getUserNameRol } = useUserAccount();


  useEffect(() => {
    if (isSuccess) {
      localStorage.setItem("token", data.jwt);
      toast.success("Cuenta creada con exitoso");
      localStorage.setItem("username", data?.username);
      getUserNameRol(localStorage.getItem("username"));
      setTimeout(() => {
        navigate("/Inicio");
        setAutenticate(data.jwt);
      }, 1000);
      return
    } else if (isError) {
      toast.message(error.data?.mensaje)
      return
    }
    if(isLoading){
      toast.isLoading("Cargando.....")
    }
  }, [isSuccess, isError , isLoading])

  const registerSchema = Yup.object().shape({
    nombre: Yup.string()
      .required("El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: Yup.string()
      .required("El apellido es requerido")
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    usuario: Yup.string()
      .required("El usuario es requerido")
      .max(10, "El usuario no puede tener más de 10 caracteres"),
    email: Yup.string()
      .required("El email es requerido")
      .email("Email inválido")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Debe ser un email válido (ejemplo: usuario@dominio.com)"
      ),
    password: Yup.string()
      .required("La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .matches(/[0-9]/, "La contraseña debe contener al menos 1 número")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "La contraseña debe contener al menos 1 carácter especial"
      ),
  });

  const generateUsername = (nombre, apellido, setFieldValue) => {
    const randomNum = Math.floor(Math.random() * 90) + 10;
    const baseUsername = `${nombre.toLowerCase().charAt(0)}${apellido.toLowerCase()}`;
    let finalUsername = baseUsername + randomNum;

    if (finalUsername.length > 10) {
      finalUsername = finalUsername.substring(0, 10);
    }

    setFieldValue("usuario", finalUsername);
    setUsuarioLengthError(false);

    if (formErrors.usuario) {
      setFormErrors(prev => ({ ...prev, usuario: "" }));
    }
  };

  const handleUsuarioChange = (e, setFieldValue) => {
    const value = e.target.value;
    setFieldValue("usuario", value);

    if (value.length > 10) {
      setUsuarioLengthError(true);
    } else {
      setUsuarioLengthError(false);
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    registerSchema
      .validate(values, { abortEarly: false })
      .then(() => {
        setFormErrors({});
        setUsuarioLengthError(false);

        const user = {
          username: values.usuario,
          password: values.password,
          email: values.email,
          roleRequest: {
            roleListName: [
              "RECRUITER"
            ]
          }
        }

        const person = {
          nombre: values.nombre,
          apellido: values.apellido
        }

        createUser({ user, person })

        setSubmitting(false);

      })
      .catch((errors) => {
        const errorMap = {};
        errors.inner.forEach((error) => {
          errorMap[error.path] = error.message;
        });
        setFormErrors(errorMap);
        setSubmitting(false);
      });
  };

  const PasswordRequirements = ({ password }) => {
    const hasMinLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirements = [
      {
        text: "Mínimo 6 caracteres",
        isValid: hasMinLength,
      },
      {
        text: "Al menos 1 número",
        isValid: hasNumber,
      },
      {
        text: "Al menos 1 carácter especial",
        isValid: hasSpecialChar,
      },
    ];

    return (
      <div className="mt-2">
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center text-xs">
              <div
                className={`flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center mr-2 ${req.isValid ? "bg-green-500" : "bg-gray-300"
                  }`}
              >
                {req.isValid && (
                  <svg
                    className="w-2 h-2 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={
                  req.isValid ? "text-green-600 font-medium" : "text-gray-500"
                }
              >
                {req.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="h-[90vh] bg-gradient-to-br bg-gray-200 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white py-6 px-6 shadow-2xl rounded-2xl border border-gray-100">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IoPersonAddOutline className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Registra tu cuenta
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Completa tus datos para crear una cuenta
            </p>
          </div>

          <Formik
            initialValues={{
              nombre: "",
              apellido: "",
              usuario: "",
              email: "",
              password: "",
            }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="nombre"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoPersonOutline className="h-4 w-4 text-green-500 mr-2" />
                    Nombre:
                  </label>
                  <Field
                    type="text"
                    name="nombre"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.nombre
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                      }`}
                    placeholder="Nombre"
                  />
                  {formErrors.nombre && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.nombre}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="apellido"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoPersonOutline className="h-4 w-4 text-green-500 mr-2" />
                    Apellido:
                  </label>
                  <Field
                    type="text"
                    name="apellido"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.apellido
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                      }`}
                    placeholder="Apellido"
                  />
                  {formErrors.apellido && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.apellido}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="usuario"
                      className="flex items-center text-sm font-medium text-gray-700"
                    >
                      <IoPersonOutline className="h-4 w-4 text-green-500 mr-2" />
                      Usuario:
                    </label>
                    <button
                      type="button"
                      onClick={() => generateUsername(values.nombre, values.apellido, setFieldValue)}
                      disabled={!values.nombre || !values.apellido}
                      className="flex items-center gap-1 px-3 py-1 border-2 border-gray-300 text-green-600 text-xs rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoRefreshOutline className="h-3 w-3" />
                      Generar
                    </button>
                  </div>
                  <Field
                    type="text"
                    name="usuario"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.usuario || usuarioLengthError
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                      }`}
                    placeholder="Genera tu usuario"
                    maxLength="10"
                    onChange={(e) => handleUsuarioChange(e, setFieldValue)}
                  />
                  {formErrors.usuario && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.usuario}
                    </div>
                  )}
                  {usuarioLengthError && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      El usuario no puede tener más de 10 caracteres
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoMailOutline className="h-4 w-4 text-blue-500 mr-2" />
                    Correo electrónico:
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                      }`}
                    placeholder="usuario@dominio.com"
                  />
                  {formErrors.email && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="flex items-center text-sm font-medium text-gray-700 mb-1"
                  >
                    <IoLockClosedOutline className="h-4 w-4 text-red-500 mr-2" />
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`block w-full px-3 py-2 text-sm pr-10 border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                        }`}
                      placeholder="******"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform duration-200 hover:scale-110"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IoEyeOffOutline className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      ) : (
                        <IoEyeOutline className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.password}
                    </div>
                  )}

                  <div className="min-h-[60px] mt-2">
                    <PasswordRequirements password={values.password} />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-green-600
                     hover:bg-green-700 duration-300 transform cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      </div>
                    ) : (
                      "Registrarse"
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">
                        ¿Ya tienes cuenta?
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/Sign-In")}
                    className=" mt-1 text-sm font-medium text-green-600 hover:text-green-500 cursor-pointer no-underline hover:underline decoration-2 underline-offset-4 transition-all"
                  >
                    Iniciar Sesión
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

export default SignUp;