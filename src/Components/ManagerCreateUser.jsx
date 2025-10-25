import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const ManagerCreateUser = () => {
  const navigate = useNavigate();

  // Validaciones
  const registerSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .required('*Campo obligatorio'),
    apellidoPaterno: Yup.string()
      .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
      .required('*Campo obligatorio'),
    apellidoMaterno: Yup.string()
      .min(2, 'El apellido materno debe tener al menos 2 caracteres')
      .required('*Campo obligatorio'),
    numeroCuenta: Yup.string()
      .matches(/^[0-9]+$/, '*El número de cuenta debe contener solo números')
      .length(7, '*El número de cuenta debe tener exactamente 7 dígitos')
      .required('*Campo obligatorio'),
    correoInstitucional: Yup.string()
      .email('Email institucional inválido')
      .required('*Campo obligatorio'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('*Campo obligatorio'),
    tipoUsuario: Yup.string()
      .required('*Debes seleccionar un tipo de usuario'),
    carrera: Yup.string()
      .when('tipoUsuario', {
        is: 'estudiante',
        then: Yup.string().required('*Campo obligatorio para estudiantes'),
        otherwise: Yup.string().notRequired()
      }),
    semestre: Yup.string()
      .when('tipoUsuario', {
        is: 'estudiante',
        then: Yup.string().required('*Campo obligatorio para estudiantes'),
        otherwise: Yup.string().notRequired()
      })
  });   3
  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Datos de registro:', values);
    
    setTimeout(() => {
      alert('Usuario registrado exitosamente');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-900">
          Registro de estudiantes y docentes
        </h2>
      </div>
          <Formik
            initialValues={{
              nombre: '',
              apellidoPaterno: '',
              apellidoMaterno: '',
              numeroCuenta: '',
              correoInstitucional: '',
              password: '',
              tipoUsuario: '',
              carrera: '',
              semestre: ''
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-6">
                <div>
                  
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre(s):
                    </label>
                    <Field
                      type="text"
                      name="nombre"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.nombre && touched.nombre ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ingrese su nombre"
                    />
                    <ErrorMessage name="nombre" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700">
                      Apellido Paterno:
                    </label>
                    <Field
                      type="text"
                      name="apellidoPaterno"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.apellidoPaterno && touched.apellidoPaterno ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ingrese apellido paterno"
                    />
                    <ErrorMessage name="apellidoPaterno" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700">
                      Apellido Materno:
                    </label>
                    <Field
                      type="text"
                      name="apellidoMaterno"
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.apellidoMaterno && touched.apellidoMaterno ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ingrese apellido materno"
                    />
                    <ErrorMessage name="apellidoMaterno" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="numeroCuenta" className="block text-sm font-medium text-gray-700">
                    Número de cuenta:
                  </label>
                  <Field
                    type="text"
                    name="numeroCuenta"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.numeroCuenta && touched.numeroCuenta ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese número de cuenta"
                  />
                  <ErrorMessage name="numeroCuenta" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="correoInstitucional" className="block text-sm font-medium text-gray-700">
                    Correo Institucional:
                  </label>
                  <Field
                    type="email"
                    name="correoInstitucional"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.correoInstitucional && touched.correoInstitucional ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="usuario@uaemex.mx"
                  />
                  <ErrorMessage name="correoInstitucional" component="div" className="mt-1 text-sm text-red-600" />
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
                  <label htmlFor="tipoUsuario" className="block text-sm font-medium text-gray-700">
                    Rol del usuario:
                  </label>
                  <div className="mt-2 space-y-2">
                    <label className="inline-flex items-center mr-4">
                      <Field
                        type="radio"
                        name="tipoUsuario"
                        value="estudiante"
                        className="form-radio h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">Estudiante</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field
                        type="radio"
                        name="tipoUsuario"
                        value="docente"
                        className="form-radio h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">Docente</span>
                    </label>
                  </div>
                  <ErrorMessage name="tipoUsuario" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {values.tipoUsuario === 'estudiante' && (
                  <>
                    <div>
                      <label htmlFor="carrera" className="block text-sm font-medium text-gray-700">
                        Carrera:
                      </label>
                      <Field
                        as="select"
                        name="carrera"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.carrera && touched.carrera ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccione una carrera</option>
                        <option value="ingenieriaSW">Ingeniería en Software</option>
                        <option value="ingenieriaC">Ingeniería en Computación</option>
                        <option value="ciberseguridad">Ciberseguridad</option>
                      </Field>
                      <ErrorMessage name="carrera" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="semestre" className="block text-sm font-medium text-gray-700">
                        Semestre:
                      </label>
                      <Field
                        as="select"
                        name="semestre"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.semestre && touched.semestre ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seleccione un semestre</option>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                          <option key={sem} value={sem}>
                            {sem}° Semestre
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="semestre" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrar'}
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

export default ManagerCreateUser;