import { Link } from "react-router-dom"
import { IoArrowForward, IoChevronDown } from "react-icons/io5"
import fondoCampus from "../assets/fondo_landing_page.jpg"
import { useAppSelector } from "../Hooks/store"
import CardsHome from "../Components/CardsHome"
import Careers from "../Components/CarrersSection"

import { empresasTecnologia } from "../Estudiantes"
import BusinessCard from "../Components/BusinessCard"
import CareersSection from "../Components/CarrersSection"

export const Home = () => {
  const { userToken } = useAppSelector(state => state.users)

  return (
    <section>
      <div className=" w-[85%] mx-auto">
        {/* Portada */}
        <div className="relative isolate overflow-hidden rounded-2xl my-10 h-[70vh] min-h-[460px] max-h-[720px] bg-gray-900">
          {/* La foto ya trae un filtro oscuro: se le devuelve algo de luz y color */}
          <img
            src={fondoCampus}
            alt="Edificio del Centro Universitario UAEM Tianguistenco"
            className="absolute inset-0 -z-10 size-full object-cover object-[center_70%] brightness-[1.45] saturate-[1.25] contrast-[1.05]"
          />
          {/* Oscurece solo donde va el texto (abajo e izquierda) */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

          <div className="h-full flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white">
            <span className="self-start px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/25 text-xs sm:text-sm font-medium">
              Centro Universitario UAEM Tianguistenco
            </span>
            <h1 className="mt-4 max-w-3xl font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Conecta, colabora y crece con <span className="text-green-400">UniConnect</span>
            </h1>
            <p className="mt-4 max-w-xl text-base sm:text-lg text-white/85">
              Tu plataforma para conectar con estudiantes, docentes y empresas, y dar el primer paso en tu vida profesional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={userToken ? "/Inicio" : "/Sign-In"}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-sm font-semibold text-white shadow-lg hover:bg-green-500 transition-colors"
              >
                {userToken ? "Ir a mi inicio" : "Iniciar sesión"} <IoArrowForward className="size-4" />
              </Link>
              <a
                href="#beneficios"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/30 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Conocer más <IoChevronDown className="size-4" />
              </a>
            </div>
          </div>
        </div>
        <div id="beneficios" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-2">Beneficios de UniConnect</h2>
          <p  className="text-xl text-gray-600">Conecta con la próxima generación de talento, listos para desarrollar sus habilidades y emprender su viaje profesional.
</p>
          <CardsHome />
        </div>

        <section>
          <CareersSection/>
        </section>

        <section>
          {/* Carrusel infinito: dos grupos identicos y se mueve exactamente un grupo (-50%),
              asi el final del ciclo cae en el mismo lugar que el inicio y no se nota el reinicio */}
          <div className="relative overflow-hidden carrusel-empresas">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[100px] bg-gradient-to-r from-white from-50% z-20"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[100px] bg-gradient-to-l from-white from-50% z-20"></div>
            <div className="flex w-max h-[150px] items-center animate-scroll">
              {[0, 1].map(grupo => (
                <div key={grupo} className="flex shrink-0 items-center" aria-hidden={grupo === 1}>
                  {/* La lista va 2 veces por grupo para cubrir pantallas anchas */}
                  {[...empresasTecnologia, ...empresasTecnologia].map((empresa, index) => (
                    <div key={`${empresa.id}-${index}`} className="shrink-0 pr-7">
                      <BusinessCard empresa={empresa} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="text-3xl text-center font-semibold mt-4">
            <span className="bg-gradient-to-r from-teal-300 to-green-600 bg-clip-text text-transparent"
            >Mas de 200 </span>empresas usan UniConnect para la formación de sus equipos
          </p>
        </section>
        

      </div>

    </section>
  )
}
