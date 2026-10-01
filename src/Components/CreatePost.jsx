import { useEffect, useRef, useState } from 'react';
import { IoCloseSharp, IoImageOutline, IoHappyOutline, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { useCreatePublicationMutation, useUploadPublicationImageMutation } from '../services/publication';
import { useAppSelector } from '../Hooks/store';
import { obtenerMensajeError } from '../helpers';
import { FORMATOS_IMAGEN, MAX_MB_IMAGEN, comprimirImagen, validarImagen } from '../helpers/recortarImagen';

const FOTO_DEFAULT = 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true';
const EMOJIS = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '👏', '🙏', '🤔', '😍', '🚀', '💡'];

// El back responde la publicacion creada; por si viene envuelta se revisa tambien `object`
const obtenerIdCreado = (respuesta) => respuesta?.id ?? respuesta?.object?.id;

const CreatePost = ({ imagen, onClose }) => {
    const { user, userId, userToken } = useAppSelector(state => state.users);
    const [createPublication] = useCreatePublicationMutation();
    const [uploadPublicationImage] = useUploadPublicationImageMutation();

    const inputRef = useRef(null);
    const textareaRef = useRef(null);
    const [texto, setTexto] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [mostrarEmojis, setMostrarEmojis] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);
    const [publicando, setPublicando] = useState(false);

    // Libera la URL temporal de la vista previa
    useEffect(() => {
        return () => {
            if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        };
    }, [vistaPrevia]);

    const textoLimpio = texto.trim();

    const elegirImagen = (nuevo) => {
        if (!nuevo) return;
        const errorValidacion = validarImagen(nuevo);
        if (errorValidacion) {
            toast.error(errorValidacion);
            return;
        }
        setArchivo(nuevo);
        setVistaPrevia(URL.createObjectURL(nuevo));
    };

    const quitarImagen = () => {
        setArchivo(null);
        setVistaPrevia(null);
    };

    // Inserta el emoji donde esta el cursor, no siempre al final
    const agregarEmoji = (emoji) => {
        const textarea = textareaRef.current;
        const inicio = textarea?.selectionStart ?? texto.length;
        const fin = textarea?.selectionEnd ?? texto.length;
        setTexto(texto.slice(0, inicio) + emoji + texto.slice(fin));
        requestAnimationFrame(() => {
            textarea?.focus();
            textarea?.setSelectionRange(inicio + emoji.length, inicio + emoji.length);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);
        elegirImagen(e.dataTransfer.files[0]);
    };

    const handlePublicar = async (e) => {
        e.preventDefault();
        if (!textoLimpio || publicando) return;
        setPublicando(true);

        let creada;
        try {
            creada = await createPublication({
                publicacion: { idPersona: userId, descripcion: textoLimpio },
                token: userToken
            }).unwrap();
        } catch (err) {
            toast.error(obtenerMensajeError(err, "No se pudo crear la publicación"));
            setPublicando(false);
            return;
        }

        if (archivo) {
            // La publicacion ya existe: si falla la imagen no se reintenta para no duplicarla
            try {
                const id = obtenerIdCreado(creada);
                if (!id) throw new Error("El servidor no devolvió el id de la publicación");
                const formData = new FormData();
                formData.append("image", await comprimirImagen(archivo));
                await uploadPublicationImage({ id, formData, token: userToken }).unwrap();
            } catch (err) {
                toast.warning(`Se publicó sin imagen: ${err instanceof Error ? err.message : obtenerMensajeError(err, "no se pudo subir")}`);
                onClose();
                return;
            }
        }

        toast.success("Publicación creada");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <form
                onSubmit={handlePublicar}
                onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setArrastrando(false); }}
                onDrop={handleDrop}
                className={`relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden transition-shadow ${arrastrando ? "ring-4 ring-green-400" : ""}`}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img className="size-11 rounded-full object-cover" src={imagen || FOTO_DEFAULT} alt="foto de perfil" />
                        <div>
                            <p className="font-semibold text-gray-900">{user?.nombre} {user?.apellido}</p>
                            <p className="text-xs text-green-600 font-medium">Publicar en la comunidad</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={publicando}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        <IoCloseSharp className="size-6" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <textarea
                        ref={textareaRef}
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="¿Sobre qué quieres hablar?"
                        autoFocus
                        rows={5}
                        className="w-full resize-none text-lg text-gray-900 placeholder-gray-400 focus:outline-none"
                    />

                    {vistaPrevia && (
                        <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={vistaPrevia} alt="Vista previa" className="w-full max-h-80 object-contain" />
                            <button
                                type="button"
                                onClick={quitarImagen}
                                disabled={publicando}
                                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                aria-label="Quitar imagen"
                            >
                                <IoTrashOutline className="size-4" />
                            </button>
                        </div>
                    )}

                    {arrastrando && !vistaPrevia && (
                        <div className="mt-2 flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-green-400 bg-green-50 text-green-700 font-semibold">
                            Suelta la imagen aquí
                        </div>
                    )}

                    {mostrarEmojis && (
                        <div className="mt-3 flex flex-wrap gap-1 p-2 rounded-xl bg-gray-50 border border-gray-200">
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => agregarEmoji(emoji)}
                                    className="text-xl p-1.5 rounded-lg hover:bg-white transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={FORMATOS_IMAGEN.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        elegirImagen(e.target.files[0]);
                        e.target.value = "";
                    }}
                />

                {/* Pie */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={publicando}
                            title={`Agregar imagen (JPG, PNG o WebP, máx. ${MAX_MB_IMAGEN} MB)`}
                            className={`p-2 rounded-lg transition-colors ${archivo ? "text-green-700 bg-green-100" : "text-gray-500 hover:text-green-700 hover:bg-green-50"}`}
                        >
                            <IoImageOutline className="size-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setMostrarEmojis(v => !v)}
                            title="Agregar emoji"
                            className={`p-2 rounded-lg transition-colors ${mostrarEmojis ? "text-green-700 bg-green-100" : "text-gray-500 hover:text-green-700 hover:bg-green-50"}`}
                        >
                            <IoHappyOutline className="size-6" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!textoLimpio || publicando}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {publicando && <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {publicando ? "Publicando..." : "Publicar"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
