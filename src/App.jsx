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
import FormAdministrador from './Components/FormAdministrador'
import MyPorfile from './Components/MyPorfile'
import ManagerDashboard from './Components/ManagerDashboard'

function App() {
  const location = useLocation();
  const tokenUserId = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const [autenticate, setAutenticate] = useState(tokenUserId);
  const { tokenUser, getUserByUsername } = useUserAccount();
  const [myPorfile, setMyPorfile] = useState(false)

  useEffect(() => {
    setAutenticate(tokenUserId);
    tokenUser(tokenUserId)
  }, [location])


  useEffect(() => {
    if (username && tokenUserId) {
      getUserByUsername(username, tokenUserId);
    } else {
      console.log("Username o token no disponible todavía");
    }
  }, [username, tokenUserId , location]);


  return (
    <>
      {/* {location.pathname !== '/Manager' && location.pathname !== '/Sign-In' && location.pathname !== '/Sign-Up' && <Navigate/>}  */}
      {location.pathname != '/Manager' && <Navigation autenticate={autenticate} setMyPorfile={setMyPorfile} />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Inicio' element={autenticate ? < Comunity /> : <Navigate to="/" />} />
        <Route path='/Students' element={autenticate ? <Students /> : <Navigate to="/" />} />
        <Route path='/Projects' element={autenticate ? <Proyects /> : <Navigate to="/" />} />
        <Route path={`/Person/:id`} element={autenticate ? <PersonMenu /> : <Navigate to="/" />} />
        <Route path='/MyProfile/:id' element={autenticate ? <MyPorfile /> : <Navigate to="/" />} />
        <Route path='/Sign-In' element={<SignIn setAutenticate={setAutenticate} />} />
        <Route path='/Sign-Up' element={<SignUp setAutenticate={setAutenticate} />} />
        <Route path='/Manager' element={<Manager />} />
        <Route path='/loginAdministrador' element={<FormAdministrador />} />

      </Routes>
      <Toaster position="top-right" autoClose={2000} hideProgressBar={false} />

    </>
  )
}

export default App