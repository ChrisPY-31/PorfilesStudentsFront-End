import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from 'react-icons/fa';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const registerSchema = Yup.object().shape({
    usuario: Yup.string()
      .min(3, 'El nombre del usuario debe tener al menos 3 caracteres'),
    puesto: Yup.string()
      .required('*Campo obligatorio'),
    email: Yup.string()
      .email('Email inválido'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .matches(/[0-9]/, 'La contraseña debe contener al menos 1 número')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos 1 carácter especial')
  });

  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Datos de registro:', values);

    setTimeout(() => {
      alert('Registro exitoso');
      navigate('/');
      setSubmitting(false);
    }, 1000);
  };

  const PasswordRequirements = ({ password }) => {
    const hasMinLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirements = [
      {
        text: 'Mínimo 6 caracteres',
        isValid: hasMinLength
      },
      {
        text: 'Al menos 1 número',
        isValid: hasNumber
      },
      {
        text: 'Al menos 1 carácter especial',
        isValid: hasSpecialChar
      }
    ];

    return (
      <div className="mt-2">
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center text-xs">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mr-2 ${req.isValid ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                {req.isValid && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={req.isValid ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {req.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 h-[90vh] overflow-hidden py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 shadow sm:rounded-lg sm:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Registra tu cuenta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Completa tus datos para crear una cuenta
            </p>
          </div>
          <Formik
            initialValues={{
              usuario: '',
              puesto: '',
              email: '',
              password: ''
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-4 mt-4">
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                    Usuario:
                  </label>
                  <Field
                    type="text"
                    name="usuario"
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${errors.usuario && touched.usuario ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Nombre de usuario"
                  />
                  <ErrorMessage name="usuario" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">
                    Puesto:
                  </label>
                  <Field
                    type="text"
                    name="puesto"
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${errors.puesto && touched.puesto ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Puesto en la empresa"
                  />
                  <ErrorMessage name="puesto" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico:
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="correo@uaemex.mx"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="******"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaRegEyeSlash className="h-5 w-5 text-gray-400"/>
                      ) : (

                        <IoEyeOutline className="h-5 w-5 text-gray-400"/>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />

                  <div className="min-h-[80px]">
                    <PasswordRequirements password={values.password} />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
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
                      className="font-medium text-green-600 hover:text-green-500 focus:outline-none cursor-pointer transition-colors duration-200"
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