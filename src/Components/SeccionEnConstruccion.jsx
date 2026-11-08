import { IoConstructOutline } from "react-icons/io5";

// Seccion de Ajustes que aun no tiene contenido (se van llenando por fases)
const SeccionEnConstruccion = ({ titulo, descripcion, icono }) => (
  <div className="flex-1 p-6 md:p-10 bg-gray-50">
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-900">{titulo}</h1>
      <div className="mt-6 flex flex-col items-center text-center gap-3 p-10 bg-white rounded-2xl border border-dashed border-gray-300">
        {icono && <span className="size-14 flex items-center justify-center rounded-2xl bg-green-50 text-green-600 [&>svg]:size-7">{icono}</span>}
        <p className="max-w-md text-sm text-gray-600">{descripcion}</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
          <IoConstructOutline className="size-4" /> En construcción
        </span>
      </div>
    </div>
  </div>
);

export default SeccionEnConstruccion;
