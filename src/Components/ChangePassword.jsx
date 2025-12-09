import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { IoEyeOutline, IoEyeOffOutline, IoLockClosedOutline } from "react-icons/io5";
import { useUpdatePasswordUserMutation } from "../services/UserSlice";
import { toast } from "sonner";

const ChangePassword = () => {
    const [formErrors, setFormErrors] = useState({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [updatePasswordUser, { isSuccess, error, }] = useUpdatePasswordUserMutation();

    useEffect(() => {
        if (isSuccess) {
            toast.success("Contraseña actualizada con exito");
            return
        }
        if (error) {
            toast.error("Error el usuario no exite intentelo mas tarde")
        }

    }, [isSuccess, error])


    const handleSubmit = async (values, { setSubmitting }) => {
        const errors = {};

        if (!values.newPassword) errors.newPassword = "Ingresa la nueva contraseña";
        if (!values.confirmPassword) errors.confirmPassword = "Confirma la contraseña";
        if (values.newPassword !== values.confirmPassword)
            errors.confirmPassword = "Las contraseñas no coinciden";

        setFormErrors(errors);

        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");
        const newPassword = values.newPassword;
        await updatePasswordUser({ username, newPassword, token });
        values.newPassword = "";
        values.confirmPassword = "";

        setSubmitting(false);
    };

    return (
        <div className="w-full">
            <div className="h-[90vh] bg-gradient-to-br bg-gray-100 flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-md mx-4">
                    <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <IoLockClosedOutline className="h-7 w-7 text-green-600" />
                                <h2 className="text-center text-3xl font-bold text-gray-900">
                                    Cambio de contraseña
                                </h2>
                            </div>
                        </div>

                        <Formik
                            initialValues={{ newPassword: "", confirmPassword: "" }}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-6">

                                    <div>
                                        <label
                                            htmlFor="newPassword"
                                            className="flex text-base font-medium text-gray-700 mb-2"
                                        >
                                            <IoLockClosedOutline className="h-4 w-4 text-green-500 mr-2 mt-1" />
                                            Nueva contraseña:
                                        </label>
                                        <div className="relative">
                                            <Field
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                className={`block w-full px-4 py-3 text-base pr-12 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 ${formErrors.newPassword
                                                    ? "border-red-400 bg-red-50"
                                                    : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                    }`}
                                                placeholder="******"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-transform duration-200 hover:scale-110"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <IoEyeOffOutline className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                ) : (
                                                    <IoEyeOutline className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                )}
                                            </button>
                                        </div>
                                        {formErrors.newPassword && (
                                            <div className="mt-2 text-sm text-red-600 font-medium">
                                                {formErrors.newPassword}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="flex text-base font-medium text-gray-700 mb-2"
                                        >
                                            <IoLockClosedOutline className="h-4 w-4 text-green-500 mr-2 mt-1" />
                                            Confirmar nueva contraseña:
                                        </label>
                                        <div className="relative">
                                            <Field
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                className={`block w-full px-4 py-3 text-base pr-12 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 ${formErrors.confirmPassword
                                                    ? "border-red-400 bg-red-50"
                                                    : "border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                    }`}
                                                placeholder="******"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-transform duration-200 hover:scale-110"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <IoEyeOffOutline className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                ) : (
                                                    <IoEyeOutline className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                )}
                                            </button>
                                        </div>
                                        {formErrors.confirmPassword && (
                                            <div className="mt-2 text-sm text-red-600 font-medium">
                                                {formErrors.confirmPassword}
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
                                            Cambiar contraseña
                                        </button>
                                    </div>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            className="font-medium text-green-600 hover:text-green-500 cursor-pointer no-underline hover:underline decoration-2 underline-offset-4 transition-all"
                                        >
                                            Volver al perfil
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

export default ChangePassword;