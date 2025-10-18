import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();

  //Validaciones
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email inválido")
      .required("*Campo obligatorio"),
    password: Yup.string().required("*Campo obligatorio"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Datos de login:", values);

    // API de login
    setTimeout(() => {
      // login exitoso
      alert("Login exitoso");
      navigate("/"); // Redirige al home
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md ">
            <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-700">
              Iniciar sesión
            </h2>
            {/* <p className="mt-2 text-center text-sm text-gray-600"> 
          Para estudiantes, docentes y administradores
        </p>   */}
          </div>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mt-5"
                  >
                    Correo electronico:
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.email && touched.email
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="tucorreo@email.com"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contraseña:
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.password && touched.password
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="********"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿Eres reclutador y no tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/Sign-Up")}
                      className="font-medium text-green-600 hover:text-green-500 focus:outline-none cursor-pointer"
                    >
                      Regístrate aquí
                    </button>
                  </p>
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
