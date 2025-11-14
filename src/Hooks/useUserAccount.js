import {
  getUserDetails,
  getUserName,
  getUserToken,
} from "../store/UserAccount/userAccountSlice";
import { getIdStudent, getStudents } from "../store/UserAccount/studentSlice";

import { useAppDispatch } from "./store";
import axios from "axios";
import { API_KEY } from "../api/api";

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
    const users = await axios.get(`${API_KEY}/userAccount/${username}`, config);

    dispatch(getUserDetails(users.data.object));
  };

  const getMyUserAccount = (myUserAccount) => {
    dispatch(getMyUserAccount(myUserAccount));
  };

  const getUserNameRol = (username) =>{
    dispatch(getUserName(username))
  }

  return {
    getUser,
    tokenUser,
    getAllStudents,
    getIdUser,
    getUserByUsername,
    getMyUserAccount,
    getUserNameRol
  };
};
