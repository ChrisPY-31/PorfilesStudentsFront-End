import { useNavigate } from "react-router-dom"
import { useUserAccount } from "../Hooks/useUserAccount";
import { userSlice } from "../services/UserSlice";

const StudentCard = ({id ,nombre , apellido ,carrera , imagen}) => {
  
  const navigate = useNavigate();
  const {getIdUser} = useUserAccount();


  const handleClick = (idPerson) =>{
    navigate(`/Person/${idPerson}`)
    getIdUser(idPerson)
  } 

  return (
    <div className='flex gap-3 my-4'>
      <img 
      onClick={() =>handleClick(id)}
      className="size-10 rounded-full cursor-pointer" src={`${imagen ? imagen : "https://pbs.twimg.com/profile_images/1909029889702858754/7r3UsWbQ_400x400.jpg"}`} alt="" />
      <div>
        <h4 className="text-sm font-medium ">{`${nombre} ${apellido}`}</h4>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{carrera}</p>
      </div>
    </div>
  )
}

export default StudentCard