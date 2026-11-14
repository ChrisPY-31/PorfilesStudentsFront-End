import React, { useState } from 'react';
import { IoPeopleOutline, IoBusinessOutline, IoCheckmarkCircle, IoChevronForward } from 'react-icons/io5';
import ManagerCreateUser from './ManagerCreateUser';
import PartnershipForm from './PartnershipForm';

const OPCIONES = [
  { valor: 'persona', etiqueta: 'Estudiante o docente', icono: IoPeopleOutline },
  { valor: 'convenio', etiqueta: 'Convenio con empresa', icono: IoBusinessOutline },
];

// Seccion "Crear cuentas" del panel admin: alumnos/docentes o un convenio nuevo.
// onVerConvenios lleva a la lista de convenios del panel.
const ManagerCreateAccounts = ({ onVerConvenios }) => {
  const [tipo, setTipo] = useState('persona');
  const [creado, setCreado] = useState(null); // ultimo convenio creado

  return (
    <div className='flex-1 min-w-0 bg-gray-50'>
      <div className='flex justify-center px-4 pt-6'>
        <div role='tablist' className='inline-flex p-1 rounded-2xl bg-white border border-gray-200 shadow-sm'>
          {OPCIONES.map(({ valor, etiqueta, icono: Icono }) => (
            <button
              key={valor}
              type='button'
              role='tab'
              aria-selected={tipo === valor}
              onClick={() => setTipo(valor)}
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
      ) : (
        <div className='flex justify-center p-4'>
          <div className='w-full max-w-2xl space-y-4'>
            {creado && (
              <div className='flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200'>
                <IoCheckmarkCircle className='size-6 shrink-0 text-green-600' />
                <p className='flex-1 min-w-0 text-sm text-green-900'>
                  Se creó el convenio con <span className='font-semibold'>{creado.nombreEmpresa}</span>.
                </p>
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
