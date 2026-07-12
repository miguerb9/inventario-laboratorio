import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getMe } from '../api/auth'
import client from '../api/client'

function Alertas() {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState({ stock_bajo: [], proximos_a_caducar: [] })
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [alertasData, usuarioData] = await Promise.all([
          client.get('/alertas').then(r => r.data),
          getMe()
        ])
        setAlertas(alertasData)
        setUsuario(usuarioData)
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

  const total = alertas.stock_bajo.length + alertas.proximos_a_caducar.length

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f2f5]">
      <Sidebar rol={usuario?.rol} usuario={usuario} />

      <div className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 w-full min-w-0">

        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{fontFamily: 'DM Sans, sans-serif'}}>
            Alertas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {total === 0 ? 'No hay alertas activas' : `${total} reactivos requieren atención`}
          </p>
        </div>

        {/* Stock bajo */}
        <div className="bg-white rounded-xl border border-slate-200 mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-800" style={{fontFamily: 'DM Sans, sans-serif'}}>
                Stock bajo
              </h2>
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                {alertas.stock_bajo.length} reactivos
              </span>
            </div>
          </div>
          {alertas.stock_bajo.length === 0 ? (
            <p className="text-slate-400 text-sm px-4 sm:px-6 py-8">Sin alertas de stock</p>
          ) : (
            <>
              {/* Vista tarjetas: solo móvil */}
              <div className="sm:hidden divide-y divide-slate-50">
                {alertas.stock_bajo.map(r => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/reactivos/${r.id}`)}
                    className="px-4 py-4 active:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-800 mb-1">{r.nombre}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <p>Actual: <span className="text-yellow-600 font-semibold">{r.cantidad}</span> {r.unidad}</p>
                      <p>Mínimo: <span className="text-slate-700">{r.stock_minimo}</span> {r.unidad}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista tabla: desde sm hacia arriba */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reactivo</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cantidad actual</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock mínimo</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertas.stock_bajo.map(r => (
                      <tr
                        key={r.id}
                        onClick={() => navigate(`/reactivos/${r.id}`)}
                        className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-800">{r.nombre}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-yellow-600 font-semibold whitespace-nowrap">{r.cantidad}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.stock_minimo}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Próximos a caducar */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-800" style={{fontFamily: 'DM Sans, sans-serif'}}>
                Próximos a caducar
              </h2>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                {alertas.proximos_a_caducar.length} reactivos
              </span>
            </div>
          </div>
          {alertas.proximos_a_caducar.length === 0 ? (
            <p className="text-slate-400 text-sm px-4 sm:px-6 py-8">Sin alertas de caducidad</p>
          ) : (
            <>
              {/* Vista tarjetas: solo móvil */}
              <div className="sm:hidden divide-y divide-slate-50">
                {alertas.proximos_a_caducar.map(r => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/reactivos/${r.id}`)}
                    className="px-4 py-4 active:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-800 mb-1">{r.nombre}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <p>Caduca: <span className="text-orange-600 font-semibold">{r.fecha_caducidad}</span></p>
                      <p>Cantidad: <span className="text-slate-700">{r.cantidad}</span> {r.unidad}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista tabla: desde sm hacia arriba */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reactivo</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha caducidad</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cantidad</th>
                      <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertas.proximos_a_caducar.map(r => (
                      <tr
                        key={r.id}
                        onClick={() => navigate(`/reactivos/${r.id}`)}
                        className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-800">{r.nombre}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-orange-600 font-semibold whitespace-nowrap">{r.fecha_caducidad}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.cantidad}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default Alertas