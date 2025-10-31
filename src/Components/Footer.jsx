import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaBriefcase, 
  FaEnvelope, 
  FaShieldAlt, 
  FaFileContract,
  FaHome,
  FaProjectDiagram
} from 'react-icons/fa';
import { AiTwotoneProject } from "react-icons/ai";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
<footer className="bg-white py-8 mt-16 w-full">
  {/* Línea verde SOLA */} 
  <div className="border-t border-green-400 w-full mx-auto"></div> 
  
  {/* Contenido del footer */}
  <div className="max-w-6xl mx-auto px-4 mt-8">
    <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-6">
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <FaGraduationCap className="text-2xl text-teal-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-green-600 bg-clip-text text-transparent">
            UniConnect
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Conectando talento universitario con empresas
        </p>
      </div>

          <div className="flex-1 grid grid-cols-2 gap-6">
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Navegación</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={scrollToTop}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-500 cursor-pointer transition-colors"
                  >
                    <FaHome className="text-sm" />
                    Inicio
                  </button>
                </li>
                <li>
                  <Link 
                    to="/Comunity" 
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-500 transition-colors"
                  >
                    <FaUsers className="text-sm" />
                    Comunidad
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/Projects" 
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-500 transition-colors"
                  >
                    <AiTwotoneProject className="text-sm" />
                    Proyectos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-teal-500 transition-colors">
                    <FaEnvelope className="text-sm" />
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-teal-500 transition-colors">
                    <FaShieldAlt className="text-sm" />
                    Aviso de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-teal-500 transition-colors">
                    <FaFileContract className="text-sm" />
                    Términos y Condiciones
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        <div className='mt-2' >
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 UniConnect. Todos los derechos reservados.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;