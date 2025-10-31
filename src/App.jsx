import './App.css'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { Home } from './Components/Home'
import Students from './Components/Students'
import Navigation from './Components/Navigation'
import Comunity from './Components/Comunity'
import SignIn from './Components/SignIn'
import SignUp from './Components/SignUp'
import { PersonMenu } from './Components/PersonMenu'
import Proyects from './Components/Proyects'
import Manager from './Components/Manager'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { useUserAccount } from './Hooks/useUserAccount'

function App() {
  const location = useLocation();
  const tokenUserId = localStorage.getItem("token");
  const [autenticate, setAutenticate] = useState(tokenUserId);
  const { tokenUser } = useUserAccount();


  useEffect(() => {
    setAutenticate(tokenUserId);
    tokenUser(tokenUserId)

  }, [location])

  return (
    <>
      {/* {location.pathname !== '/Manager' && location.pathname !== '/Sign-In' && location.pathname !== '/Sign-Up' && <Navigate/>}  */}
      {location.pathname != '/Manager' && <Navigation autenticate={autenticate} />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Inicio' element={autenticate ? < Comunity /> : <Navigate to="/" />} />
        <Route path='/Students' element={autenticate ? <Students /> : <Navigate to="/" />} />
        <Route path='/Projects' element={autenticate ? <Proyects /> : <Navigate to="/" />} />
        <Route path={`/Person/:id`} element={autenticate ? <PersonMenu /> : <Navigate to="/" />} />
        <Route path='/Sign-In' element={<SignIn setAutenticate={setAutenticate} />} />
        <Route path='/Sign-Up' element={<SignUp />} />
        <Route path='/Manager' element={<Manager />} />
      </Routes>
      <Toaster position="top-right" autoClose={2000} hideProgressBar={false} />

    </>
  )
}

export default App