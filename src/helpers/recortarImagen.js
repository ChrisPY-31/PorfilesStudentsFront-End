// Formatos que dejamos elegir; HEIC y otros no se pueden leer en la mayoria de navegadores
export const FORMATOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
export const MAX_MB_IMAGEN = 10;

export const validarImagen = (archivo) => {
  if (!FORMATOS_IMAGEN.includes(archivo.type)) {
    return "Formato no permitido. Usa JPG, PNG o WebP";
  }
  if (archivo.size > MAX_MB_IMAGEN * 1024 * 1024) {
    return `La imagen pesa más de ${MAX_MB_IMAGEN} MB`;
  }
  return null;
};

const cargarImagen = (src) =>
  new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error("No se pudo leer la imagen"));
    imagen.src = src;
  });

// Recorta el area elegida en el Cropper (en pixeles de la imagen original),
// la escala a un cuadrado de `tamano` px y la devuelve como JPEG comprimido
export const recortarImagen = async (src, area, tamano = 512, calidad = 0.85) => {
  const imagen = await cargarImagen(src);
  const canvas = document.createElement("canvas");
  canvas.width = tamano;
  canvas.height = tamano;
  const ctx = canvas.getContext("2d");

  // JPEG no tiene transparencia: un PNG transparente quedaria negro sin este fondo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tamano, tamano);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imagen, area.x, area.y, area.width, area.height, 0, 0, tamano, tamano);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", calidad));
  if (!blob) throw new Error("No se pudo procesar la imagen");
  return new File([blob], "perfil.jpg", { type: "image/jpeg" });
};

// Reduce la imagen para que su lado mayor no pase de `maxLado` px, sin recortarla,
// y la devuelve como JPEG comprimido (para publicaciones y proyectos)
export const comprimirImagen = async (archivo, maxLado = 1600, calidad = 0.85) => {
  const src = URL.createObjectURL(archivo);
  try {
    const imagen = await cargarImagen(src);
    const escala = Math.min(1, maxLado / Math.max(imagen.width, imagen.height));
    const ancho = Math.round(imagen.width * escala);
    const alto = Math.round(imagen.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imagen, 0, 0, ancho, alto);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", calidad));
    if (!blob) throw new Error("No se pudo procesar la imagen");
    return new File([blob], "imagen.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(src);
  }
};
