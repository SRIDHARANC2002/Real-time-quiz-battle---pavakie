import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import Navbar from '../Components/Navbar'

export default function App(){
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main>
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  )
}