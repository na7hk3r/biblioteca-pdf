import React from 'react'

function BookCard({ book, onClick }) {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105"
      onClick={onClick}
    >
      <img 
        src={`http://localhost:3001${book.cover}`} 
        alt={`Portada de ${book.title}`} 
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 truncate">{book.title}</h3>
        <p className="text-gray-600">{book.author}</p>
      </div>
    </div>
  )
}

export default BookCard
