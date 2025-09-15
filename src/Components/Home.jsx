import logoUniversity from "../assets/LogoUniversitario.jpg"
import CardsHome from "./CardsHome"

export const Home = () => {
  return (
    <section className='w-[80%] mx-auto'>
      <div>
        <div className={`imagen__home h-[70vh] flex flex-col justify-center items-center text-white rounded-2xl my-10`}>
          <h2 className='text-7xl font-bold text-center'>Conecta , colabora y crece con UniConnect</h2>
          <p className='text-center mt-4'>Tu plataforma para conectar con estudiantes y comunidades universitarias. con empresas para conseguir tu primer trabajo.</p>
          <button className='mt-4 bg-blue-500 text-white py-2 px-4 rounded cursor-pointer font-bold'>Explorar perfiles</button>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Beneficios de UniConcect</h2>
          <p>Con UniConnect puedes conectar con estudiantes que tengan la capacidad de poder desarrollar sus habilidades y que buscan su primer trabajo laboral</p>
          <CardsHome />
        </div>

        <section>
          <h2>Carrera</h2>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Proyectos</h2>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Empresas</h2>
        </section>

      </div>
    </section>
  )
}
