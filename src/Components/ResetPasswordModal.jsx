import React, { useEffect, useState } from 'react'
import { IoCloseSharp, IoEyeOutline, IoEyeOffOutline, IoRefreshOutline, IoMailOutline, IoKeyOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useAppSelector } from '../Hooks/store'
import { useResetPasswordUserMutation } from '../services/UserSlice'
import { obtenerMensajeError } from '../helpers'

const MINIMO = 8 // El back rechaza contraseñas de menos de 8 caracteres

// Sin caracteres que se confunden al leerlos en el correo (0/O, 1/l/I)
const CARACTERES = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*'
const generarContrasena = (largo = 12) => {
    const valores = crypto.getRandomValues(new Uint32Array(largo))
    return Array.from(valores, v => CARACTERES[v % CARACTERES.length]).join('')
}

/**
 * Restablece la contraseña de una cuenta (solo ADMIN).
 * El back le manda la nueva contraseña por correo al usuario.
 */
const ResetPasswordModal = ({ cuenta, onClose }) => {
    const { userToken } = useAppSelector(state => state.users)
    const [resetPasswordUser, { isLoading }] = useResetPasswordUserMutation()
    const [contrasena, setContrasena] = useState(() => generarContrasena())
    const [mostrar, setMostrar] = useState(true)
    const [errorCampo, setErrorCampo] = useState('')

    useEffect(() => {
        const alPresionar = (e) => e.key === 'Escape' && !isLoading && onClose()
        window.addEventListener('keydown', alPresionar)
        return () => window.removeEventListener('keydown', alPresionar)
    }, [isLoading, onClose])

    const handleGuardar = async (e) => {
        e.preventDefault()
        if (contrasena.trim().length < MINIMO) {
            setErrorCampo(`Debe tener al menos ${MINIMO} caracteres`)
            return
        }
        try {
            const res = await resetPasswordUser({ username: cuenta.username, newPassword: contrasena, token: userToken }).unwrap()
            toast.success(res?.message ?? 'Contraseña restablecida')
            onClose()
        } catch (error) {
            toast.error(obtenerMensajeError(error, 'No se pudo restablecer la contraseña'))
        }
    }

    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
            <form onSubmit={handleGuardar} className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
                <div className='flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100'>
                    <div className='flex items-center gap-3'>
                        <span className='grid place-items-center size-10 rounded-xl bg-blue-50 text-blue-600'>
                            <IoKeyOutline className='size-5' />
                        </span>
                        <div>
                            <h2 className='text-lg font-bold text-gray-900'>Restablecer contraseña</h2>
                            <p className='text-sm text-gray-500'>{cuenta.username}</p>
                        </div>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={isLoading}
                        className='p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50'
                        aria-label='Cerrar'
                    >
                        <IoCloseSharp className='size-6' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4'>
                    <div>
                        <label htmlFor='nueva-contrasena' className='block text-sm font-medium text-gray-700 mb-1.5'>Nueva contraseña</label>
                        <div className='flex gap-2'>
                            <div className='relative flex-1'>
                                <input
                                    id='nueva-contrasena'
                                    type={mostrar ? 'text' : 'password'}
                                    value={contrasena}
                                    onChange={e => { setContrasena(e.target.value); setErrorCampo('') }}
                                    autoComplete='new-password'
                                    className={`w-full h-11 rounded-xl border-2 px-3 pr-10 font-mono text-sm outline-none ${errorCampo ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-green-500'}`}
                                />
                                <button
                                    type='button'
                                    onClick={() => setMostrar(v => !v)}
                                    className='absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-700'
                                    aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {mostrar ? <IoEyeOffOutline className='size-5' /> : <IoEyeOutline className='size-5' />}
                                </button>
                            </div>
                            <button
                                type='button'
                                onClick={() => { setContrasena(generarContrasena()); setErrorCampo('') }}
                                title='Generar otra'
                                className='flex items-center gap-1.5 px-3 rounded-xl border-2 border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50'
                            >
                                <IoRefreshOutline className='size-4' /> Generar
                            </button>
                        </div>
                        <p className='mt-1 min-h-5 text-sm text-red-600'>{errorCampo}</p>
                    </div>

                    <div className='flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800'>
                        <IoMailOutline className='size-5 shrink-0' />
                        <p>Se le enviará la nueva contraseña a <span className='font-semibold'>{cuenta.email}</span>. Su contraseña anterior dejará de funcionar.</p>
                    </div>
                </div>

                <div className='flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50'>
                    <button type='button' onClick={onClose} disabled={isLoading}
                        className='px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50'>
                        Cancelar
                    </button>
                    <button type='submit' disabled={isLoading}
                        className='px-4 py-2 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'>
                        {isLoading ? 'Guardando...' : 'Restablecer'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ResetPasswordModal
