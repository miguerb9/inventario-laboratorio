import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  getReactivos,
  crearReactivo,
  actualizarReactivo,
  borrarReactivo,
} from "../api/reactivos";
import { getMe } from "../api/auth";
import client from "../api/client";

const POR_PAGINA = 10;

function Reactivos() {
  const [reactivos, setReactivos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    unidad: "",
    fecha_caducidad: "",
    stock_minimo: "",
  });
  const [fdsArchivo, setFdsArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        const [reactivosData, usuarioData] = await Promise.all([
          getReactivos(),
          getMe(),
        ]);
        setReactivos(reactivosData);
        setUsuario(usuarioData);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  function getEstado(r) {
    const hoy = new Date();
    const cad = r.fecha_caducidad ? new Date(r.fecha_caducidad) : null;
    if (cad && cad < hoy) return "Caducado";
    if (cad && (cad - hoy) / (1000 * 60 * 60 * 24) <= 30) return "Por caducar";
    if (r.cantidad <= r.stock_minimo) return "Stock bajo";
    return "Normal";
  }

  function getBadge(estado) {
    const estilos = {
      Caducado: "bg-red-100 text-red-700",
      "Por caducar": "bg-orange-100 text-orange-700",
      "Stock bajo": "bg-yellow-100 text-yellow-700",
      Normal: "bg-green-100 text-green-700",
    };
    return `inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${estilos[estado]}`;
  }

  const totalPaginas = Math.max(1, Math.ceil(reactivos.length / POR_PAGINA));

  const reactivosPagina = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA;
    return reactivos.slice(inicio, inicio + POR_PAGINA);
  }, [reactivos, pagina]);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [totalPaginas, pagina]);

  function irAPagina(p) {
    const destino = Math.min(Math.max(p, 1), totalPaginas);
    setPagina(destino);
  }

  function abrirFormNuevo() {
    setEditando(null);
    setForm({ nombre: "", cantidad: "", unidad: "", fecha_caducidad: "", stock_minimo: "" });
    setFdsArchivo(null);
    setShowForm(true);
  }

  function abrirFormEditar(r) {
    setEditando(r.id);
    setForm({
      nombre: r.nombre,
      cantidad: r.cantidad,
      unidad: r.unidad,
      fecha_caducidad: r.fecha_caducidad || "",
      stock_minimo: r.stock_minimo,
    });
    setFdsArchivo(null);
    setShowForm(true);
  }

  function handleArchivoChange(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.type !== "application/pdf") {
      alert("El archivo debe ser un PDF");
      e.target.value = "";
      return;
    }

    setFdsArchivo(archivo);
  }

  async function subirFDS(id) {
    const formData = new FormData();
    formData.append("archivo", fdsArchivo);

    await client.post(`/reactivos/${id}/fds`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const datos = {
      ...form,
      cantidad: parseFloat(form.cantidad),
      stock_minimo: parseFloat(form.stock_minimo),
      fecha_caducidad: form.fecha_caducidad || null,
    };

    setGuardando(true);
    try {
      let reactivoId = editando;

      if (editando) {
        await actualizarReactivo(editando, datos);
      } else {
        const creado = await crearReactivo(datos);
        reactivoId = creado?.id;
      }

      // Si el usuario adjuntó una FDS, se sube tras crear/editar el reactivo
      if (fdsArchivo && reactivoId) {
        try {
          await subirFDS(reactivoId);
        } catch {
          alert("El reactivo se guardó, pero hubo un error al subir la FDS");
        }
      }

      const data = await getReactivos();
      setReactivos(data);
      setShowForm(false);
    } catch {
      alert("Error al guardar el reactivo");
    } finally {
      setGuardando(false);
    }
  }

  async function handleBorrar(id) {
    if (!confirm("¿Seguro que quieres borrar este reactivo?")) return;
    try {
      await borrarReactivo(id);
      setReactivos(reactivos.filter((r) => r.id !== id));
    } catch {
      alert("No tienes permisos para borrar reactivos");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <p className="text-slate-500 text-sm">Cargando...</p>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f2f5]">
      <Sidebar rol={usuario?.rol} usuario={usuario} />

      <div className="flex-1 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Reactivos
            </h1>
            <p className="text-slate-500 text-sm mt-1">{reactivos.length} reactivos registrados</p>
          </div>
          {(usuario?.rol === "admin" || usuario?.rol === "superadmin") && (
            <button
              onClick={abrirFormNuevo}
              className="flex items-center gap-2 bg-[#1a2b4a] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#243659] transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              Añadir reactivo
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          {/* Vista tarjetas: solo móvil */}
          <div className="sm:hidden divide-y divide-slate-50">
            {reactivosPagina.map((r) => (
              <div key={r.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p
                    className="text-sm font-medium text-slate-800 cursor-pointer active:text-[#1a2b4a]"
                    onClick={() => navigate(`/reactivos/${r.id}`)}
                  >
                    {r.nombre}
                  </p>
                  <span className={getBadge(getEstado(r))}>{getEstado(r)}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
                  <p>Cantidad: <span className="text-slate-700">{r.cantidad} {r.unidad}</span></p>
                  <p>Stock mín.: <span className="text-slate-700">{r.stock_minimo} {r.unidad}</span></p>
                  <p className="col-span-2">Vencimiento: <span className="text-slate-700">{r.fecha_caducidad || "—"}</span></p>
                </div>
                {(usuario?.rol === "admin" || usuario?.rol === "superadmin") && (
                  <div className="flex items-center gap-4 pt-1">
                    <button onClick={() => abrirFormEditar(r)} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Pencil size={14} /> Editar
                    </button>
                    <button onClick={() => handleBorrar(r.id)} className="flex items-center gap-1.5 text-xs text-red-500">
                      <Trash2 size={14} /> Borrar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista tabla: desde sm hacia arriba */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reactivo</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cantidad</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock mín.</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimiento</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 sm:px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {reactivosPagina.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td
                      className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-800 cursor-pointer hover:text-[#1a2b4a]"
                      onClick={() => navigate(`/reactivos/${r.id}`)}
                    >
                      {r.nombre}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.cantidad}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.unidad}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.stock_minimo}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{r.fecha_caducidad || "—"}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={getBadge(getEstado(r))}>{getEstado(r)}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {(usuario?.rol === "admin" || usuario?.rol === "superadmin") && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => abrirFormEditar(r)} className="text-slate-400 hover:text-[#1a2b4a] transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleBorrar(r.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
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
                {"–"}
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
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPaginas ||
                      Math.abs(p - pagina) <= 1
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..." + p);
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`gap-${idx}`} className="px-1.5 text-xs text-slate-400 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => irAPagina(p)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                          p === pagina
                            ? "bg-[#1a2b4a] text-white"
                            : "text-slate-600 hover:bg-slate-50 border border-slate-200"
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
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-5" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {editando ? "Editar reactivo" : "Añadir reactivo"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Unidad</label>
                  <select
                    value={form.unidad}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white"
                  >
                    <option value="">Seleccionar unidad...</option>
                    <optgroup label="Volumen">
                      <option>µL</option><option>mL</option><option>cL</option>
                      <option>dL</option><option>L</option>
                    </optgroup>
                    <optgroup label="Masa">
                      <option>µg</option><option>mg</option><option>g</option><option>kg</option>
                    </optgroup>
                    <optgroup label="Cantidad">
                      <option>Unidades</option><option>Frascos</option><option>Botellas</option>
                      <option>Botes</option><option>Garrafas</option><option>Bidones</option>
                      <option>Viales</option><option>Ampollas</option><option>Tubos</option>
                      <option>Placas</option><option>Cajas</option><option>Sobres</option>
                    </optgroup>
                    <optgroup label="Concentración">
                      <option>%</option><option>ppm</option><option>ppb</option>
                      <option>M</option><option>mM</option><option>µM</option><option>N</option>
                    </optgroup>
                    <optgroup label="Mol">
                      <option>mol</option><option>mmol</option>
                    </optgroup>
                    <optgroup label="Longitud">
                      <option>mm</option><option>cm</option><option>m</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Fecha caducidad</label>
                  <input
                    type="date"
                    value={form.fecha_caducidad}
                    onChange={(e) => setForm({ ...form, fecha_caducidad: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Stock mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.stock_minimo}
                    onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Ficha de seguridad (opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Ficha de seguridad (PDF, opcional)
                </label>

                {fdsArchivo ? (
                  <div className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg px-3.5 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="text-[#1a2b4a] shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{fdsArchivo.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFdsArchivo(null)}
                      className="text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg px-3.5 py-3 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
                    <FileText size={16} />
                    Seleccionar PDF
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleArchivoChange}
                      className="hidden"
                    />
                  </label>
                )}

                {editando && !fdsArchivo && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Si el reactivo ya tiene una FDS, subir un nuevo PDF la sustituirá.
                  </p>
                )}
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
                  disabled={guardando}
                  className="flex-1 bg-[#1a2b4a] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#243659] transition-colors disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Añadir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reactivos;