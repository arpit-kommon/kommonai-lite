import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import  Login from './pages/Login'
import Language from './pages/Language'
import Hindi_Form from './pages/Hindi-form'
import English_Form from './pages/English-form'
import Audiospeaker from './pages/Audio-speaker'


function App() {

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />

        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/laguage' element={<Language />} />
        <Route path='/hindi-form' element={<Hindi_Form />} />
        <Route path='/english-form' element={<English_Form />} />
        <Route path='/audio-speaker' element={<Audiospeaker />} />

        

      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
