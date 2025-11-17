import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  IoLockClosedOutline,
  IoPersonOutline,
  IoRefreshOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { useGetAllUsersQuery } from "../services/UserSlice";

const ManagerUpdateUser = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [searchUsername, setSearchUsername] = useState()
  const { data, isSuccess } = useGetAllUsersQuery();
  const [students, setStudents] = useState([])


  useEffect(() => {
    if (isSuccess) {
      setStudents(data.content)
    }
  }, [isSuccess])

  console.log(students)
  const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setFormErrors({});

      const errors = {};

      if (!values.username) {
        errors.username = "Usuario requerido";
      }

      if (!values.password) {
        errors.password = "Contraseña requerida";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setSubmitting(false);
        return;
      }

      console.log("Datos del formulario:", values);

      alert("Contraseña actualizada correctamente");
      setSubmitting(false);
      onCancel();
    } catch (err) {
      setFormErrors({ _general: "Ocurrió un error al actualizar la contraseña" });
      setSubmitting(false);
    }
  };

  const handleGeneratePassword = (setFieldValue) => {
    const newPassword = generatePassword();
    setFieldValue("password", newPassword);
    setPasswordGenerated(true);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const filtered = students?.filter(student => student.nombre.toLowerCase().includes(searchUsername))

  return (
    <div className="w-full ">
      <div className="bg-gradient-to-br from-gray-100 flex items-center justify-center p-4 w-full h-full overflow-y-auto">
        <div className="w-full max-w-md my-4">
          <div className="bg-white py-5 px-6 shadow-2xl rounded-2xl border border-green-100 relative">

            <div className="text-center mb-5 flex gap-3 justify-center items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <IoLockClosedOutline className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Recuperar contraseña
              </h2>
            </div>

            <Formik
              initialValues={{
                username: "",
                password: ""
              }}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ isSubmitting, values, setFieldValue, resetForm }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <IoPersonOutline className="h-4 w-4 text-blue-500 mr-2" />
                      Usuario
                    </label>
                    <Field
                      name='username'
                      value={searchUsername}
                      type="text"
                      onChange={(e) => setSearchUsername(e.target.value)}
                      className={`block w-full px-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.username
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        }`}
                      placeholder="Usuario"
                    />
                    {formErrors.username && (
                      <div className="mt-2 text-sm text-red-600 font-medium">
                        {formErrors.username}
                      </div>
                    )}
                  </div>
                  <div>
                    {
                     searchUsername?.length > 0 ? 
                      filtered.map(student => (
                        <div className="flex gap-3 my-4"
                        >
                          <img className="size-10 rounded-full cursor-pointer" src={`${student.imagen ? student.imagen : "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true"}`} alt="" />
                          <div>
                            <h4 className="text-sm font-medium ">{`${student.nombre} ${student.apellido}`}</h4>
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{student.carrera?.carrera}</p>
                          </div>
                        </div>
                      ))
                      :
                      <div></div>
                    }
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <IoLockClosedOutline className="h-4 w-4 text-blue-500 mr-2" />
                        Generar nueva contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGeneratePassword(setFieldValue)}
                        className="flex items-center gap-1 px-3 py-1 border-2 border-gray-300 text-green-600 text-xs rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium"
                      >
                        <IoRefreshOutline className="h-3 w-3" />
                        Generar
                      </button>
                    </div>

                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className={`block w-full px-3 py-2 pr-10 text-sm border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ${formErrors.password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                          }`}
                        placeholder="Nueva contraseña"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <IoEyeOffOutline className="h-4 w-4" />
                        ) : (
                          <IoEyeOutline className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <div className="mt-2 text-sm text-red-600 font-medium">
                        {formErrors.password}
                      </div>
                    )}

                    {passwordGenerated && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <IoCheckmarkCircleOutline className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-green-700 font-medium">
                          Contraseña generada exitosamente
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setPasswordGenerated(false);
                        setShowPassword(false);
                        setFormErrors({});
                        onCancel();
                      }}
                      className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 font-semibold text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center px-5 py-2 border border-transparent rounded-lg shadow text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      <IoCheckmarkCircleOutline className="h-4 w-4 mr-1" />
                      Actualizar Contraseña
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

export default ManagerUpdateUser;