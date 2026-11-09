import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { useAppSelector } from "../Hooks/store";
import { useGetConversationsQuery } from "../services/chat";
import StartConversationModal from "./StartConversationModal";

// Boton del reclutador para escribirle a un alumno (en Postulantes, Estudiantes y el perfil).
// Si ya hay conversacion con el, la abre; si no, pide el primer mensaje. Para los demas roles no se muestra.
// Abre Mensajes en Cuenta y seguridad (Manager lee state.ajuste e state.idConversacion)
const BotonMensajeAlumno = ({ alumno, vacanteTitulo, className, compacto = false }) => {
    const navigate = useNavigate();
    const { userToken, tipo } = useAppSelector(state => state.users);
    const esReclutador = tipo === "recruiter";
    const { data: conversaciones = [] } = useGetConversationsQuery({ token: userToken }, { skip: !userToken || !esReclutador });
    const [escribiendo, setEscribiendo] = useState(false);

    if (!esReclutador || !alumno?.id) return null;

    const existente = conversaciones.find(c => c.contraparte?.id === alumno.id);
    const abrir = (idConversacion) =>
        navigate("/sing-in-and-security", { state: { ajuste: "mensajes", idConversacion } });

    return (
        <>
            <button
                type="button"
                onClick={() => (existente ? abrir(existente.idConversacion) : setEscribiendo(true))}
                title={existente ? "Ver conversación" : "Enviar mensaje"}
                className={className ?? "flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"}
            >
                <FiMessageSquare className="size-4" />
                {compacto
                    ? <span className="sr-only">{existente ? "Ver conversación" : "Enviar mensaje"}</span>
                    : (existente ? "Ver conversación" : "Enviar mensaje")}
            </button>
            {escribiendo && (
                <StartConversationModal
                    alumno={alumno}
                    vacanteTitulo={vacanteTitulo}
                    onClose={() => setEscribiendo(false)}
                    onIniciada={(conversacion) => {
                        setEscribiendo(false);
                        abrir(conversacion?.idConversacion ?? null);
                    }}
                />
            )}
        </>
    );
};

export default BotonMensajeAlumno;
