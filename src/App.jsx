import './App.css'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { Home } from './Pages/Home'
import Students from './Pages/Students'
import Navigation from './Components/Navigation'
import Comunity from './Pages/Comunity'
import SignIn from './Pages/SignIn'
import SignUp from './Pages/SignUp'
import { PersonMenu } from './Pages/PersonMenu'
import AllProjects from './Pages/AllProjects'
import Notifications from './Pages/Notifications'
import Manager from './Pages/Manager'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { useUserAccount } from './Hooks/useUserAccount'
import { useExpiracionSesion } from './Hooks/useExpiracionSesion'
import MyPorfile from './Pages/MyPorfile'
import StudentRecruitmentForm from './Pages/StudentRecruitmentForm'
import UserLockedMessage from './Components/UserLockedMessage'
import Footer from './Components/Footer'
import RutaAdmin from './Components/RutaAdmin'

function App() {
  const location = useLocation();
  const tokenUserId = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const [autenticate, setAutenticate] = useState(tokenUserId);
  const { tokenUser, getUserByUsername } = useUserAccount();
  // Cierra la sesion cuando vence el token (30 min en el back)
  useExpiracionSesion();
  const [myPorfile, setMyPorfile] = useState(false)
  // const [userLocked, setUserLocked] = useState(localStorage.getItem("userLocked"));
  const userLockedValue = JSON.parse(localStorage.getItem("userLocked") ?? "true");
  useEffect(() => {
    setAutenticate(tokenUserId);
    tokenUser(tokenUserId)
  }, [location])


  useEffect(() => {
    if (username && tokenUserId) {
      // Si falla (ej. admin sin persona) el hook ya limpia el perfil anterior
      getUserByUsername(username, tokenUserId).catch(() => {});
    } else {
      return;
    }
  }, [username, tokenUserId, location]);

  useEffect(() => {
    console.log("entro aqui")
    console.log(userLockedValue);
    if (!userLockedValue) {
      document.body.className = "overflow-hidden"
    }
    document.body.className = ""
  }, [location, userLockedValue]);


  // El panel de administracion ocupa toda la pantalla: sin barra ni footer
  const esPanelAdmin = location.pathname === '/Manager' || location.pathname === '/sing-in-and-security'

  return (
    <div className='min-h-screen flex flex-col'>

      {/* {location.pathname !== '/Manager' && location.pathname !== '/Sign-In' && location.pathname !== '/Sign-Up' && <Navigate/>}  */}
      {location.pathname != '/Manager' && <Navigation autenticate={autenticate} setMyPorfile={setMyPorfile} />}
      {!(userLockedValue) && <UserLockedMessage />}
      <main className='flex-1'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Inicio' element={autenticate ? < Comunity /> : <Navigate to="/" />} />
        <Route path='/Students' element={autenticate ? <Students /> : <Navigate to="/" />} />
        <Route path='/Projects' element={autenticate ? <AllProjects /> : <Navigate to="/" />} />
        <Route path='/Notificaciones' element={autenticate ? <Notifications /> : <Navigate to="/" />} />
        <Route path={`/Person/:id`} element={autenticate ? <PersonMenu /> : <Navigate to="/" />} />
        <Route path='/MyProfile/:id' element={autenticate ? <MyPorfile /> : <Navigate to="/" />} />
        <Route path='/Sign-In' element={<SignIn setAutenticate={setAutenticate} />} />
        <Route path='/Sign-Up' element={<SignUp setAutenticate={setAutenticate} />} />
        <Route path='/Manager' element={<RutaAdmin><Manager /></RutaAdmin>} />
        <Route path="/StudentRecruitment/" element={<StudentRecruitmentForm />} />
        <Route path="/sing-in-and-security" element={autenticate ? <Manager usermenu={true} /> : <Navigate to="/" />} />
      </Routes>
      </main>
      {!esPanelAdmin && <Footer autenticate={autenticate} />}
      <Toaster position="top-right" autoClose={2000} hideProgressBar={false} />
    </div>
  )
}

export default App