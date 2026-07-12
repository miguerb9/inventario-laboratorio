import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getMe } from '../api/auth'

function Perfil() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getMe()
        setUsuario(data)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <p className="text-slate-500 text-sm">Cargando...</p>
    </div>
  )

  function badgeRol(rol) {
    const estilos = {
      superadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      viewer: 'bg-slate-100 text-slate-600',
    }
    return `inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[rol] || estilos.viewer}`
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f2f5]">
      <Sidebar rol={usuario?.rol} usuario={usuario} />

      <div className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 w-full min-w-0">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{fontFamily: 'DM Sans, sans-serif'}}>
            Mi perfil
          </h1>
          <p className="text-slate-500 text-sm mt-1">Información de tu cuenta</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-8 max-w-lg">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100">
            <div className="w-14 h-14 shrink-0 rounded-full bg-[#1a2b4a] flex items-center justify-center text-white text-xl font-bold">
              {usuario.nombre[0]}{usuario.apellido[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-lg break-words">{usuario.nombre} {usuario.apellido}</p>
              <span className={badgeRol(usuario.rol)}>{usuario.rol}</span>
            </div>
          </div>

          {/* Datos */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Nombre</p>
              <p className="text-sm text-slate-800 break-words">{usuario.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Apellido</p>
              <p className="text-sm text-slate-800 break-words">{usuario.apellido}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-slate-800 break-words">{usuario.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Rol</p>
              <span className={badgeRol(usuario.rol)}>{usuario.rol}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Perfil