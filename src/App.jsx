import './App.css'
import { Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { Home } from './Components/Home'
import Students from './Components/Students'
import Navigate from './Components/Navigate'
import Comunity from './Components/Comunity'
import SignIn from './Components/SignIn'
import { SignUp } from './Components/SignUp'
import { PersonMenu } from './Components/PersonMenu'
import Proyects from './Components/Proyects'
import Manager from './Components/Manager'

function App() {
  
  return (
    <>
      {location.pathname != '/Manager' && <Navigate/>} 
      
        <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Students' element={<Students />} />
        <Route path='/Comunity' element={<Comunity />} />
        <Route path='/Projects' element={<Proyects />} />
        <Route path='/Person' element={<PersonMenu />} />
        <Route path='/Sign-In' element={<SignIn/>} />
        <Route path='/Sign-Up' element={<SignUp/>} />

        <Route path='/Manager' element = {<Manager/>}/>
      </Routes>
    </>
  )
}

export default App
