import { useState } from "react";

const CreatePublicationForm = ({
    id,
    nombre,
    apellido,
    imagenPersona,
    especialidad,
    descripcion,
    imagenPublicacion,

    handleClickRecomendation,
    handleToggleComment,
    openCommentId,
    onChangeComent,

    numDeComent,
    interacciones
}) => {
    const [comentario, setComentario] = useState('')



    return (
        <div className="w-full bg-white p-4 mt-4 rounded-2xl shadow">

            {/* Encabezado */}
            <div className="flex items-center gap-4">
                <img
                    className="size-12 rounded-full"
                    src={imagenPersona}
                    alt="foto perfil"
                />
                <div>
                    <p className="font-semibold">{nombre} {apellido}</p>
                    <p className="text-gray-500 text-sm">{especialidad}</p>
                </div>
            </div>

            {/* Descripción */}
            <p className="mt-3 text-gray-800">{descripcion}</p>

            {/* Imagen de la publicación (si existe) */}
            {imagenPublicacion && (
                <img
                    className="w-full mt-3 rounded-2xl"
                    src={imagenPublicacion}
                    alt="imagen publicación"
                />
            )}

            {/* Botones de acción */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => handleClickRecomendation(id)}
                    className="text-blue-600 font-semibold"
                >
                    Recomendar 👍
                </button>

                <button
                    onClick={() => handleToggleComment(id)}
                    className="text-green-600 font-semibold"
                >
                    Comentar 💬
                </button>

                <span className="text-gray-500">{numDeComent} comentarios</span>
            </div>

            {/* Cuadro de comentarios SOLO si este id está abierto */}
            {openCommentId === id && (
                <form
                    onSubmit={(e) => onChangeComent(e, comentario, id)}
                >

                    <textarea
                        className="w-full p-2 mt-3 border rounded-xl outline-none"
                        placeholder="Escribe un comentario..."
                        onChange={(e) => setComentario(e.target.value)}
                    />
                    <input type="submit" />
                </form>
            )}

            {/* Listado de comentarios */}
            {interacciones?.length > 0 && (
                <div className="mt-4">
                    {interacciones.map((c, index) => (
                        <p key={index} className="text-sm text-gray-700  py-1">
                            {c.comentario}
                        </p>
                    ))}
                </div>
            )}

        </div>
    );
};

export default CreatePublicationForm;
