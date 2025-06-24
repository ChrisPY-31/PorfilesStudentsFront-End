import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Home } from './Components/Home'
import InformationStudent from './Components/InformationStudent'
import Students from './Components/Students'
import Proyects from './Components/Proyects'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Students' element={<Students />} />
        <Route path={`/Student/:id`} element={<InformationStudent />} />
        <Route path='/StudentProyect' element={<Proyects />} />
      </Routes>
    </>
  )
}

export default App
