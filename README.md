## 📚 Biblioteca PDF (En desarrollo🔧)
Este proyecto es una aplicación web que permite visualizar y gestionar archivos PDF. Se puede ver una lista de PDFs, ver sus miniaturas y navegar por sus páginas.

## 🚀 Descripción del Proyecto
Este proyecto está compuesto por un frontend en React y un backend en Node.js con Express. La aplicación permite:

- Listar todos los archivos PDF disponibles en el servidor.
- Mostrar miniaturas de las primeras páginas de los PDFs.
- Ver la información del PDF, como el título y el autor.
- Navegar por las páginas del PDF.

## 🛠️ Tecnologías Utilizadas
Frontend: React, React Router, Tailwind CSS, Vite.
Backend: Node.js, Express, pdfjs-dist, canvas.
Despliegue: Vercel.

## 📂 Estructura del Proyecto
El proyecto está organizado de la siguiente manera:

```
biblioteca-pdf/
├── public/                 # Archivos estáticos
│   ├── thumbnails/         # Miniaturas generadas de los PDFs
│   └── ...                 # Otros archivos estáticos
├── server/                 # Código del servidor
│   ├── index.mjs           # Servidor Express
│   └── ...                 # Otros archivos del servidor
├── src/                    # Código del frontend
│   ├── components/         # Componentes de React
│   ├── App.jsx             # Componente principal de la aplicación
│   ├── main.jsx            # Punto de entrada del frontend
│   └── ...                 # Otros archivos del frontend
├── dist/                   # Archivos generados por la build de Vite
├── package.json            # Dependencias y scripts del proyecto
├── vercel.json             # Configuración de despliegue en Vercel
└── ...                     # Otros archivos de configuración
```

## 🌟 Características

### Listado de PDFs
La aplicación muestra una lista de todos los archivos PDF disponibles en el servidor. Cada PDF se muestra con su miniatura, título y autor.

### Visualización de PDFs
Al hacer clic en un PDF, se abre un visor que permite navegar por las páginas del PDF; avanzar y retroceder entre las páginas usando los botones de navegación.

### Generación de Miniaturas
El servidor genera miniaturas de la primera página de cada PDF para mostrarlas en la lista de PDFs. Estas miniaturas se almacenan en la carpeta public/thumbnails.

## 📜 Archivos Clave
<code>server/index.mjs</code>

Contiene el código del servidor Express. Se encarga de servir los archivos estáticos, manejar las rutas de la API y generar las miniaturas de los PDFs.

<code>src/App.jsx</code>

Componente principal de la aplicación. Se encarga de obtener la lista de PDFs del servidor y mostrarlos en la interfaz de usuario.

<code>src/components/PDFViewer.jsx</code>

El componente que se encarga de visualizar los PDFs. Permite navegar por las páginas del PDF y muestra un mensaje de error si no se puede cargar el documento.

<code>vercel.json</code>

Contiene la configuración de despliegue en Vercel. Define cómo se deben construir y servir el frontend y el backend.


with ♥ by [@na7hk3r](https://github.com/na7hk3r)