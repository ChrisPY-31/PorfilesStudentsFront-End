import { DiGithub } from "react-icons/di";
import { FaDeploydog, FaGithub } from "react-icons/fa";

export const estudiantes = [
  {
    id: 1,
    name: "Christian peña",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLwhQOOwv2GInOb5RresdozhdFnYTs9Bh1gg&s",
    carrera: "Ingeniero en software",
  },

  {
    id: 2,
    name: "Alejadro perez",
    image: "https://secure.gravatar.com/avatar/e3d2c2ede8616789a9c81b6855f7f5a46d001a487bb17bb75e5b50d288b3b7fd?s=500&d=mm&r=g",
    carrera: "Ingeniero en software",
  },

  {
    id: 3,
    name: "Romina lopez",
    image: "https://pbs.twimg.com/profile_images/1602961436812025857/6BrF0j9B_400x400.jpg",
    carrera: "Ingeniero en Ciberseguridad",
  },

  {
    id: 4,
    name: "Christopher rodriguez",
    image: "https://yt3.googleusercontent.com/_cygOV8mwFPWc6G5Xbmquke0tzOlRnK7dD2QnZ6QbLzvwY7a0zhuPB1FqnfwLZa6r_kwBF07Gw=s900-c-k-c0x00ffffff-no-rj",
    carrera: "Ingeniero en Computacion",
  },
];

export const estudianteById = [
  {
    id: 1,
    name: "Christian ",
    lastName: "Peña Yañez",
    image:
      "https://substackcdn.com/image/fetch/$s_!yjqI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F171eacb4-15de-40dd-b71b-a75d646cbdac_2511x3348.jpeg",
    carrera: "Ingeniero en software",
    description:
      "Estudiante de ingenieria en software, apasionado por el desarrollo web y movil, con conocimientos en React, Node.js y bases de datos. Busco oportunidades para aplicar mis habilidades y crecer profesionalmente en el campo de la tecnologia.",
    fechaNacimiento: "15/08/2001",
    especialidad: "Desarrollo web y movil",
    curriculum: "https://www.example.com/curriculum.pdf",
    aptitudes: ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS"],
    Ubicacion: [
      {
        pais: "Mexico",
        ciudad: "Toluca",
      },
    ],
    Educacion: [
      {
        institucion: "Universidad Autonoma del Estado de Mexico",
        grado: "Licenciatura",
        campoEstudio: "Ingenieria en Software",
      },
    ],
    Contactos: [
      {
        tipo: "Email",
        valor: "christian@example.com",
      },
      {
        tipo: "Telefono",
        valor: "+52 123 456 7890",
      },
      {
        tipo: "LinkedIn",
        valor: "https://www.linkedin.com/in/christian-pena",
      },
    ],
  },
];

export const proyectos = [
  {
    id: 1,
    nombre: "Perfiles Universitarios",
    descripcion:
      "Es un proyecto altamente sofisticado que nos garantiza que los alumnos complan con sus metas subiendo proyectos",
    imagen:
      "https://res.cloudinary.com/dfkvvcfxs/image/upload/v1683235598/screencapture-localhost-5173-2023-05-04-18_09_13_1_tey1yd.png",
    fechaInicio: "25-09-2025",
    fechaFin: "25-09-2026",
    Technologias: [
      {
        id: 1,
        nombre: "Python",
      },
      {
        id: 2,
        nombre: "React",
      },
      {
        id: 3,
        nombre: "Node.js",
      },
    ],
    Colaboradores: [
      {
        id: 1,
        nombre: "Midudev Perez",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLwhQOOwv2GInOb5RresdozhdFnYTs9Bh1gg&s"
      },
      {
        id: 2,
        nombre: "Romina Lopez",
        imagen: "https://secure.gravatar.com/avatar/e3d2c2ede8616789a9c81b6855f7f5a46d001a487bb17bb75e5b50d288b3b7fd?s=500&d=mm&r=g"
      },
      {
        id: 3,
        nombre: "Christopher Rodriguez",
        imagen: "https://pbs.twimg.com/profile_images/1602961436812025857/6BrF0j9B_400x400.jpg"
      },
    ],
    redes:[
      {
        id:1,
        name:"GitHub",
        link: "https://github.com/",
        icon: FaGithub
      },
      {
        id:2,
        name: "Deploy",
        link: "https://vercel.com/",
        icon: FaDeploydog
      }
    ]
  },
  {
    id: 2,
    nombre: "Punto de venta",
    descripcion:
      "Proyecto para la venta de abarrotes que no permite generar compras reportes este proyecto es muy util para las personas que tienen un negocio",
    imagen:
      "https://res.cloudinary.com/dfkvvcfxs/image/upload/v1683753851/Screenshot_21_-min_g1zyuy.png",
    fechaInicio: "25-06-2025",
    fechaFin: "25-09-2026",
    Technologias: [
      {
        id: 1,
        nombre: "Python",
      },
      {
        id: 2,
        nombre: "React",
      },
      {
        id: 3,
        nombre: "Node.js",
      },
    ],
    Colaboradores: [
      {
        id: 1,
        nombre: "Moure Perez",
        imagen:"https://yt3.googleusercontent.com/_cygOV8mwFPWc6G5Xbmquke0tzOlRnK7dD2QnZ6QbLzvwY7a0zhuPB1FqnfwLZa6r_kwBF07Gw=s900-c-k-c0x00ffffff-no-rj"
      },
      {
        id: 2,
        nombre: "Gentleman Rodriguez",
        imagen: "https://pbs.twimg.com/profile_images/1602961436812025857/6BrF0j9B_400x400.jpg"
      },
    ],

    redes:[
      {
        id:1,
        name:"GitHub",
        link: "https://github.com/",
        icon: FaGithub
      },
      {
        id:2,
        name: "Deploy",
        link: "https://vercel.com/",
        icon: FaDeploydog
      }
    ]
  },
  {
    id: 3,
    nombre: "Punto de venta",
    descripcion:
      "Proyecto para la venta de abarrotes que no permite generar compras reportes este proyecto es muy util para las personas que tienen un negocio",
    imagen:
      "https://res.cloudinary.com/dfkvvcfxs/image/upload/v1682079356/ecommerceImage-min_lg0ts5.png",
    fechaInicio: "25-06-2025",
    fechaFin: "25-09-2026",
    Technologias: [
      {
        id: 1,
        nombre: "Python",
      },
      {
        id: 2,
        nombre: "React",
      },
      {
        id: 3,
        nombre: "Node.js",
      },
    ],
    Colaboradores: [
      {
        id: 1,
        nombre: "Moure Perez",
        imagen:"https://yt3.googleusercontent.com/_cygOV8mwFPWc6G5Xbmquke0tzOlRnK7dD2QnZ6QbLzvwY7a0zhuPB1FqnfwLZa6r_kwBF07Gw=s900-c-k-c0x00ffffff-no-rj"
      },
      {
        id: 2,
        nombre: "Gentleman Rodriguez",
        imagen: "https://pbs.twimg.com/profile_images/1602961436812025857/6BrF0j9B_400x400.jpg"
      },
    ],

    redes:[
      {
        id:1,
        name:"GitHub",
        link: "https://github.com/",
        icon: FaGithub
      },
      {
        id:2,
        name: "Deploy",
        link: "https://vercel.com/",
        icon: FaDeploydog
      }
    ]
  }
];

export const empresasTecnologia = [
  {
    id: 1,
    nombre: "Google",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png"
  },
  {
    id: 2,
    nombre: "Microsoft",
    foto: "https://msftstories.thesourcemediaassets.com/sites/61/2014/12/Microsoft_Web.png"
  },
  {
    id: 3,
    nombre: "Apple",
    foto: "https://www.shutterstock.com/image-vector/galati-romania-april-29-2023-600nw-2295394661.jpg"
  },
  {
    id: 4,
    nombre: "Amazon",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
  },
  {
    id: 5,
    nombre: "Accenture",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/2560px-Accenture.svg.png"
  },
  {
    id: 6,
    nombre: "IBM",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png"
  },
  {
    id: 7,
    nombre: "Meta",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1024px-Meta_Platforms_Inc._logo.svg.png"
  },
  {
    id: 8,
    nombre: "Santander",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/2560px-Banco_Santander_Logotipo.svg.png"
  },
  {
    id: 9,
    nombre: "Globant",
    foto: "https://forbes.es/wp-content/uploads/2023/08/fotonoticia_20230822112020_9999.jpg"
  },
  {
    id: 10,
    nombre: "Softtek",
    foto: "https://www.softtek.com/hubfs/Softtek/images/fi-softtek-generic.png"
  }
];