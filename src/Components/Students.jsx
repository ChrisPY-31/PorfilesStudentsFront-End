import { IoIosSearch } from "react-icons/io";
import { useGetAllUsersQuery } from "../services/UserSlice";
import { useUserAccount } from "../Hooks/useUserAccount";
import { toast } from "sonner";
import StudentCard from "./StudentCard";
import { useAppSelector } from "../Hooks/store";

const Students = () => {

  const { data, error, isLoading } = useGetAllUsersQuery();
  const { getAllStudents } = useUserAccount();
  const { students } = useAppSelector(state => state.students)

  if (isLoading) return toast.loading;

  if (error) return toast.error("Error del servido intentelo mas tarde");
  if (data) {
    getAllStudents(data.content)
  }

  return (
    <section>
      <div className="w-[80%] mx-auto my-10">
        <h2 className="text-4xl font-semibold">Estudiantes</h2>
        <p>Filta los estudiantes de tu interes</p>

        {/* Aqui van los filtros */}

        <form action="" className="my-4">
          <div>
            <div className="relative">
              <IoIosSearch className="absolute left-2 top-4 cursor-pointer " />
              <input className="shadow-sm outline-none rounded-md py-1 px-7 my-2 w-1/2" type="text" placeholder="Buscar estudiante" />
            </div>
            <div className="my-3">
              <select name="carrera" id="" className="outline-none shadow-sm rounded-md py-1 px-3">
                <option value="Carrera">Carrera</option>
                <option value="Software">Software</option>
                <option value="Computacion">Computacion</option>
                <option value="Ciberseguridad">Ciberseguridad</option>
              </select>

            </div>

          </div>
        </form>

        <h3 className="text-2xl font-semibold">Estudiantes</h3>
        <div >
          {students.map(student => {
            return <StudentCard
              key={student.id}
              id={student.id}
              nombre={student.nombre}
              apellido={student.apellido}
              carrera={student.carrera?.carrera}
              imagen={student.imagen}
            />
          })}
        </div>
      </div>
    </section>
  )
}

export default Students