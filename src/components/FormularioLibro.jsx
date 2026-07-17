import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function FormularioLibro({ libroInicial = null, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState({
    titulo: '',
    autor: '',
    anio: '',
    calificacion: '',
  })

  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (libroInicial) {
      setFormulario({
        titulo: libroInicial.titulo || '',
        autor: libroInicial.autor || '',
        anio: libroInicial.anio || '',
        calificacion: libroInicial.calificacion || '',
      })
    }
  }, [libroInicial])

  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = 'El título es obligatorio.'
    }

    if (!formulario.autor.trim()) {
      nuevosErrores.autor = 'El autor es obligatorio.'
    }

    if (!formulario.anio) {
      nuevosErrores.anio = 'El año es obligatorio.'
    } else if (formulario.anio < 1900 || formulario.anio > new Date().getFullYear() + 1) {
      nuevosErrores.anio = 'El año debe ser razonable.'
    }

    if (!formulario.calificacion) {
      nuevosErrores.calificacion = 'La calificación es obligatoria.'
    } else if (formulario.calificacion < 1 || formulario.calificacion > 5) {
      nuevosErrores.calificacion = 'La calificación debe estar entre 1 y 5.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (!validar()) return

    setCargando(true)
    setMensaje('')

    try {
      const datos = {
        titulo: formulario.titulo.trim(),
        autor: formulario.autor.trim(),
        anio: Number(formulario.anio),
        calificacion: Number(formulario.calificacion),
      }

      const url = libroInicial?.id ? `${API_URL}/${libroInicial.id}` : API_URL
      const method = libroInicial?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      })

      if (!response.ok) {
        throw new Error(libroInicial?.id ? 'No se pudo actualizar el libro.' : 'No se pudo crear el libro.')
      }

      const libroGuardado = await response.json()
      setMensaje(libroInicial?.id ? 'Libro actualizado correctamente.' : 'Libro creado correctamente.')
      setFormulario({ titulo: '', autor: '', anio: '', calificacion: '' })
      setErrores({})
      onGuardar?.(libroGuardado)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="formulario-libro" onSubmit={manejarSubmit}>
      <h2>{libroInicial ? 'Editar libro' : 'Crear libro'}</h2>

      <label>
        Título
        <input
          type="text"
          name="titulo"
          value={formulario.titulo}
          onChange={manejarCambio}
          placeholder="Ej. El código da vinci"
        />
        {errores.titulo && <span className="error">{errores.titulo}</span>}
      </label>

      <label>
        Autor
        <input
          type="text"
          name="autor"
          value={formulario.autor}
          onChange={manejarCambio}
          placeholder="Ej. Dan Brown"
        />
        {errores.autor && <span className="error">{errores.autor}</span>}
      </label>

      <label>
        Año
        <input
          type="number"
          name="anio"
          value={formulario.anio}
          onChange={manejarCambio}
          min="1900"
          max={new Date().getFullYear() + 1}
        />
        {errores.anio && <span className="error">{errores.anio}</span>}
      </label>

      <label>
        Calificación (1 a 5)
        <input
          type="number"
          name="calificacion"
          value={formulario.calificacion}
          onChange={manejarCambio}
          min="1"
          max="5"
        />
        {errores.calificacion && <span className="error">{errores.calificacion}</span>}
      </label>

      {mensaje && <p className={`mensaje ${mensaje.includes('correctamente') ? 'exito' : 'error'}`}>{mensaje}</p>}

      <div className="acciones">
  <button type="submit" disabled={cargando}>
    {cargando ? 'Guardando...' : 'Guardar'}
  </button>

  {onCancelar && (
    <button
      type="button"
      className="btn-secundario"
      onClick={onCancelar}
      disabled={cargando}
    >
      Cancelar
    </button>
  )}
</div>

{cargando && (
  <div className="loading-spinner">
    <span className="spinner"></span>
    <span>Guardando libro...</span>
  </div>
)}
    </form>
  )
}

export default FormularioLibro
