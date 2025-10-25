import axios from 'axios'
import { useEffect } from 'react'

const Comunity = () => {

  useEffect(() => {
    const getPublication = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/publication')
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching persons:', error);
      }
    }
    getPublication();
  }, [])

  return (
    <div>Desde Comunidad</div>
  )
}

export default Comunity