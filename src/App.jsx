import { useState } from 'react'
import './App.css'
import ListaLibros from './components/ListaLibros'
import FormularioLibro from './components/FormularioLibro'

function App() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [libroSeleccionado, setLibroSeleccionado] = useState(null)
  const [versionLista, setVersionLista] = useState(0)

  return (
    <main className="catalogo">
      <section className="hero">
        <div>
          <p className="eyebrow">Biblioteca virtual</p>
          <h1>Descubre tus próximos libros favoritos</h1>
          <p className="hero-text">
            Una vista elegante y sencilla para explorar una colección de libros con estilo.
          </p>
        </div>
      </section>

      <section className="acciones-principales">
        <button
          type="button"
          className="btn-crear"
          onClick={() => {
            setLibroSeleccionado(null)
            setMostrarFormulario(true)
          }}
        >
          Crear libro
        </button>
      </section>

      <section className="contenido">
        {!mostrarFormulario && (
          <ListaLibros
            key={versionLista}
            onEditarLibro={(libro) => {
              setLibroSeleccionado(libro)
              setMostrarFormulario(true)
            }}
          />
        )}

        {mostrarFormulario && (
          <div className="form-wrapper">
            <FormularioLibro
              libroInicial={libroSeleccionado}
              onCancelar={() => setMostrarFormulario(false)}
              onGuardar={() => {
                setVersionLista((prev) => prev + 1)
                setMostrarFormulario(false)
              }}
            />
          </div>
        )}
      </section>
    </main>
  )
}

export default App
