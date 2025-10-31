import React from 'react';
import { FaHandshake, FaLightbulb, FaUsers } from "react-icons/fa";

const CardsHome = () => {
    return (
        <div className='flex justify-between my-10'>
            <div className="max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl duration-300 transform hover:border-green-400">
                <a href="#">
                    <FaHandshake className="text-2xl text-teal-500 mb-3" />
                    <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">Conecta con Estudiantes</h5>
                </a>
                <p className="mb-3 font-normal text-gray-500">Encuentra y conectate con los mejores estudiantes para tu empresa</p>
            </div>
            
            <div className="max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl duration-300 transform hover:border-green-400">
                <a href="#">
                    <FaLightbulb className="text-2xl text-teal-500 mb-3" />
                    <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">Descubre Proyectos Destacados</h5>
                </a>
                <p className="mb-3 font-normal text-gray-500">Descubre portfolios estudiantiles y evalúa habilidades técnicas con aplicación práctica.</p>
            </div>

            <div className="max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl duration-300 transform hover:border-green-400">
                <a href="#">
                    <FaUsers className="text-2xl text-teal-500 mb-3" />
                    <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">Comunidad Estudiantil</h5>
                </a>
                <p className="mb-3 font-normal text-gray-500">Podrás ver todas las publicaciones que el estudiante comparte: proyectos, metas, etc.</p>
            </div>
        </div>
    )
}

export default CardsHome;