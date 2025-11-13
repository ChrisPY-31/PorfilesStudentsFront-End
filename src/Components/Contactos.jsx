import React from 'react'
import ContactsCard from './ContactsCard'

const Contactos = ({ contactos, isEditable }) => {
  return (
    <div>
      {isEditable && <button>Editar Contactos</button>}

      {
        contactos?.map((contact) => {
          return <ContactsCard
          key={contact.contactos.idContacto}
          url = {contact.url}
          socialMedia = {contact.contactos.red}
          />
        })
      }
    </div>
  )
}

export default Contactos