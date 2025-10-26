import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const registerSchema = Yup.object().shape({
    usuario: Yup.string()
      .required("El usuario es requerido")
      .min(3, "El nombre del usuario debe tener al menos 3 caracteres"),
    puesto: Yup.string().required("El puesto es requerido"),
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

  const handleSubmit = (values, { setSubmitting }) => {
    registerSchema
      .validate(values, { abortEarly: false })
      .then(() => {
        setFormErrors({});
        console.log("Datos de registro:", values);

        setTimeout(() => {
          alert("Registro exitoso");
          navigate("/");
          setSubmitting(false);
        }, 1000);
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
                className={`flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center mr-2 ${
                  req.isValid ? "bg-green-500" : "bg-gray-300"
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
            <h2 className="text-center text-2xl font-bold text-gray-900">
              Registra tu cuenta
            </h2>
            <p className="mt-1 text-gray-600 text-sm">
              Completa tus datos para crear una cuenta
            </p>
          </div>

          <Formik
            initialValues={{
              usuario: "",
              puesto: "",
              email: "",
              password: "",
            }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="usuario"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Usuario:
                  </label>
                  <Field
                    type="text"
                    name="usuario"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.usuario
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                    }`}
                    placeholder="Nombre de usuario"
                  />
                  {formErrors.usuario && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.usuario}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="puesto"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Puesto:
                  </label>
                  <Field
                    type="text"
                    name="puesto"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.puesto
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200"
                    }`}
                    placeholder="Puesto en la empresa"
                  />
                  {formErrors.puesto && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      {formErrors.puesto}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correo electrónico:
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.email
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
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`block w-full px-3 py-2 text-sm pr-10 border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${
                        formErrors.password
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
