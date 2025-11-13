import React from 'react'
import { IoCallOutline, IoGlobeOutline, IoLogoLinkedin, IoMailOutline } from 'react-icons/io5';
import { formatearRedContactos } from '../helpers';

const ContactsCard = ({ id, nombre, url, socialMedia }) => {

    const formateRed = (red) => {
        const redes = {
            LINKEDIN: <IoLogoLinkedin className="h-5 w-5 text-blue-600" />,
            EMAIL: <IoMailOutline className="h-5 w-5 text-red-500" />,
            PHONE: <IoCallOutline className="h-5 w-5 text-green-500" />,
            WEB: <IoGlobeOutline className="h-5 w-5 text-purple-500" />,
        };
        return redes[red] || null;
    };


    return (
        <div className='flex gap-3 my-3' >
            <div >
                {formateRed(socialMedia)}
            </div>
            <div >
                <p className='font-semibold'>{formatearRedContactos(nombre)}</p>
                <a className=' text-blue-500 text-[14px]' href={url}>{url}</a>
            </div>
        </div>
    )
}

export default ContactsCard