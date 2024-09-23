import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BookCard from './components/BookCard'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/books')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar los libros')
        }
        return response.json()
      })
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(error => {
        setError(error.message)
        setLoading(false)
      })
  }, [])

  const handleBookClick = (book) => {
    document.startViewTransition(() => {
      navigate(`/pdf/${book.id}`, { state: { book } })
    })
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-2xl font-bold">Cargando libros...</div>
  if (error) return <div className="flex items-center justify-center h-screen text-2xl font-bold text-red-600">Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Mi Biblioteca PDF</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map(book => (
          <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
        ))}
      </div>
    </div>
  )
}

export default App
