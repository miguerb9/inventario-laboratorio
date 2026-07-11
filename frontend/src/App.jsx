import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Alertas from './pages/Alertas'
import DetalleReactivo from './pages/DetalleReactivo'
import Usuarios from './pages/Usuarios'
import Reactivos from './pages/Reactivos'
import RutaProtegida from './components/RutaProtegida'
import Perfil from './pages/Perfil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RutaProtegida><Dashboard /></RutaProtegida>
        } />
        <Route path="/alertas" element={
          <RutaProtegida><Alertas /></RutaProtegida>
        } />
        <Route path="/reactivos" element={
          <RutaProtegida><Reactivos /></RutaProtegida>
        } />
        <Route path="/reactivos/:id" element={
          <RutaProtegida><DetalleReactivo /></RutaProtegida>
        } />
        <Route path="/usuarios" element={
          <RutaProtegida><Usuarios /></RutaProtegida>
        } />
        <Route path="/perfil" element={
          <RutaProtegida><Perfil /></RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App