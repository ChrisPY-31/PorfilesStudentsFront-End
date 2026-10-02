import React, { useState } from 'react'
import { IoCallOutline, IoGlobeOutline, IoLogoLinkedin, IoMailOutline, IoCopyOutline, IoCheckmark, IoOpenOutline } from 'react-icons/io5';

// Estilo y forma de abrir cada red del catalogo del back
const REDES = {
    LINKEDIN: { etiqueta: 'LinkedIn', Icono: IoLogoLinkedin, color: 'bg-blue-50 text-blue-600' },
    EMAIL: { etiqueta: 'Correo', Icono: IoMailOutline, color: 'bg-red-50 text-red-500' },
    PHONE: { etiqueta: 'Teléfono', Icono: IoCallOutline, color: 'bg-green-50 text-green-600' },
    WEB: { etiqueta: 'Sitio web', Icono: IoGlobeOutline, color: 'bg-purple-50 text-purple-600' },
}

// El back guarda el valor tal cual lo escribio el usuario (correo sin mailto:, url sin https://)
const crearHref = (red, url = '') => {
    if (red === 'EMAIL') return url.startsWith('mailto:') ? url : `mailto:${url}`
    if (red === 'PHONE') return url.startsWith('tel:') ? url : `tel:${url.replace(/\s/g, '')}`
    return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

const textoVisible = (url = '') => url
    .replace(/^(mailto:|tel:)/i, '')
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/\/$/, '')

const ContactsCard = ({ url, socialMedia }) => {
    const [copiado, setCopiado] = useState(false)
    const red = REDES[socialMedia] ?? { etiqueta: socialMedia, Icono: IoGlobeOutline, color: 'bg-gray-100 text-gray-600' }
    const { Icono } = red
    const esExterno = socialMedia === 'LINKEDIN' || socialMedia === 'WEB'
    const valor = textoVisible(url)

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(valor)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 1500)
        } catch {
            // Sin permiso de portapapeles: no se hace nada
        }
    }

    return (
        <li className='group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors'>
            <span className={`shrink-0 grid place-items-center size-11 rounded-xl ${red.color}`}>
                <Icono className='size-5' />
            </span>
            <a
                href={crearHref(socialMedia, url)}
                target={esExterno ? '_blank' : undefined}
                rel={esExterno ? 'noopener noreferrer' : undefined}
                className='min-w-0 flex-1'
            >
                <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>{red.etiqueta}</p>
                <p className='text-sm font-medium text-gray-900 truncate group-hover:text-green-700 transition-colors' title={valor}>
                    {valor}
                </p>
            </a>
            <div className='flex items-center gap-1'>
                <button
                    type='button'
                    onClick={copiar}
                    title={copiado ? 'Copiado' : 'Copiar'}
                    aria-label={`Copiar ${red.etiqueta}`}
                    className='p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors'
                >
                    {copiado ? <IoCheckmark className='size-4 text-green-600' /> : <IoCopyOutline className='size-4' />}
                </button>
                {esExterno && (
                    <a
                        href={crearHref(socialMedia, url)}
                        target='_blank'
                        rel='noopener noreferrer'
                        title='Abrir'
                        aria-label={`Abrir ${red.etiqueta}`}
                        className='p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors'
                    >
                        <IoOpenOutline className='size-4' />
                    </a>
                )}
            </div>
        </li>
    )
}

export default ContactsCard
