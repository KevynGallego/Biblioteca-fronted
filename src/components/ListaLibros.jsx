import { useEffect, useRef, useState } from 'react'
import { API_URL } from '../config'

const SEARCH_URL = `${API_URL}/search`

function ListaLibros({ onEditarLibro, onLibroEliminado }) {

function normalizarLibro(libro) {
  const descripcionOriginal = libro.descripcion  ?? libro.resumen ?? ''
  const anio = libro.anio ?? libro.year ?? libro.año

  const descripcion = String(descripcionOriginal).trim()
  const esDescripcionVacia = !descripcion || descripcion === 'Sin descripción disponible' || descripcion === 'Sin descripción disponible.'

  return {
    id: libro.id ?? libro._id,
    titulo: libro.titulo ?? libro.title ?? libro.nombre ?? libro.name ?? 'Sin título',
    autor: libro.autor ?? libro.author ?? 'Sin autor',
    categoria: libro.categoria ?? libro.category ?? libro.genero ?? 'General',
    calificacion: libro.calificacion ?? libro.rating,
  }
}

  const [libros, setLibros] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [ultimaPagina, setUltimaPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [filtros, setFiltros] = useState({ search: '', anio: '', calificacion: '' })
  const timeoutRef = useRef(null)

  const eliminarLibro = async (libro) => {
    if (!libro?.id) return

    setEliminando(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/${libro.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('No se pudo eliminar el libro.')
      }

      setLibros((prev) => prev.filter((item) => item.id !== libro.id))
      setConfirmarEliminar(null)
      onLibroEliminado?.(libro.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando(false)
    }
  }

  const cargarLibros = async (page = 1, filtrosActuales = filtros) => {
    setError('')

    try {
      const params = new URLSearchParams({ page: String(page) })

      if (filtrosActuales.search) params.set('search', filtrosActuales.search)
      if (filtrosActuales.anio) params.set('anio', filtrosActuales.anio)
      if (filtrosActuales.calificacion) params.set('calificacion', filtrosActuales.calificacion)

      const response = await fetch(`${SEARCH_URL}?${params.toString()}`)

      if (!response.ok) {
        throw new Error('No se pudo cargar la lista de libros.')
      }

      const data = await response.json()
      const lista = Array.isArray(data) ? data : data.data || []

      setLibros(lista.map(normalizarLibro))
      setPaginaActual(data.current_page ?? page)
      setUltimaPagina(data.last_page ?? 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarLibros(paginaActual)
  }, [paginaActual])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target
    const nuevosFiltros = { ...filtros, [name]: value }
    setFiltros(nuevosFiltros)
    setPaginaActual(1)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (name === 'search') {
      timeoutRef.current = setTimeout(() => {
        cargarLibros(1, nuevosFiltros)
      }, 300)
    } else {
      cargarLibros(1, nuevosFiltros)
    }
  }

  const manejarBuscar = (e) => {
    e.preventDefault()
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setPaginaActual(1)
    cargarLibros(1, filtros)
  }

  return (
    <section className="lista-libros" aria-label="Listado de libros">
      {cargando && <p className="estado">Cargando libros...</p>}
      {error && <p className="estado error">{error}</p>}

      {!cargando && !error && (
        <>
          <form className="buscador" onSubmit={manejarBuscar}>
            <input
              type="text"
              name="search"
              value={filtros.search}
              placeholder="Buscar por título o autor"
              onChange={manejarCambioFiltro}
            />
            <input
              type="number"
              name="anio"
              value={filtros.anio}
              placeholder="Año"
              onChange={manejarCambioFiltro}
            />
            <select name="calificacion" value={filtros.calificacion} onChange={manejarCambioFiltro}>
              <option value="">Calificación</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button type="submit">Buscar</button>
          </form>

          <div className="cards-grid">
            {libros.map((libro) => (
              <article className="book-card" key={libro.id}>
                <div className="card-badge">{libro.categoria}</div>
                <h2>{libro.titulo}</h2>
                <p className="author">{libro.autor}</p>
                <p className="description">{libro.descripcion}</p>
                {(libro.anio || libro.calificacion) && (
                  <p className="meta">
                    {libro.anio ? `Año: ${libro.anio}` : ''}
                    {libro.anio && libro.calificacion ? ' · ' : ''}
                    {libro.calificacion ? `Calificación: ${libro.calificacion}/5` : ''}
                  </p>
                )}
                <div className="acciones-card">
                  <button type="button">Ver detalle</button>
                  <button type="button" className="btn-editar" onClick={() => onEditarLibro?.(libro)}>
                    Editar
                  </button>
                  <button type="button" className="btn-eliminar" onClick={() => setConfirmarEliminar(libro)}>
                    Eliminar
                  </button>
                </div>

                {confirmarEliminar?.id === libro.id && (
                  <div className="confirmacion-eliminar">
                    <p>¿Seguro que deseas eliminar este libro?</p>
                    <div className="acciones-confirmacion">
                      <button type="button" className="btn-confirmar" onClick={() => eliminarLibro(libro)} disabled={eliminando}>
                        Sí
                      </button>
                      <button type="button" className="btn-cancelar" onClick={() => setConfirmarEliminar(null)}>
                        No
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="paginacion">
            <button type="button" disabled={paginaActual === 1} onClick={() => setPaginaActual((prev) => prev - 1)}>
              Anterior
            </button>
            <span>
              Página {paginaActual} de {ultimaPagina}
            </span>
            <button type="button" disabled={paginaActual === ultimaPagina} onClick={() => setPaginaActual((prev) => prev + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default ListaLibros
