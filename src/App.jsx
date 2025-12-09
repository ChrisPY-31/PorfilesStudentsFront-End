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
import StudentRecruitmentForm from './Components/StudentRecruitmentForm'
import UserLockedMessage from './Components/UserLockedMessage'

function App() {
  const location = useLocation();
  const tokenUserId = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const [autenticate, setAutenticate] = useState(tokenUserId);
  const { tokenUser, getUserByUsername } = useUserAccount();
  const [myPorfile, setMyPorfile] = useState(false)
  // const [userLocked, setUserLocked] = useState(localStorage.getItem("userLocked"));
  const userLockedValue = JSON.parse(localStorage.getItem("userLocked") ?? "true");
  useEffect(() => {
    setAutenticate(tokenUserId);
    tokenUser(tokenUserId)
  }, [location])


  useEffect(() => {
    if (username && tokenUserId) {
      getUserByUsername(username, tokenUserId);
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


  return (
    <>

      {/* {location.pathname !== '/Manager' && location.pathname !== '/Sign-In' && location.pathname !== '/Sign-Up' && <Navigate/>}  */}
      {location.pathname != '/Manager' && <Navigation autenticate={autenticate} setMyPorfile={setMyPorfile} />}
      {!(userLockedValue) && <UserLockedMessage />}
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
        <Route path="/StudentRecruitment/" element={<StudentRecruitmentForm />} />
        <Route path="/sing-in-and-security" element={<Manager usermenu={true} />} />
      </Routes>
      <Toaster position="top-right" autoClose={2000} hideProgressBar={false} />

    </>
  )
}

export default App