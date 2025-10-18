import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();

  //validaciones
  const registerSchema = Yup.object().shape({
    empresa: Yup.string()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
      .required('*Campo obligatorio'),
    puesto: Yup.string()
      .min(2, 'El puesto debe tener al menos 2 caracteres')
      .required('*Campo obligatorio'),
    nombreEmpresa: Yup.string()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
      .required('El nombre de la empresa es requerido'),
    email: Yup.string()
      .email('Email inválido')
      .required('*Campo obligatorio'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('*Campo obligatorio'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
      .required('Debes confirmar tu contraseña')
  });

  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Datos de registro:', values);
    
    setTimeout(() => {
      alert('Registro exitoso');
      navigate('/');
      setSubmitting(false);
    }, 1000);
  };

  return (


      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-2 px-4 shadow sm:rounded-lg sm:px-10 ">
              <div className="min-h-screen bg-gray-50 flex flex-col pt-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-900">
          Registra tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Completa tus datos para crear una cuenta 
        </p>
      </div>
          <Formik
            initialValues={{
              empresa: '',
              puesto: '',
              nombreEmpresa: '',
              email: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mt-8">
                    Empresa:
                  </label>
                  <Field
                    type="text"
                    name="empresa"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.empresa && touched.empresa ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de tu empresa"
                  />
                  <ErrorMessage name="empresa" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">
                    Puesto:
                  </label>
                  <Field
                    type="text"
                    name="puesto"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.puesto && touched.puesto ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu puesto en la empresa"
                  />
                  <ErrorMessage name="puesto" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-gray-700">
                    Nombre de la Empresa:
                  </label>
                  <Field
                    type="text"
                    name="nombreEmpresa"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.nombreEmpresa && touched.nombreEmpresa ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Razón social de la empresa"
                  />
                  <ErrorMessage name="nombreEmpresa" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electronico:
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="tucorreo@email.com"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña:
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="********"
                  />
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar contraseña:
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="********"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrarse'}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/Sign-In')}
                      className="font-medium text-green-600 hover:text-green-500 focus:outline-none"
                    >
                      Inicia sesión aquí
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

export default SignUp; 