import express from 'express';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createCanvas } from 'canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..', 'dist'))); // Servir archivos estáticos del frontend

const PDF_DIRECTORY = path.join(__dirname, 'pdfs');
const THUMBNAIL_DIRECTORY = path.join(__dirname, 'public', 'thumbnails');

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./pdf.worker.mjs', import.meta.url).href;

// Añade esta línea para servir los archivos PDF
app.use('/pdfs', express.static(PDF_DIRECTORY));

async function generateThumbnail(pdfPath, thumbnailPath) {
  const data = new Uint8Array(await fsPromises.readFile(pdfPath));
  const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdfDocument.getPage(1);
  const viewport = page.getViewport({ scale: 0.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  const buffer = canvas.toBuffer('image/png');
  await fsPromises.writeFile(thumbnailPath, buffer);
}

async function getPDFInfo(pdfPath) {
  const data = new Uint8Array(await fsPromises.readFile(pdfPath));
  const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
  const metadata = await pdfDocument.getMetadata();
  return metadata.info;
}

app.get('/api/books', async (req, res) => {
  try {
    const files = await fsPromises.readdir(PDF_DIRECTORY);
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

    if (!fs.existsSync(THUMBNAIL_DIRECTORY)) {
      await fsPromises.mkdir(THUMBNAIL_DIRECTORY, { recursive: true });
    }

    const books = await Promise.all(pdfFiles.map(async (file) => {
      const filePath = path.join(PDF_DIRECTORY, file);
      const thumbnailPath = path.join(THUMBNAIL_DIRECTORY, `${path.parse(file).name}.png`);

      if (!fs.existsSync(thumbnailPath)) {
        await generateThumbnail(filePath, thumbnailPath);
      }

      let pdfInfo;
      try {
        pdfInfo = await getPDFInfo(filePath);
      } catch (error) {
        console.error(`Error al procesar el PDF ${file}:`, error);
        pdfInfo = {};
      }

      return {
        id: path.parse(file).name,
        title: pdfInfo.Title || path.parse(file).name,
        author: pdfInfo.Author || 'Desconocido',
        cover: `/thumbnails/${path.parse(file).name}.png`,
        path: `/pdfs/${file}`
      };
    }));

    res.json(books);
  } catch (error) {
    console.error('Error al leer los archivos PDF:', error);
    res.status(500).json({ error: 'Error al cargar los libros' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    let id = req.params.id;
    // Eliminar la extensión .pdf si está presente
    id = id.replace(/\.pdf$/, '');

    const files = await fs.readdir(PDF_DIRECTORY);
    const pdfFile = files.find(file => path.parse(file).name === id);

    if (!pdfFile) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    const filePath = path.join(PDF_DIRECTORY, pdfFile);
    const pdfInfo = await getPDFInfo(filePath);

    const book = {
      id: path.parse(pdfFile).name,
      title: pdfInfo.Title || path.parse(pdfFile).name,
      author: pdfInfo.Author || 'Desconocido',
      cover: `/thumbnails/${path.parse(pdfFile).name}.png`,
      path: `/pdfs/${pdfFile}`
    };

    res.json(book);
  } catch (error) {
    console.error('Error al obtener información del libro:', error);
    res.status(500).json({ error: 'Error al obtener información del libro' });
  }
});

// Servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
