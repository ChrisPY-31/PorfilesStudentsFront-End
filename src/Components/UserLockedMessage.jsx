import React, { use } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UserLockedMessage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userLocked");
        toast.info("Cerrando sesión...");
        document.body.className = "";
        setTimeout(() => {
            navigate('/');
        }, 1000);
    }
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]"
            role="alert"
        >
            <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 text-center animate-fadeIn">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 text-red-600 p-4 rounded-full shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-red-600 mb-2">
                    Cuenta Bloqueada Temporalmente
                </h2>

                <p className="text-gray-700 mb-6">
                    Por favor, contacte al administrador para más información.
                </p>

                <button
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>

    )
}

export default UserLockedMessage