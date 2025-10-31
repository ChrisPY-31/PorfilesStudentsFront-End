import { getAllPublications } from "../store/UserAccount/publicationSlice";
import { useAppDispatch } from "./store"

export const useUserPublications  = () =>{

    const dispatch = useAppDispatch();

    const getPublications = (publications) =>{
        dispatch(getAllPublications(publications))
    }

    return {getPublications}
}