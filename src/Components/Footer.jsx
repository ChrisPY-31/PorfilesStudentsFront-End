import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IoSchool,
  IoHomeOutline,
  IoPeopleOutline,
  IoFolderOpenOutline,
  IoLogInOutline,
  IoPersonAddOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoArrowUp
} from 'react-icons/io5';

// Los enlaces cambian si hay sesion o no
const NAVEGACION_SESION = [
  { to: '/Inicio', label: 'Inicio', icon: IoHomeOutline },
  { to: '/Students', label: 'Estudiantes', icon: IoPeopleOutline },
  { to: '/Projects', label: 'Proyectos', icon: IoFolderOpenOutline },
];
const NAVEGACION_PUBLICA = [
  { to: '/', label: 'Inicio', icon: IoHomeOutline },
  { to: '/Sign-In', label: 'Inicia sesión', icon: IoLogInOutline },
  { to: '/Sign-Up', label: 'Regístrate', icon: IoPersonAddOutline },
];
// Aun no tienen pagina
const LEGAL = [
  { label: 'Contacto', icon: IoMailOutline },
  { label: 'Aviso de privacidad', icon: IoShieldCheckmarkOutline },
  { label: 'Términos y condiciones', icon: IoDocumentTextOutline },
];

const claseEnlace = 'flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors';

const Footer = ({ autenticate }) => {
  const navegacion = autenticate ? NAVEGACION_SESION : NAVEGACION_PUBLICA;

  return (
    <footer className="mt-16 bg-white border-t border-gray-200">
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Marca */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-display">
              <span className="flex items-center justify-center size-9 rounded-xl bg-green-600 text-white shadow-sm">
                <IoSchool className="size-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Uni<span className="text-green-600">Connect</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-gray-600 leading-relaxed">
              Conectando el talento universitario del Centro Universitario UAEMEX Tianguistenco con docentes y empresas.
            </p>
          </div>

          {/* Navegacion */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Navegación</h3>
            <ul className="space-y-2.5">
              {navegacion.map(({ to, label, icon: Icono }) => (
                <li key={to}>
                  <Link to={to} className={claseEnlace}>
                    <Icono className="size-4" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2.5">
              {LEGAL.map(({ label, icon: Icono }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => toast.message(`${label} estará disponible próximamente`)}
                    className={claseEnlace}
                  >
                    <Icono className="size-4" /> {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} UniConnect. Todos los derechos reservados.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-700 transition-colors"
          >
            <IoArrowUp className="size-4" /> Volver arriba
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
