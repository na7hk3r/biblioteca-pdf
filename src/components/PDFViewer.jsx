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
  const [pdf, setPdf] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null) // Referencia para la tarea de renderizado

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
    if (book) {
      const loadingTask = pdfjsLib.getDocument(`http://localhost:3001${book.path}`)
      loadingTask.promise.then(pdf => {
        console.log('PDF loaded');
        setPdf(pdf)
        setNumPages(pdf.numPages)
        renderPage(pdf, pageNumber)
      }).catch(err => {
        console.error('Error loading document:', err);
        setError(`Error al cargar el documento: ${err.message}`)
      });
    }
  }, [book])

  useEffect(() => {
    if (pdf) {
      renderPage(pdf, pageNumber)
    }
  }, [pdf, pageNumber])

  const renderPage = (pdf, pageNumber) => {
    pdf.getPage(pageNumber).then(page => {
      console.log('Page loaded');
      const scale = 1.5
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      canvas.style.maxHeight = '80vh';
      canvas.style.maxWidth = '80vw';

      // Cancelar cualquier tarea de renderizado anterior
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      const renderTask = page.render(renderContext)
      renderTaskRef.current = renderTask;

      renderTask.promise.then(() => {
        console.log('Page rendered');
      }).catch(err => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
          setError(`Error al renderizar la página: ${err.message}`)
        }
      });
    }).catch(err => {
      console.error('Error getting page:', err);
      setError(`Error al obtener la página: ${err.message}`)
    });
  }

  const handleClose = () => {
    document.startViewTransition(() => {
      navigate('/')
    })
  }

  const handlePreviousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1))
  }

  const handleNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages))
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
        className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition duration-300 z-10"
        onClick={handleClose}
      >
        Cerrar
      </button>
      <div className="flex items-center justify-center mb-4 z-10">
        <button 
          className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition duration-300 mr-2"
          onClick={handlePreviousPage}
          disabled={pageNumber <= 1}
        >
          Anterior
        </button>
        <button 
          className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition duration-300"
          onClick={handleNextPage}
          disabled={pageNumber >= numPages}
        >
          Siguiente
        </button>
      </div>
      <div className="flex justify-center items-center overflow-auto" style={{ maxHeight: '80vh', maxWidth: '80vw' }}>
        <canvas ref={canvasRef} className="border-none z-0" />
      </div>
      <div className="text-white mt-2 z-10">
        Página {pageNumber} de {numPages}
      </div>
    </div>
  )
}

export default PDFViewer
