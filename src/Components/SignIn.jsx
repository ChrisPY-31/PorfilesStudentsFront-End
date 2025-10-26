import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const loginSchema = Yup.object().shape({
    usuario: Yup.string().required("El usuario es requerido"),
    password: Yup.string().required("La contraseña es requerida"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    loginSchema
      .validate(values, { abortEarly: false })
      .then(() => {
        setFormErrors({});
        console.log("Datos de login:", values);
        // API de login
        setTimeout(() => {
          alert("Login exitoso");
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

  return (
    <div className="h-[90vh] bg-gradient-to-br bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <Formik
            initialValues={{ usuario: "", password: "" }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="usuario"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Usuario:
                  </label>
                  <Field
                    type="text"
                    name="usuario"
                    className={`block w-full px-4 py-3 text-base border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 ${
                      formErrors.usuario
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    }`}
                    placeholder="2321133"
                  />
                  {formErrors.usuario && (
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      {formErrors.usuario}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`block w-full px-4 py-3 text-base pr-12 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 ${
                        formErrors.password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      }`}
                      placeholder="******"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center transition-transform duration-200 hover:scale-110"
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
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      {formErrors.password}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-green-600
                     hover:bg-green-700 focus:ring-green-500 transform cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Iniciando sesión...
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        ¿Eres reclutador y no tienes cuenta?
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/Sign-Up")}
                    className="font-medium text-green-600 hover:text-green-500 cursor-pointer no-underline hover:underline decoration-2 underline-offset-4 transition-all"
                  >
                    Registrate aqui
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

export default SignIn;
