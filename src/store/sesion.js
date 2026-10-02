import { createAction } from "@reduxjs/toolkit";
import { usersApiSlice } from "../services/autenticateUser";
import { userSlice } from "../services/UserSlice";
import { publicationApi } from "../services/publication";
import { updatePersonApi } from "../services/updatePerson";
import { recomendationStudent } from "../services/recomentationStudent";
import { projectUserApi } from "../services/projectsUser";
import { notificationsApi } from "../services/notifications";

// Claves de la sesion guardadas en localStorage
export const CLAVES_SESION = ["token", "username", "userLocked", "idPerson", "sesionInicio"];

// El back firma el token con 30 min de vida (withExpiresAt(now + 1800000))
const DURACION_TOKEN_MS = 30 * 60 * 1000;

// Momento (ms) en que vence el token: se lee el "exp" del JWT y, si no viene,
// se calcula con la hora del login guardada en localStorage
export const expiracionToken = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    if (exp) return exp * 1000;
  } catch {
    // Token sin formato JWT: se usa el respaldo
  }
  const inicio = Number(localStorage.getItem("sesionInicio"));
  return inicio ? inicio + DURACION_TOKEN_MS : null;
};

// La atiende el reducer raiz: regresa todos los slices a su estado inicial
export const reiniciarSesion = createAction("sesion/reiniciar");

const APIS = [
  usersApiSlice,
  userSlice,
  publicationApi,
  updatePersonApi,
  recomendationStudent,
  projectUserApi,
  notificationsApi,
];

// Borra todo lo que quedo en memoria de la sesion anterior (perfil, cache de peticiones).
// Los slices leen localStorage al reiniciarse, asi que se llama despues de cambiarlo.
export const limpiarEstadoSesion = () => (dispatch) => {
  APIS.forEach((api) => dispatch(api.util.resetApiState()));
  dispatch(reiniciarSesion());
};
