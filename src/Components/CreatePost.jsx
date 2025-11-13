import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { useCreatePublicationMutation, useGetPublicationsQuery } from '../services/publication';
import { useAppSelector } from '../Hooks/store';
import { GiToken } from 'react-icons/gi';
import { toast } from 'sonner';
import { useUserAccount } from '../Hooks/useUserAccount';

const CreatePost = ({ imagen, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [createPublication, { isSuccess, isError }] = useCreatePublicationMutation();

    const [fileUpload] = useCreatePublicationMutation();
    const { user, userId } = useAppSelector(state => state.users)
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (isSuccess) {
            toast.success("Publicación creada con éxito");
            window.location.reload()
        }
    }, [isSuccess])

    if (isError) {
        toast.error("Error al crear la publicación");
    }

    const postSchema = Yup.object().shape({
        content: Yup.string().required("La publicación no puede estar vacía"),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await postSchema.validate(values, { abortEarly: false });
            setFormErrors({});

            const formData = new FormData();
            formData.append("idPersona", userId);
            formData.append('image', selectedImage);
            formData.append("descripcion", values.content);

            await createPublication({ formData, token }).unwrap();

            formik.resetForm();
            setSelectedImage(null);
            setSelectedFile(null);
            setImagePreview(null);
            setSubmitting(false);

        } catch (errors) {
            const errorMap = {};
            errors.inner.forEach((error) => {
                errorMap[error.path] = error.message;
            });
            setFormErrors(errorMap);
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            content: '',
            image: null,
            file: null
        },
        onSubmit: handleSubmit
    });

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    };

    const addEmoji = (emoji) => {
        formik.setFieldValue('content', formik.values.content + emoji);
        setShowEmojiPicker(false);
    };

    const commonEmojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '👏', '🙏', '🤔', '😍'];

    return (
        <div className='publicacion__menu absolute inset-0 bg-black/15 z-50 flex justify-center items-center'>
            <div className="flex items-center justify-center py-8 w-1/2 relative">
                <IoCloseSharp className='absolute top-10 right-20 size-7 cursor-pointer' onClick={onClose} />

                <div className="w-full max-w-2xl mx-4">
                    <div className="bg-white  rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <img className='rounded-full flex items-center justify-center shadow-md size-12'
                                    src={`${imagen ? imagen : 'https://imagenes.elpais.com/resizer/v2/M2LJPF3LOZMCBFIINF3ANPEXYA.jpg?auth=3742d8527ab2c7808cee6bcdc198547c39b5f3b7fb710f22073c14e4c311dca6&width=980&height=980&smart=true'}`} alt="foto de perfil" />
                                <div>
                                    <h2 className="font-bold text-gray-900 text-lg">{user?.nombre} {user?.apellido}</h2>
                                    <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                                        <span>Comparte con la comunidad</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={formik.handleSubmit}>
                            <div className="mb-4">
                                <textarea
                                    name="content"
                                    value={formik.values.content}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="¿Sobre qué quieres hablar?"
                                    className="w-full h-40 px-4 py-4 text-gray-900 placeholder-gray-500 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 border-gray-300 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none text-lg"
                                    rows="5"
                                />

                                {imagePreview && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-green-700 text-sm font-medium">Vista previa:</p>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                        <div className="flex justify-center">
                                            <img
                                                src={imagePreview}
                                                alt="Vista previa"
                                                className="max-h-48 rounded-lg object-cover border border-green-200"
                                            />
                                        </div>
                                        <p className="text-green-600 text-xs mt-2 text-center">
                                            {selectedImage?.name}
                                        </p>
                                    </div>
                                )}

                                {selectedFile && !imagePreview && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-700 text-sm font-medium">
                                                    Archivo seleccionado: {selectedFile.name}
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                    Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formErrors.content && (
                                    <div className="mt-2 text-sm text-red-600 font-medium">
                                        {formErrors.content}
                                    </div>
                                )}
                            </div>

                            {showEmojiPicker && (
                                <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-sm font-semibold text-green-800">Selecciona un emoji</h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(false)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-10 gap-2">
                                        {commonEmojis.map((emoji, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => addEmoji(emoji)}
                                                className="text-xl hover:bg-green-200 rounded-lg p-1 transition-colors"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="text-green-500 hover:text-green-700 transition-colors cursor-pointer p-2 hover:bg-green-50 rounded-lg"
                                        title="Subir imagen"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="text-green-500 hover:text-green-700 transition-colors p-2 hover:bg-green-50 rounded-lg"
                                        title="Agregar emoji"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 transform cursor-pointer transition-all duration-300"
                                >
                                    {formik.isSubmitting ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Publicando...
                                        </div>
                                    ) : (
                                        "Publicar"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;