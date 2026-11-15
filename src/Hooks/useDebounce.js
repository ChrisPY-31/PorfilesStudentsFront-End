import { useEffect, useState } from "react";

// Regresa `valor` cuando deja de cambiar durante `ms` (para no consultar al back en cada tecla)
export const useDebounce = (valor, ms = 400) => {
  const [actual, setActual] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setActual(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return actual;
};
