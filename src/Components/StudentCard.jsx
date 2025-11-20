import { useNavigate } from "react-router-dom"
import { useUserAccount } from "../Hooks/useUserAccount";

const StudentCard = ({ id, nombre, apellido, carrera, imagen }) => {

  const navigate = useNavigate();
  const { getIdUser } = useUserAccount();

  const handleClick = (idPerson) => {
    navigate(`/Person/${idPerson}`)
    localStorage.setItem("idPerson", idPerson)
    getIdUser(idPerson)
  }

  return (
    <div className='flex gap-3 my-4'>
      <img
        onClick={() => handleClick(id)}
        className="size-10 rounded-full cursor-pointer" src={`${imagen ? imagen : "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true"}`} alt="" />
      <div>
        <h4 className="text-sm font-medium ">{`${nombre} ${apellido}`}</h4>
        {carrera &&
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{carrera}</p>
        }
      </div>
    </div>
  )
}

export default StudentCard