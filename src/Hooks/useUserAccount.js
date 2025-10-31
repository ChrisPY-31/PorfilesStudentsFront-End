import { getStudents, getUserDetails, getUserId, getUserToken } from "../store/UserAccount/userSlice";
import { useAppDispatch } from "./store";

export const useUserAccount = () => {

    const dispatch = useAppDispatch();

    const getAllStudents = (students) =>{
        dispatch(getStudents(students))
    }

    const getIdUser = (idUser) =>{
        dispatch(getUserId(idUser))
    }   

    const getUser = (user) =>{
        dispatch(getUserDetails(user));
    }

    const tokenUser = (token) =>{
        dispatch(getUserToken(token));
    }

    return { getUser , tokenUser , getAllStudents , getIdUser}
}