import client from './client'

export async function getReactivos() {
  const response = await client.get('/reactivos')
  return response.data
}

export async function crearReactivo(datos) {
  const response = await client.post('/reactivos', datos)
  return response.data
}

export async function actualizarReactivo(id, datos) {
  const response = await client.put(`/reactivos/${id}`, datos)
  return response.data
}

export async function borrarReactivo(id) {
  const response = await client.delete(`/reactivos/${id}`)
  return response.data
}

export async function getReactivo(id) {
  const response = await client.get(`/reactivos/${id}`)
  return response.data
}