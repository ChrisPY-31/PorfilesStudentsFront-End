import React, { useEffect, useRef, useState } from "react";
import {
  IoCloseSharp,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoSearchOutline,
  IoCheckmark,
  IoLogoGithub,
  IoGlobeOutline,
  IoAlertCircleOutline
} from "react-icons/io5";
import { toast } from "sonner";
import { useAppSelector } from "../Hooks/store";
import { useUserAccount } from "../Hooks/useUserAccount";
import {
  useCreateProjectMutation,
  useUpdateProjectStudentMutation,
  useUploadProjectImageMutation,
  useGetTechnologiesQuery,
  useGetStudentsForMentionsQuery
} from "../services/projectsUser";
import { esUrlValida, obtenerMensajeError } from "../helpers";
import { FORMATOS_IMAGEN, MAX_MB_IMAGEN, comprimirImagen, validarImagen } from "../helpers/recortarImagen";

const FOTO_DEFAULT = "https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true";

const inputClass = (conError) =>
  `w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${conError
    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
    : "border-gray-200 focus:border-green-500 focus:ring-green-100"
  }`;

const Campo = ({ label, error, opcional, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {opcional && <span className="font-normal text-gray-400">(opcional)</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
        <IoAlertCircleOutline className="size-4" /> {error}
      </p>
    )}
  </div>
);

// El back responde el proyecto creado; por si viene envuelto se revisa tambien `object`
const obtenerIdCreado = (respuesta) => respuesta?.idProject ?? respuesta?.object?.idProject;

const CreateProjectForm = ({ onClose, proyecto }) => {
  const editando = !!proyecto?.idProject;
  const { userId, username, userToken } = useAppSelector(state => state.users);
  const { getUserByUsername } = useUserAccount();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectStudentMutation();
  const [uploadProjectImage] = useUploadProjectImageMutation();
  const { data: catalogo = [], isLoading: cargandoCatalogo } = useGetTechnologiesQuery();
  const { data: estudiantes = [] } = useGetStudentsForMentionsQuery();

  const [valores, setValores] = useState({
    nombre: proyecto?.nombre ?? "",
    descripcion: proyecto?.descripcion ?? "",
    fechaInicio: proyecto?.fechaInicio ?? "",
    fechaFin: proyecto?.fechaFin ?? "",
    enCurso: editando && !proyecto?.fechaFin,
    github: proyecto?.github ?? "",
    deploy: proyecto?.deploy ?? ""
  });
  const [tecnologias, setTecnologias] = useState(() => new Set((proyecto?.tecnologias ?? []).map(t => t.idTecnologia)));
  const [menciones, setMenciones] = useState(proyecto?.menciones ?? []);
  const [busquedaTec, setBusquedaTec] = useState("");
  const [busquedaColab, setBusquedaColab] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [quitarGuardada, setQuitarGuardada] = useState(false); // borrar la imagen que ya tenia el proyecto
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const inputImagenRef = useRef(null);

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValores(v => ({ ...v, [campo]: valor }));
    setErrores(err => ({ ...err, [campo]: undefined }));
  };

  const elegirImagen = (nuevo) => {
    if (!nuevo) return;
    const errorValidacion = validarImagen(nuevo);
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }
    setArchivo(nuevo);
    setVistaPrevia(URL.createObjectURL(nuevo));
    setQuitarGuardada(false);
  };

  const quitarImagen = () => {
    setArchivo(null);
    setVistaPrevia(null);
    if (proyecto?.imagen) setQuitarGuardada(true);
  };

  const toggleTecnologia = (idTecnologia) => {
    setTecnologias(prev => {
      const nueva = new Set(prev);
      nueva.has(idTecnologia) ? nueva.delete(idTecnologia) : nueva.add(idTecnologia);
      return nueva;
    });
  };

  const agregarColaborador = (estudiante) => {
    setMenciones(prev => [...prev, estudiante]);
    setBusquedaColab("");
  };

  const validar = () => {
    const nuevos = {};
    if (!valores.nombre.trim()) nuevos.nombre = "El nombre del proyecto es obligatorio";
    if (!valores.enCurso && valores.fechaInicio && valores.fechaFin && valores.fechaFin < valores.fechaInicio) {
      nuevos.fechaFin = "La fecha de fin no puede ser antes del inicio";
    }
    if (valores.github.trim() && !esUrlValida(valores.github.trim())) nuevos.github = "Escribe la URL completa, con https://";
    if (valores.deploy.trim() && !esUrlValida(valores.deploy.trim())) nuevos.deploy = "Escribe la URL completa, con https://";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (guardando || !validar()) return;
    setGuardando(true);

    // Fechas vacias van como null (un "" da 500 en el back); los textos van como "" para poder borrarlos
    const datos = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      fechaInicio: valores.fechaInicio || null,
      fechaFin: valores.enCurso ? null : (valores.fechaFin || null),
      github: valores.github.trim(),
      deploy: valores.deploy.trim(),
      tecnologias: [...tecnologias].map(idTecnologia => ({ idTecnologia })),
      menciones: menciones.map(m => ({ id: m.id })),
      // "" borra la imagen guardada (null lo ignoraria el back); si no se toca, no se manda
      ...(editando && quitarGuardada && !archivo ? { imagen: "" } : {})
    };

    let idProject = proyecto?.idProject;
    try {
      if (editando) {
        await updateProject({ token: userToken, proyecto: { idProject, ...datos } }).unwrap();
      } else {
        const creado = await createProject({ token: userToken, proyecto: { idEstudiante: userId, ...datos } }).unwrap();
        idProject = obtenerIdCreado(creado);
      }
    } catch (err) {
      toast.error(obtenerMensajeError(err, "No se pudo guardar el proyecto"));
      setGuardando(false);
      return;
    }

    let avisoImagen = null;
    if (archivo) {
      // El proyecto ya se guardo: si falla la imagen solo se avisa
      try {
        if (!idProject) throw new Error("El servidor no devolvió el id del proyecto");
        const formData = new FormData();
        formData.append("image", await comprimirImagen(archivo));
        await uploadProjectImage({ idProject, formData, token: userToken }).unwrap();
      } catch (err) {
        avisoImagen = err instanceof Error ? err.message : obtenerMensajeError(err, "no se pudo subir");
      }
    }

    await getUserByUsername(username, userToken).catch(() => {});
    if (avisoImagen) {
      toast.warning(`Proyecto guardado, pero sin la imagen nueva: ${avisoImagen}`);
    } else {
      toast.success(editando ? "Proyecto actualizado" : "Proyecto creado");
    }
    onClose();
  };

  const imagenMostrada = vistaPrevia || (!quitarGuardada && proyecto?.imagen);
  const texto = busquedaTec.trim().toLowerCase();
  const tecSeleccionadas = catalogo.filter(t => tecnologias.has(t.idTecnologia));
  const tecDisponibles = catalogo.filter(t => !tecnologias.has(t.idTecnologia) && t.nombre.toLowerCase().includes(texto));
  const textoColab = busquedaColab.trim().toLowerCase();
  const sugerenciasColab = textoColab
    ? estudiantes
      .filter(s => s.id !== userId && !menciones.some(m => m.id === s.id))
      .filter(s => `${s.nombre} ${s.apellido}`.toLowerCase().includes(textoColab))
      .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleGuardar} className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900">{editando ? "Editar proyecto" : "Nuevo proyecto"}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <IoCloseSharp className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Imagen */}
          <input
            ref={inputImagenRef}
            type="file"
            accept={FORMATOS_IMAGEN.join(",")}
            className="hidden"
            onChange={(e) => { elegirImagen(e.target.files[0]); e.target.value = ""; }}
          />
          {imagenMostrada ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
              <img src={imagenMostrada} alt="Imagen del proyecto" className="size-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => inputImagenRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  Cambiar imagen
                </button>
                <button
                  type="button"
                  onClick={quitarImagen}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <IoTrashOutline className="size-4" /> Quitar imagen
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputImagenRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegirImagen(e.dataTransfer.files[0]); }}
              className={`w-full aspect-video flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${arrastrando ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-gray-50"}`}
            >
              <IoCloudUploadOutline className="size-8 text-green-600" />
              <span className="font-semibold text-gray-800">{arrastrando ? "Suelta la imagen aquí" : "Agrega una imagen del proyecto"}</span>
              <span className="text-xs text-gray-500">JPG, PNG o WebP · máximo {MAX_MB_IMAGEN} MB</span>
            </button>
          )}
          {quitarGuardada && !archivo && (
            <p className="-mt-3 text-xs text-gray-500">
              La imagen actual se quitará al guardar.{" "}
              <button type="button" onClick={() => setQuitarGuardada(false)} className="font-semibold text-green-700 hover:underline">
                Deshacer
              </button>
            </p>
          )}

          <Campo label="Nombre del proyecto" error={errores.nombre}>
            <input value={valores.nombre} onChange={cambiar("nombre")} placeholder="Ej. Sistema de lockers" className={inputClass(errores.nombre)} />
          </Campo>

          <Campo label="Descripción" opcional>
            <textarea
              value={valores.descripcion}
              onChange={cambiar("descripcion")}
              rows={3}
              placeholder="¿Qué problema resuelve y qué hiciste tú?"
              className={`${inputClass(false)} resize-none`}
            />
          </Campo>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Inicio" opcional>
              <input type="date" value={valores.fechaInicio} onChange={cambiar("fechaInicio")} className={inputClass(false)} />
            </Campo>
            <Campo label="Fin" error={errores.fechaFin}>
              <input
                type="date"
                value={valores.enCurso ? "" : valores.fechaFin}
                onChange={cambiar("fechaFin")}
                disabled={valores.enCurso}
                min={valores.fechaInicio || undefined}
                className={`${inputClass(errores.fechaFin)} disabled:bg-gray-100 disabled:text-gray-400`}
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={valores.enCurso} onChange={cambiar("enCurso")} className="accent-green-600" />
                En curso
              </label>
            </Campo>
          </div>

          {/* Tecnologias */}
          <Campo label="Tecnologías" opcional>
            {tecSeleccionadas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tecSeleccionadas.map(t => (
                  <button
                    key={t.idTecnologia}
                    type="button"
                    onClick={() => toggleTecnologia(t.idTecnologia)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                    title="Quitar"
                  >
                    <IoCheckmark className="size-3.5" /> {t.nombre} <IoCloseSharp className="size-3.5" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative mb-2">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                value={busquedaTec}
                onChange={(e) => setBusquedaTec(e.target.value)}
                placeholder="Buscar tecnología..."
                className={`${inputClass(false)} pl-9`}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {cargandoCatalogo && <p className="text-xs text-gray-400">Cargando catálogo...</p>}
              {!cargandoCatalogo && tecDisponibles.length === 0 && (
                <p className="text-xs text-gray-400">{texto ? "Sin resultados." : "Ya elegiste todas."}</p>
              )}
              {tecDisponibles.map(t => (
                <button
                  key={t.idTecnologia}
                  type="button"
                  onClick={() => toggleTecnologia(t.idTecnologia)}
                  className="px-3 py-1 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:border-green-400 hover:bg-green-50"
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          </Campo>

          {/* Colaboradores */}
          <Campo label="Colaboradores" opcional>
            {menciones.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {menciones.map(m => (
                  <span key={m.id} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-gray-100 text-sm text-gray-800">
                    <img src={m.imagen || FOTO_DEFAULT} alt="" className="size-6 rounded-full object-cover" />
                    {m.nombre} {m.apellido}
                    <button
                      type="button"
                      onClick={() => setMenciones(prev => prev.filter(x => x.id !== m.id))}
                      className="text-gray-400 hover:text-red-600"
                      aria-label={`Quitar a ${m.nombre}`}
                    >
                      <IoCloseSharp className="size-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                value={busquedaColab}
                onChange={(e) => setBusquedaColab(e.target.value)}
                placeholder="Busca un compañero por nombre..."
                className={`${inputClass(false)} pl-9`}
              />
              {textoColab && (
                <div className="absolute left-0 right-0 mt-1 py-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10">
                  {sugerenciasColab.length === 0 && <p className="px-4 py-2 text-sm text-gray-400">Sin resultados</p>}
                  {sugerenciasColab.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => agregarColaborador(s)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <img src={s.imagen || FOTO_DEFAULT} alt="" className="size-8 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.nombre} {s.apellido}</p>
                        {s.carrera?.carrera && <p className="text-xs text-gray-500">{s.carrera.carrera}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Campo>

          {/* Enlaces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Repositorio" opcional error={errores.github}>
              <div className="relative">
                <IoLogoGithub className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <input value={valores.github} onChange={cambiar("github")} placeholder="https://github.com/..." className={`${inputClass(errores.github)} pl-9`} />
              </div>
            </Campo>
            <Campo label="Demo / deploy" opcional error={errores.deploy}>
              <div className="relative">
                <IoGlobeOutline className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <input value={valores.deploy} onChange={cambiar("deploy")} placeholder="https://mi-proyecto.com" className={`${inputClass(errores.deploy)} pl-9`} />
              </div>
            </Campo>
          </div>
        </div>

        {/* Pie */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
          >
            {guardando && <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm;
