export const apiServer = "http://localhost:8080/";
//peticion al back
//http://localhost:8080/

export const API_KEY =
  "http://localhost:8080/api/v1";

  //peticion al servidor de produccion
// "https://alluring-warmth-production.up.railway.app/api/v1";

// WebSocket de notificaciones (STOMP sobre SockJS), mismo host que la API
export const WS_URL = `${new URL(API_KEY).origin}/ws`;
