import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

function Sidebar({ rol, usuario }) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="w-56 min-h-screen bg-[#1a2b4a] flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#243659] bg-white">
        <img src={logo} alt="Stockix" className="h-8" />
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/reactivos" className={linkClass}>Reactivos</NavLink>
        <NavLink to="/alertas" className={linkClass}>Alertas</NavLink>
        {(rol === 'admin' || rol === 'superadmin') && (
          <NavLink to="/usuarios" className={linkClass}>Usuarios</NavLink>
        )}
      </nav>

      {/* Perfil y cerrar sesión */}
      <div className="px-3 py-4 border-t border-[#243659]">
        <NavLink
          to="/perfil"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 hover:bg-white/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {usuario?.nombre?.[0]}{usuario?.apellido?.[0]}
          </div>
          <p className="text-white text-xs font-medium">{usuario?.nombre} {usuario?.apellido}</p>
        </NavLink>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

    </div>
  )
}

export default Sidebar