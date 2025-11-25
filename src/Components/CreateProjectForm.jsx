import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { useAppSelector } from "../Hooks/store";
import { useCreateProjectMutation, useCreateTechnologyMutation, useDeleteProjectStudentMutation, useLoadedPhotoProjectMutation, useUpdateProjectStudentMutation, useUpdateTechnologyMutation } from "../services/projectsUser";
import { useUserAccount } from "../Hooks/useUserAccount";
import { toast } from "sonner";

const CreateProjectForm = ({ onClose, updateProject, setUpdateProject }) => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { students } = useAppSelector(state => state.students)
  const { userId, username, userToken } = useAppSelector(state => state.users)
  const [createProject, { isSuccess, error }] = useCreateProjectMutation();
  const [updateProjectStudent, { isSuccess: success }] = useUpdateProjectStudentMutation();
  const [createTechnology] = useCreateTechnologyMutation();
  const [updateTechnologyMutation] = useUpdateTechnologyMutation()
  const [loadedPhotoProject] = useLoadedPhotoProjectMutation()
  const [deleteProjectStudent, { isSuccess: successPro }] = useDeleteProjectStudentMutation();
  const { getUserByUsername } = useUserAccount();



  useEffect(() => {
    if (Object.keys(updateProject).length > 0) {
      let tecnologias = updateProject.tecnologias.map(tech => tech.nombre || [])
      setTecnologiasSeleccionadas(tecnologias)
      setColaboradores(updateProject.menciones)
      setPreviewImage(updateProject.imagen)
      console.log(updateProject.idProject)
    }
  }, [updateProject])

  useEffect(() => {

    if (isSuccess) {
      toast.success("el proyecto se creo con exito")
      document.body.className = ""
      getUserByUsername(username, userToken);
      getUserByUsername(username, userToken);
      setTimeout(() => {
        onClose();
      }, [1000])
      document.body.className = ""
      return
    }
    if (error) {
      toast.success("error intentelo mas tarde")
      return
    }

  }, [isSuccess, error])

  useEffect(() => {
    if (success) {
      toast.success("Proyecto actualizado con exito")
      getUserByUsername(username, userToken);
      setTimeout(() => {
        onClose();
      }, [1000])
      document.body.className = ""

      return
    }

    if (successPro) {
      toast.success("Proyecto eliminado con exito")
      getUserByUsername(username, userToken);
      setTimeout(() => {
        onClose();
      }, [1000])
      document.body.className = ""

      return
    }

  }, [success, successPro])



  const projectSchema = Yup.object().shape({
    nombreProyecto: Yup.string().required("El nombre del proyecto es requerido"),
    descripcion: Yup.string().required("La descripción es requerida"),
    fechaInicio: Yup.string().required("La fecha de inicio es requerida"),
    urlHub: Yup.string()
      .url("Debe ser una URL válida"),
    urlDeploy: Yup.string().url("Debe ser una URL válida"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await projectSchema.validate(values, { abortEarly: false });
      setFormErrors({});
      const token = localStorage.getItem("token");

      if (updateProject.idProject) {
        // ACTUALIZACIÓN DE PROYECTO
        const updatedProject = {
          idProject: updateProject.idProject,
          idEstudiante: updateProject.idEstudiante,
          nombre: values.nombreProyecto,
          descripcion: values.descripcion,
          imagen: updateProject.imagen,
          fechaInicio: values.fechaInicio,
          github: values.urlHub,
          deploy: values.urlDeploy,
          menciones: colaboradores.map(c => ({ id: c.id })),
        };

        // ESPERAR la actualización del proyecto

        await updateProjectStudent({ token, updatedProject })


        const idProyecto = updateProject.idProject;

        try {
          const tecnologias = tecnologiasSeleccionadas.map(nombreTec => ({
            idProyecto,
            nombre: nombreTec
          }));
          if (tecnologias.length > 0) {
            await createTechnology({ token, tecnologias }).unwrap();
          }
        } catch (err) {
          toast.error("Error guardando tecnologías", err);

        }

        console.log(selectedImage)
        if (selectedImage) {
          const formData = new FormData();
          formData.append("image", selectedImage);
          try {
            const result = await loadedPhotoProject({ idProyecto, formData, token });
            if (result?.data) {
              toast.success("Foto actualizada con éxito");
              // getUserByUsername(username, token);
            } else {
              toast.warning("No se recibió respuesta clara del servidor, pero puede que se haya actualizado.");
            }
          } catch (photoError) {
            toast.error("Error al actualizar la foto, pero los datos se guardaron");
            console.error(photoError);
          }
        } else if (!selectedImage) {
          return;
        }

        setTimeout(() => {
          onClose();
        }, 1000)
      }
      else {
        // CREACIÓN DE NUEVO PROYECTO
        const newProyect = {
          idEstudiante: userId,
          nombre: values.nombreProyecto,
          descripcion: values.descripcion,
          imagen: "",
          fechaInicio: values.fechaInicio,
          fechaFin: "",
          github: values.urlHub,
          deploy: values.urlDeploy,
          menciones: colaboradores.map(c => ({ id: c.id })),
        };

        const createResult = await createProject({ token, newProyect }).unwrap();

        const idProyecto = createResult.object.idProject;

        const tecnologias = tecnologiasSeleccionadas.map(nombreTec => ({
          idProyecto,
          nombre: nombreTec
        }));

        try {
          if (tecnologias.length > 0) {
            await createTechnology({ token, tecnologias }).unwrap();
          }
        } catch (err) {
          toast.error("Error al crear tecnologías", err);
        }

        if (selectedImage) {
          console.log("entro")
          const formData = new FormData();
          formData.append("image", selectedImage);
          console.log(selectedImage)
          try {
            await loadedPhotoProject({ idProyecto, formData, token }).unwrap();
            toast.success("Foto actualizada con éxito");
            // getUserByUsername(username, userToken);
          } catch (photoError) {
            toast.error("Error al actualizar la foto, pero los datos se guardaron");
          }
        } else if (!selectedImage) {
          return;
        }

      }

      // Limpiar formulario
      setUpdateProject({});
      setTimeout(() => setMensajeExito(""), 3000);
      resetForm();
      setTecnologiasSeleccionadas([]);
      setColaboradores([]);
      setSubmitting(false);

    } catch (err) {
      const errorMap = {};
      if (err && Array.isArray(err.inner) && err.inner.length) {
        err.inner.forEach((e) => {
          if (e && e.path) errorMap[e.path] = e.message;
        });
      } else if (err && err.path && err.message) {
        errorMap[err.path] = err.message;
      } else {
        errorMap._general = "Ocurrió un error en la validación";
      }
      setFormErrors(errorMap);
      setSubmitting(false);
    }
  };

  const agregarTecnologia = (tecnologia, setFieldValue) => {
    if (tecnologia && !tecnologiasSeleccionadas.includes(tecnologia)) {
      const nuevasTecnologias = [...tecnologiasSeleccionadas, tecnologia];
      setTecnologiasSeleccionadas(nuevasTecnologias);
      setFieldValue("nuevaTecnologia", "");
    }
  };

  const eliminarTecnologia = (tecnologiaEliminar) => {
    const nuevasTecnologias = tecnologiasSeleccionadas.filter(tech => tech !== tecnologiaEliminar);
    setTecnologiasSeleccionadas(nuevasTecnologias);
  };

  const agregarColaborador = (id, setFieldValue) => {
    if (!id) return;

    const estudiante = students.find(s => s.id === Number(id));
    if (!estudiante) return;

    if (!colaboradores.some(c => c.id === estudiante.id)) {
      setColaboradores([...colaboradores, estudiante]);
    }

    setFieldValue("buscarColaborador", "");
  };
  const eliminarColaborador = (id) => {
    setColaboradores(colaboradores.filter(colab => colab.id !== id));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); // crea la vista previa
    }
  };

  const handleOnClose = () => {
    setUpdateProject({})
    onClose()
  }

  const handleDeleteProject = (idProject) => {
    deleteProjectStudent({ userToken, idProject })
  }

  return (
    <div className="h-[100vh] overflow-scroll absolute inset-0 z-50">
      <div className="h-full">

        <div className="w-full bg-gray-100 flex items-center justify-center p-4 ">

          <div className="w-full max-w-3xl">

            {mensajeExito && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
                {mensajeExito}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 relative">
              <IoCloseSharp className='absolute right-5 top-5 size-7 cursor-pointer' onClick={() => {
                document.body.className = "";
                handleOnClose()
              }} />
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                    Crear Nuevo Proyecto
                  </h2>
                </div>

                <Formik
                  initialValues={{
                    nombreProyecto: `${updateProject.nombre ? updateProject.nombre : ''}`,
                    descripcion: `${updateProject.descripcion ? updateProject.descripcion : ''}`,
                    fechaInicio: `${updateProject.fechaInicio ? updateProject.fechaInicio : ''}`,
                    urlHub: `${updateProject.github ? updateProject.github : ''}`,
                    urlDeploy: `${updateProject.deploy ? updateProject.deploy : ''}`,
                    nuevaTecnologia: `${updateProject.tecnologias?.nombre ? updateProject.tecnologias?.nombre : ''}`,
                    buscarColaborador: `${updateProject.menciones?.nombre ? updateProject.menciones?.nombre : ''}`,
                  }}
                  onSubmit={handleSubmit}
                  validateOnChange={false}
                  validateOnBlur={false}
                >
                  {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-6">

                      <div className="flex flex-col">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre del Proyecto
                        </label>
                        <div className="relative w-full">
                          <Field
                            type="text"
                            name="nombreProyecto"
                            className={`w-full h-12 border-2 rounded-lg px-4 outline-none bg-white transition-all duration-300 ${formErrors.nombreProyecto
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300 focus:border-green-500"
                              }`}
                            placeholder="Ingresa el nombre del proyecto"
                          />
                        </div>
                        {formErrors.nombreProyecto && (
                          <div className="mt-1 text-sm text-red-600 font-medium">
                            {formErrors.nombreProyecto}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Imagen del Proyecto</h4>
                        <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors duration-300 cursor-pointer bg-green-50">
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="text-gray-700 text-sm font-medium"
                              onChange={handleImageChange}
                            />
                            <p className="text-gray-600 text-xs">
                              Arrastra y suelta o haz clic para buscar
                            </p>
                          </div>

                          {previewImage && (
                            <div className="mt-4 flex justify-center">
                              <img
                                src={previewImage}
                                alt="Vista previa"
                                className="w-40 h-40 object-cover rounded-lg shadow-md border"
                              />
                            </div>
                          )}
                        </div>
                      </div>


                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Descripción
                        </label>
                        <div className="relative w-full">
                          <Field
                            as="textarea"
                            name="descripcion"
                            rows="3"
                            className={`w-full border-2 rounded-lg px-4 py-3 outline-none bg-white transition-all duration-300 ${formErrors.descripcion
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300 focus:border-green-500"
                              }`}
                            placeholder="Proporciona una descripción detallada del proyecto"
                          />
                        </div>
                        {formErrors.descripcion && (
                          <div className="mt-1 text-sm text-red-600 font-medium">
                            {formErrors.descripcion}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Fecha de Inicio
                          </label>
                          <div className="relative w-full">
                            <Field
                              type="date"
                              name="fechaInicio"
                              className={`w-full h-12 border-2 rounded-lg px-4 outline-none bg-white transition-all duration-300 ${formErrors.fechaInicio
                                ? "border-red-400 bg-red-50"
                                : "border-gray-300 focus:border-green-500"
                                }`}
                            />
                          </div>
                          {formErrors.fechaInicio && (
                            <div className="mt-1 text-sm text-red-600 font-medium">
                              {formErrors.fechaInicio}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            Tecnologías
                          </label>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {tecnologiasSeleccionadas.map((tech, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {tech}
                                  <button
                                    type="button"
                                    onClick={() => eliminarTecnologia(tech)}
                                    className="ml-1 text-green-600 hover:text-green-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Field
                                type="text"
                                name="nuevaTecnologia"
                                className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-500 transition-all duration-300 text-sm"
                                placeholder="Agregar tecnología"
                              />
                              <button
                                type="button"
                                onClick={() => agregarTecnologia(values.nuevaTecnologia, setFieldValue)}
                                className="px-4 py-2 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-500 hover:text-white transition-all duration-300 text-sm"
                              >
                                Agregar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Colaboradores
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {colaboradores.map((colab, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full">
                                {colab.nombre} {colab.apellido}
                                <button type="button" onClick={() => eliminarColaborador(colab.id)}>×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Field
                              as="select"
                              name="buscarColaborador"
                              className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 outline-none"
                            >
                              <option value="">Buscar miembros del equipo...</option>

                              {students.map(student => (
                                <option key={student.id} value={student.id}>
                                  {student.nombre} {student.apellido}
                                </option>
                              ))}
                            </Field>
                            <button
                              type="button"
                              onClick={() => agregarColaborador(values.buscarColaborador, setFieldValue)}
                              className="px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-300 text-sm"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            URL de repositorio
                          </label>
                          <div className="relative w-full">
                            <Field
                              type="url"
                              name="urlHub"
                              className={`w-full h-12 border-2 rounded-lg px-4 outline-none bg-white transition-all duration-300 ${formErrors.urlHub
                                ? "border-red-400 bg-red-50"
                                : "border-gray-300 focus:border-green-500"
                                }`}
                              placeholder="https://ihub.example.com/..."
                            />
                          </div>
                          {formErrors.urlHub && (
                            <div className="mt-1 text-sm text-red-600 font-medium">
                              {formErrors.urlHub}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-gray-300 my-3"></div>

                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">
                            URL de Deploy (Opcional)
                          </label>
                          <div className="relative w-full">
                            <Field
                              type="url"
                              name="urlDeploy"
                              className={`w-full h-12 border-2 rounded-lg px-4 outline-none bg-white transition-all duration-300 ${formErrors.urlDeploy
                                ? "border-red-400 bg-red-50"
                                : "border-gray-300 focus:border-green-500"
                                }`}
                              placeholder="https://deploy.example.com"
                            />
                          </div>
                          {formErrors.urlDeploy && (
                            <div className="mt-1 text-sm text-red-600 font-medium">
                              {formErrors.urlDeploy}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`${updateProject ? 'flex gap-4' : 'p-4'}`}>
                        {Object.keys(updateProject).length > 0 &&
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(updateProject.idProject)}
                            className="w-full py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-semibold text-black  to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer "
                          >
                            Eliminar Proyecto
                          </button>
                        }
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {Object.keys(updateProject).length > 0 ? "Actualizar proyecto" :
                            isSubmitting ? "Creando..." : "Crear Proyecto"
                          }

                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  );
};

export default CreateProjectForm;