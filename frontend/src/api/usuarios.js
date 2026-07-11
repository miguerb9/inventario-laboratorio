import client from './client'

export async function getUsuarios() {
  const response = await client.get('/usuarios')
  return response.data
}

export async function borrarUsuario(id) {
  const response = await client.delete(`/usuarios/${id}`)
  return response.data
}

export async function crearUsuario(datos) {
  const response = await client.post('/registro', datos)
  return response.data
}

export async function actualizarUsuario(id, datos) {
  const response = await client.put(`/usuarios/${id}`, datos)
  return response.data
}