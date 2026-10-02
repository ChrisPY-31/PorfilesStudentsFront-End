import {
  getUserDetails,
  limpiarPerfil,
  getUserName,
  getUserToken,
} from "../store/UserAccount/userAccountSlice";
import { getIdStudent, getStudents } from "../store/UserAccount/studentSlice";

import { useAppDispatch } from "./store";
import axios from "axios";
import { API_KEY } from "../api/api";
import { CLAVES_SESION, limpiarEstadoSesion } from "../store/sesion";

export const useUserAccount = () => {
  const dispatch = useAppDispatch();

  const getAllStudents = (students) => {
    dispatch(getStudents(students));
  };

  const getIdUser = (idUser) => {
    dispatch(getIdStudent(idUser));
  };

  const getUser = (user) => {
    dispatch(getUserDetails(user));
  };

  const tokenUser = (token) => {
    dispatch(getUserToken(token));
  };

  const getUserByUsername = async (username, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    username = username.toString();
    try {
      const users = await axios.get(`${API_KEY}/userAccount/${username}`, config);
      dispatch(getUserDetails(users.data.object));
    } catch (error) {
      // Ej. el administrador no tiene persona: no dejar el perfil de la sesion anterior
      dispatch(limpiarPerfil());
      throw error;
    }
  };

  const getMyUserAccount = (myUserAccount) => {
    dispatch(getMyUserAccount(myUserAccount));
  };

  const getUserNameRol = (username) =>{
    dispatch(getUserName(username))
  }

  // Login: guarda la sesion nueva y descarta todo lo de la anterior
  const iniciarSesion = ({ token, username, userLocked }) => {
    CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave));
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("sesionInicio", Date.now());
    if (userLocked !== undefined) localStorage.setItem("userLocked", userLocked);
    dispatch(limpiarEstadoSesion());
  };

  const cerrarSesion = () => {
    CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave));
    document.body.className = "";
    dispatch(limpiarEstadoSesion());
  };

  return {
    getUser,
    tokenUser,
    getAllStudents,
    getIdUser,
    getUserByUsername,
    getMyUserAccount,
    getUserNameRol,
    iniciarSesion,
    cerrarSesion
  };
};
