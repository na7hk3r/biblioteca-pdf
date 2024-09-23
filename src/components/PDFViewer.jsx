import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar el worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

function PDFViewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [book, setBook] = useState(location.state?.book)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!book && id) {
      // Si no tenemos la información del libro, la obtenemos del servidor
      fetch(`http://localhost:3001/api/books/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json()
        })
        .then(data => {
          setBook(data)
        })
        .catch(error => {
          console.error('Error fetching book info:', error)
          setError(`Error al cargar la información del libro: ${error.message}`)
        })
    }
  }, [book, id])

  useEffect(() => {
    if (book && canvasRef.current) {
      const loadingTask = pdfjsLib.getDocument(`http://localhost:3001${book.path}`)
      loadingTask.promise.then(pdf => {
        console.log('PDF loaded');
        pdf.getPage(1).then(page => {
          console.log('Page loaded');
          const scale = 1.5
          const viewport = page.getViewport({ scale })
          const canvas = canvasRef.current
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }
          page.render(renderContext).promise.then(() => {
            console.log('Page rendered');
          }).catch(err => {
            console.error('Error rendering page:', err);
            setError(`Error al renderizar la página: ${err.message}`)
          });
        }).catch(err => {
          console.error('Error getting page:', err);
          setError(`Error al obtener la página: ${err.message}`)
        });
      }).catch(err => {
        console.error('Error loading document:', err);
        setError(`Error al cargar el documento: ${err.message}`)
      });
    }
  }, [book])

  const handleClose = () => {
    document.startViewTransition(() => {
      navigate('/')
    })
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>
  }

  if (!book) {
    return <div className="text-center mt-10">Cargando información del libro...</div>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
      <button 
        className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition duration-300"
        onClick={handleClose}
      >
        Cerrar
      </button>
      <canvas ref={canvasRef} className="border-none" />
    </div>
  )
}

export default PDFViewer
