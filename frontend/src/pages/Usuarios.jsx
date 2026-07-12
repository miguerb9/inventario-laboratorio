import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getMe } from '../api/auth'
import { getUsuarios, borrarUsuario, crearUsuario, actualizarUsuario } from '../api/usuarios'

function Usuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ email: '', nombre: '', apellido: '', password: '', rol: 'viewer' })
  const [formEditar, setFormEditar] = useState({ nombre: '', apellido: '', rol: 'viewer' })
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const [usuariosData, usuarioData] = await Promise.all([
          getUsuarios(),
          getMe()
        ])
        setUsuarios(usuariosData)
        setUsuario(usuarioData)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  async function handleBorrar(id) {
    if (!confirm('¿Seguro que quieres borrar este usuario?')) return
    try {
      await borrarUsuario(id)
      setUsuarios(usuarios.filter(u => u.id !== id))
    } catch {
      alert('No tienes permisos para borrar usuarios')
    }
  }

  async function handleCrear(e) {
    e.preventDefault()
    setError('')
    try {
      await crearUsuario(form)
      const data = await getUsuarios()
      setUsuarios(data)
      setShowForm(false)
      setForm({ email: '', nombre: '', apellido: '', password: '', rol: 'viewer' })
    } catch {
      setError('Error al crear el usuario. El email puede estar en uso.')
    }
  }

  async function handleEditar(e) {
    e.preventDefault()
    try {
      await actualizarUsuario(editando.id, formEditar)
      const data = await getUsuarios()
      setUsuarios(data)
      setEditando(null)
    } catch {
      alert('Error al actualizar el usuario')
    }
  }

  function abrirEditar(u) {
    setEditando(u)
    setFormEditar({ nombre: u.nombre, apellido: u.apellido, rol: u.rol })
  }

  function badgeRol(rol) {
    const estilos = {
      superadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      viewer: 'bg-slate-100 text-slate-600',
    }
    return `inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${estilos[rol] || estilos.viewer}`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <p className="text-slate-500 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f2f5]">
      <Sidebar rol={usuario?.rol} usuario={usuario} />

      <div className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 w-full min-w-0">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{fontFamily: 'DM Sans, sans-serif'}}>
              Usuarios
            </h1>
            <p className="text-slate-500 text-sm mt-1">{usuarios.length} usuarios registrados</p>
          </div>
          {usuario?.rol === 'superadmin' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1a2b4a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#243659] transition-colors whitespace-nowrap"
            >
              + Añadir usuario
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          {/* Vista tarjetas: solo móvil */}
          <div className="sm:hidden divide-y divide-slate-50">
            {usuarios.map(u => (
              <div key={u.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-medium text-slate-800">{u.nombre} {u.apellido}</p>
                  <span className={badgeRol(u.rol)}>{u.rol}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2 break-words">{u.email}</p>
                {usuario?.rol === 'superadmin' && u.id !== usuario.id && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="text-xs text-slate-500 active:text-[#1a2b4a] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleBorrar(u.id)}
                      className="text-xs text-slate-400 active:text-red-500 transition-colors"
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista tabla: desde sm hacia arriba */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
                  {usuario?.rol === 'superadmin' && (
                    <th className="px-4 sm:px-6 py-3"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{u.nombre} {u.apellido}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={badgeRol(u.rol)}>{u.rol}</span>
                    </td>
                    {usuario?.rol === 'superadmin' && (
                      <td className="px-4 sm:px-6 py-4">
                        {u.id !== usuario.id && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => abrirEditar(u)}
                              className="text-sm text-slate-500 hover:text-[#1a2b4a] transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleBorrar(u.id)}
                              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                            >
                              Borrar
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal crear usuario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-5" style={{fontFamily: 'DM Sans, sans-serif'}}>
              Nuevo usuario
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCrear} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Apellido</label>
                  <input
                    value={form.apellido}
                    onChange={e => setForm({...form, apellido: e.target.value})}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Rol</label>
                <select
                  value={form.rol}
                  onChange={e => setForm({...form, rol: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a2b4a] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#243659] transition-colors"
                >
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar usuario */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-5" style={{fontFamily: 'DM Sans, sans-serif'}}>
              Editar usuario
            </h2>
            <form onSubmit={handleEditar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nombre</label>
                  <input
                    value={formEditar.nombre}
                    onChange={e => setFormEditar({...formEditar, nombre: e.target.value})}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Apellido</label>
                  <input
                    value={formEditar.apellido}
                    onChange={e => setFormEditar({...formEditar, apellido: e.target.value})}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Rol</label>
                <select
                  value={formEditar.rol}
                  onChange={e => setFormEditar({...formEditar, rol: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a2b4a] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#243659] transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios