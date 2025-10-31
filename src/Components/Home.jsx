import logoUniversity from "../assets/LogoUniversitario.jpg"
import CardsHome from "./CardsHome"
import Footer from "./Footer"
import Careers from "./CarrersSection"

import { empresasTecnologia } from "../Estudiantes"
import BusinessCard from "./BusinessCard"
import CareersSection from "./CarrersSection"

export const Home = () => {
  return (
    <section>
      <div className=" w-[85%] mx-auto">
        <div className={`imagen__home h-[70vh] flex flex-col justify-center items-center text-white rounded-2xl my-10`}>
          <h2 className='text-7xl font-bold text-center'>Conecta, colabora y crece con UniConnect</h2>
          <p className='text-center mt-4 font-semibold'>Tu plataforma para conectar con estudiantes y comunidades universitarias. con empresas para conseguir tu primer trabajo.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Beneficios de UniConnect</h2>
          <p  className="text-xl text-gray-600">Conecta con la próxima generación de talento, listos para desarrollar sus habilidades y emprender su viaje profesional.
</p>
          <CardsHome />
        </div>

        <section>
          <CareersSection/>
        </section>

        <section>
          <div className="overflow-hidden">
            <div className="absolute h-[150px] bg-gradient-to-r from-[#FFF] from-50% z-20 w-[100px] "></div>
            <div className="absolute h-[150px] bg-gradient-to-l from-[#FFF] from-60% w-[100px] right-28 z-20"></div>
            <div className="flex whitespace-nowrap h-[150px] items-center gap-x-7 animate-scroll">
              {empresasTecnologia.concat(empresasTecnologia).map((empresa, index) => (
                <BusinessCard empresa={empresa} key={index} />
              ))}
            </div>
          </div>

          <p className="text-3xl text-center font-semibold mt-4">
            <span className="bg-gradient-to-r from-teal-300 to-green-600 bg-clip-text text-transparent"
            >Mas de 200 </span>empresas usan UniConnect para la formación de sus equipos
          </p>
        </section>
        

      </div>

      <Footer />
    </section>
  )
}
