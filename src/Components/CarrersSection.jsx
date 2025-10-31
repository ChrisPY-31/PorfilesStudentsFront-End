import React from 'react';
import { FaCode, FaMicrochip, FaShieldAlt } from 'react-icons/fa';

const CareersSection = () => {
  return (
    <section className="py-3 w-full mx-auto">
      <div className=" mb-10 ">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Conoce nuestras carreras
        </h2>
        <p className="text-xl text-gray-600">
          Conoce las carreras y proyectos innovadores del Centro Universitario UAEM Tianguistenco
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-9">
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl duration-300 
        transform hover:-translate-y-2 cursor-pointer hover:border-green-400">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaCode className="text-2xl text-teal-500" />
              <h3 className="text-xl font-bold text-gray-800">
                Ingeniería en Software
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Creación de soluciones de software escalables y aplicaciones innovadoras.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 
        transform hover:-translate-y-2 cursor-pointer hover:border-green-400">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaMicrochip className="text-2xl text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">
                Ingeniería en Computación
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Diseño y construcción de sistemas de hardware y software integrados.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 
        transform hover:-translate-y-2 cursor-pointer hover:border-green-400">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaShieldAlt className="text-2xl text-orange-500" />
              <h3 className="text-xl font-bold text-gray-800">
                Ciberseguridad
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Protección de sistemas y redes digitales contra amenazas cibernéticas.
            </p>
          </div>
        </div>
      </div>


    </section>
  );
};

export default CareersSection;