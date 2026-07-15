import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FlaskConical, Calendar, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { getReactivos } from '../api/reactivos'
import { getMe } from '../api/auth'
import client from '../api/client'

const POR_PAGINA = 10

function Dashboard() {
  const navigate = useNavigate()
  const [reactivos, setReactivos] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [alertas, setAlertas] = useState({ stock_bajo: [], proximos_a_caducar: [] })
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    async function cargar() {
      try {
        const [reactivosData, alertasData, usuarioData] = await Promise.all([
          getReactivos(),
          client.get('/alertas').then(r => r.data),
          getMe()
        ])
        setReactivos(reactivosData)
        setAlertas(alertasData)
        setUsuario(usuarioData)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [navigate])

  function getEstado(r) {
    const hoy = new Date()
    const cad = r.fecha_caducidad ? new Date(r.fecha_caducidad) : null
    if (cad && cad < hoy) return 'Caducado'
    if (cad && (cad - hoy) / (1000 * 60 * 60 * 24) <= 30) return 'Por caducar'
    if (r.cantidad <= r.stock_minimo) return 'Stock bajo'
    return 'Normal'
  }

  function getBadge(estado) {
    const estilos = {
      'Caducado': 'bg-red-100 text-red-700',
      'Por caducar': 'bg-orange-100 text-orange-700',
      'Stock bajo': 'bg-yellow-100 text-yellow-700',
      'Normal': 'bg-green-100 text-green-700',
    }
    return `inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${estilos[estado]}`
  }

  const totalPaginas = Math.max(1, Math.ceil(reactivos.length / POR_PAGINA))

  const reactivosPagina = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA
    return reactivos.slice(inicio, inicio + POR_PAGINA)
  }, [reactivos, pagina])

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas)
  }, [totalPaginas, pagina])

  function irAPagina(p) {
    const destino = Math.min(Math.max(p, 1), totalPaginas)
    setPagina(destino)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
      <p className="text-slate-500 text-sm">Cargando...</p>
    </div>
  )

  const caducados = reactivos.filter(r => getEstado(r) === 'Caducado').length
  const reactivosAtencion = reactivos.filter(r => getEstado(r) !== 'Normal')

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f2f5]">
      <Sidebar rol={usuario?.rol} usuario={usuario} />

      <main className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 w-full min-w-0">

        {/* Cabecera */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{fontFamily: 'DM Sans, sans-serif'}}>
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Resumen del inventario del laboratorio</p>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2 sm:mb-3">Caducados</p>
    <p className="text-2xl sm:text-3xl font-bold text-red-600">{caducados}</p>
    <p className="text-xs text-slate-400 mt-1">reactivos</p>
  </div>

  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2 sm:mb-3">Por caducar</p>
    <p className="text-2xl sm:text-3xl font-bold text-orange-500">{alertas.proximos_a_caducar.length}</p>
    <p className="text-xs text-slate-400 mt-1">en 30 días</p>
  </div>

  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2 sm:mb-3">Stock bajo</p>
    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{alertas.stock_bajo.length}</p>
    <p className="text-xs text-slate-400 mt-1">reactivos</p>
  </div>

  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2 sm:mb-3">Total reactivos</p>
    <p className="text-2xl sm:text-3xl font-bold text-slate-800">{reactivos.length}</p>
    <p className="text-xs text-slate-400 mt-1">registrados</p>
  </div>
</div>

        {/* Reactivos que requieren atención */}
        {reactivosAtencion.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500 shrink-0" />
              <h2 className="font-semibold text-slate-800" style={{fontFamily: 'DM Sans, sans-serif'}}>
                Requieren atención
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {reactivosAtencion.slice(0, 5).map(r => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/reactivos/${r.id}`)}
                  className="flex justify-between items-center gap-3 px-4 sm:px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.nombre}</p>
                    <p className="text-xs text-slate-500">{r.cantidad} {r.unidad}</p>
                  </div>
                  <span className={getBadge(getEstado(r))}>{getEstado(r)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla todos los reactivos */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800" style={{fontFamily: 'DM Sans, sans-serif'}}>
              Todos los reactivos
            </h2>
          </div>
          {/* Vista tarjetas: solo móvil */}
          <div className="sm:hidden divide-y divide-slate-50">
            {reactivosPagina.map(r => (
              <div
                key={r.id}
                onClick={() => navigate(`/reactivos/${r.id}`)}
                className="px-4 py-4 active:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-medium text-slate-800">{r.nombre}</p>
                  <span className={getBadge(getEstado(r))}>{getEstado(r)}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500">
                  <p>Cantidad: <span className="text-slate-700">{r.cantidad} {r.unidad}</span></p>
                  <p>Stock mín.: <span className="text-slate-700">{r.stock_minimo} {r.unidad}</span></p>
                  <p className="col-span-2">Caducidad: <span className="text-slate-700">{r.fecha_caducidad || '—'}</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Vista tabla: desde sm hacia arriba */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reactivo</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cantidad</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock mín.</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Caducidad</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reactivosPagina.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/reactivos/${r.id}`)}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{r.nombre}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.cantidad} {r.unidad}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.stock_minimo} {r.unidad}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.fecha_caducidad || '—'}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={getBadge(getEstado(r))}>{getEstado(r)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reactivos.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-12">No hay reactivos registrados</p>
          )}

          {/* Paginación */}
          {reactivos.length > POR_PAGINA && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 hidden sm:block">
                Mostrando {(pagina - 1) * POR_PAGINA + 1}
                {'–'}
                {Math.min(pagina * POR_PAGINA, reactivos.length)} de {reactivos.length}
              </p>

              <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
                <button
                  onClick={() => irAPagina(pagina - 1)}
                  disabled={pagina === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(p =>
                    p === 1 ||
                    p === totalPaginas ||
                    Math.abs(p - pagina) <= 1
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...' + p)
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    typeof p === 'string' ? (
                      <span key={`gap-${idx}`} className="px-1.5 text-xs text-slate-400 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => irAPagina(p)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                          p === pagina
                            ? 'bg-[#1a2b4a] text-white'
                            : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => irAPagina(pagina + 1)}
                  disabled={pagina === totalPaginas}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default Dashboard