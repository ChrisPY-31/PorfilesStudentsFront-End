// Conversacion que se esta viendo en pantalla (la registra ChatConversation al montarse).
// La usa el WebSocket para saber si un mensaje nuevo se marca como leido o suma a "no leidos".
let conversacionAbierta = null;

export const abrirConversacionActiva = (idConversacion) => { conversacionAbierta = idConversacion; };
export const cerrarConversacionActiva = (idConversacion) => {
  if (conversacionAbierta === idConversacion) conversacionAbierta = null;
};
export const conversacionActiva = () => conversacionAbierta;

// Remitente de los mensajes propios segun el rol de la sesion (IssuerType del back)
export const MI_REMITENTE = { recruiter: "RECLUTADOR", student: "ALUMNO" };
