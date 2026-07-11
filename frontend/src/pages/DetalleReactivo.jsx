import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Upload } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { getReactivo } from '../api/reactivos'
import { getMe } from '../api/auth'
import client from '../api/client'

function DetalleReactivo() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reactivo, setReactivo] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [pestana, setPestana] = useState('info')

  useEffect(() => {
    async function cargar() {
      try {
        const [reactivoData, usuarioData] = await Promise.all([
          getReactivo(id),
          getMe()
        ])

        setReactivo(reactivoData)
        setUsuario(usuarioData)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [id, navigate])

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
      Caducado: 'bg-red-100 text-red-700',
      'Por caducar': 'bg-orange-100 text-orange-700',
      'Stock bajo': 'bg-yellow-100 text-yellow-700',
      Normal: 'bg-green-100 text-green-700'
    }

    return `inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[estado]}`
  }

  async function handleSubirFDS(e) {
    const archivo = e.target.files[0]
    if (!archivo) return

    setSubiendo(true)

    const formData = new FormData()
    formData.append('archivo', archivo)

    try {
      await client.post(`/reactivos/${id}/fds`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const data = await getReactivo(id)
      setReactivo(data)

      alert('FDS subida correctamente')
    } catch {
      alert('Error al subir la FDS')
    } finally {
      setSubiendo(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <p className="text-slate-500 text-sm">Cargando...</p>
      </div>
    )
  }

  const estado = getEstado(reactivo)

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      <Sidebar rol={usuario?.rol} usuario={usuario} />

      <div className="flex-1 p-8">
        {/* Volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold text-slate-900"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {reactivo.nombre}
              </h1>

              <span className={getBadge(estado)}>
                {estado}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
              Cantidad actual
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {reactivo.cantidad}
              <span className="text-sm font-normal text-slate-500">
                {' '}
                {reactivo.unidad}
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
              Stock mínimo
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {reactivo.stock_minimo}
              <span className="text-sm font-normal text-slate-500">
                {' '}
                {reactivo.unidad}
              </span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
              Vencimiento
            </p>

            <p className="text-2xl font-bold text-slate-800">
              {reactivo.fecha_caducidad || '—'}
            </p>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setPestana('info')}
              className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                pestana === 'info'
                  ? 'text-[#1a2b4a] border-b-2 border-[#1a2b4a]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Información general
            </button>

            <button
              onClick={() => setPestana('fds')}
              className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                pestana === 'fds'
                  ? 'text-[#1a2b4a] border-b-2 border-[#1a2b4a]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ficha de seguridad (FDS)
            </button>
          </div>

          <div className="p-6">
            {pestana === 'info' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Nombre
                  </p>
                  <p className="text-sm text-slate-800">{reactivo.nombre}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Unidad
                  </p>
                  <p className="text-sm text-slate-800">{reactivo.unidad}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Cantidad
                  </p>
                  <p className="text-sm text-slate-800">{reactivo.cantidad}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Stock mínimo
                  </p>
                  <p className="text-sm text-slate-800">{reactivo.stock_minimo}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Fecha caducidad
                  </p>
                  <p className="text-sm text-slate-800">
                    {reactivo.fecha_caducidad || '—'}
                  </p>
                </div>
              </div>
            )}

            {pestana === 'fds' && (
              <div>
                {reactivo.fds_pdf ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                      <FileText
                        size={20}
                        className="text-[#1a2b4a]"
                      />
                      <span className="text-sm text-slate-700">
                        Ficha de seguridad
                      </span>
                    </div>

                    <a
                      href={`http://127.0.0.1:8000/reactivos/${id}/fds`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1a2b4a] font-medium hover:underline"
                    >
                      Ver / Descargar PDF
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mb-4">
                    No hay FDS asociada a este reactivo.
                  </p>
                )}

                {(usuario?.rol === 'admin' ||
                  usuario?.rol === 'superadmin') && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-[#1a2b4a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#243659] transition-colors w-fit">
                      <Upload size={15} />

                      {subiendo
                        ? 'Subiendo...'
                        : 'Subir FDS (PDF)'}

                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleSubirFDS}
                        className="hidden"
                        disabled={subiendo}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleReactivo