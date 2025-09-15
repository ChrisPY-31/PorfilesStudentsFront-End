import { IoIosSearch } from "react-icons/io";
import { estudiantes } from "../Estudiantes"
const Students = () => {
  return (
    <section>
      <div className="w-[80%] mx-auto my-10">
        <h2 className="text-4xl font-semibold">Students</h2>
        <p>Filta los estudiantes de tu interes</p>

        {/* Aqui van los filtros */}

        <form action="" className="my-4">
          <div>
            <div className="relative">
              <IoIosSearch className="absolute left-2 top-4 cursor-pointer " />
              <input className="shadow-sm outline-none rounded-md py-1 px-7 my-2 w-1/2" type="text" placeholder="Buscar estudiante" />
            </div>
            <div>
              <select name="carrera" id="">
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
          {estudiantes.map(estudiante => {
            return <div key={estudiante.id} className="flex gap-4 my-2">
              <img className="size-10" src={estudiante.image} alt={estudiante.name} />
              <div>
                <h4 className="font-semibold">{estudiante.name}</h4>
                <p className="font-light">{estudiante.carrera}</p>
              </div>
            </div>
          })}
        </div>

      </div>
    </section>
  )
}

export default Students