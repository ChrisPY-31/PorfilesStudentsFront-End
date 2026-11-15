import React from "react";

// Pie de paginacion para respuestas Page de Spring (page desde 0).
// Siempre muestra el rango y la pagina (aunque todo quepa en una); los botones se desactivan en los extremos.
const Paginacion = ({ pagina, totalPaginas, total, porPagina, onCambiar, cargando = false, className = "" }) => {
    if (!total) return null;
    totalPaginas = Math.max(1, totalPaginas);
    const desde = pagina * porPagina + 1;
    const hasta = Math.min((pagina + 1) * porPagina, total);
    const boton = "px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40";

    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 text-sm ${className}`}>
            <p className="text-gray-500">
                {desde}–{hasta} de {total}
                <span className="ml-2 text-gray-400">· Página {pagina + 1} de {totalPaginas}</span>
            </p>
            <div className="flex gap-2">
                <button type="button" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0 || cargando} className={boton}>
                    Anterior
                </button>
                <button type="button" onClick={() => onCambiar(pagina + 1)} disabled={pagina >= totalPaginas - 1 || cargando} className={boton}>
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default Paginacion;
