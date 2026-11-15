import React, { useState } from 'react';
import { IoPeopleOutline, IoBusinessOutline, IoCheckmarkCircle, IoChevronForward, IoBriefcaseOutline } from 'react-icons/io5';
import ManagerCreateUser from './ManagerCreateUser';
import PartnershipForm from './PartnershipForm';
import CompanyAccountForm from './CompanyAccountForm';

const OPCIONES = [
  { valor: 'persona', etiqueta: 'Estudiante o docente', icono: IoPeopleOutline },
  { valor: 'convenio', etiqueta: 'Convenio con empresa', icono: IoBusinessOutline },
  { valor: 'empresa', etiqueta: 'Cuenta de empresa', icono: IoBriefcaseOutline },
];

// Seccion "Crear cuentas" del panel admin: alumnos/docentes, un convenio nuevo o la cuenta de empresa de un convenio.
// onVerConvenios lleva a la lista de convenios del panel.
const ManagerCreateAccounts = ({ onVerConvenios }) => {
  const [tipo, setTipo] = useState('persona');
  const [creado, setCreado] = useState(null); // ultimo convenio creado
  // Convenio preseleccionado al ir de "convenio creado" a "crear su cuenta"
  const [convenioCuenta, setConvenioCuenta] = useState(null);

  const crearCuentaDe = (convenio) => {
    setConvenioCuenta(convenio.idCorporacion);
    setCreado(null);
    setTipo('empresa');
  };

  return (
    <div className='flex-1 min-w-0 bg-gray-50'>
      <div className='flex justify-center px-4 pt-6'>
        <div role='tablist' className='inline-flex flex-wrap justify-center gap-1 p-1 rounded-2xl bg-white border border-gray-200 shadow-sm'>
          {OPCIONES.map(({ valor, etiqueta, icono: Icono }) => (
            <button
              key={valor}
              type='button'
              role='tab'
              aria-selected={tipo === valor}
              onClick={() => { setTipo(valor); setConvenioCuenta(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tipo === valor
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 hover:bg-green-50'}`}
            >
              <Icono className='size-4' /> {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {tipo === 'persona' ? (
        <ManagerCreateUser />
      ) : tipo === 'empresa' ? (
        <div className='flex justify-center p-4'>
          <div className='w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-7'>
            <div className='flex items-center justify-center gap-3 mb-6'>
              <IoBriefcaseOutline className='size-8 text-green-600' />
              <h2 className='text-3xl font-bold text-gray-900'>Cuenta de empresa</h2>
            </div>
            {/* key: al cambiar el convenio preseleccionado el formulario arranca de nuevo */}
            <CompanyAccountForm key={convenioCuenta ?? 'nueva'} idCorporacion={convenioCuenta} />
          </div>
        </div>
      ) : (
        <div className='flex justify-center p-4'>
          <div className='w-full max-w-2xl space-y-4'>
            {creado && (
              <div className='flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200'>
                <IoCheckmarkCircle className='size-6 shrink-0 text-green-600' />
                <p className='flex-1 min-w-0 text-sm text-green-900'>
                  Se creó el convenio con <span className='font-semibold'>{creado.nombreEmpresa}</span>.
                </p>
                <button
                  type='button'
                  onClick={() => crearCuentaDe(creado)}
                  className='px-3 py-1.5 rounded-lg bg-green-600 text-sm font-semibold text-white hover:bg-green-700'
                >
                  Crear su cuenta de empresa
                </button>
                {onVerConvenios && (
                  <button
                    type='button'
                    onClick={onVerConvenios}
                    className='flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline'
                  >
                    Ver convenios <IoChevronForward className='size-4' />
                  </button>
                )}
              </div>
            )}

            <div className='bg-white rounded-3xl shadow-2xl border border-gray-100 p-7'>
              <div className='flex items-center justify-center gap-3 mb-6'>
                <IoBusinessOutline className='size-8 text-green-600' />
                <h2 className='text-3xl font-bold text-gray-900'>Nuevo convenio</h2>
              </div>
              <PartnershipForm onGuardado={setCreado} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCreateAccounts;
