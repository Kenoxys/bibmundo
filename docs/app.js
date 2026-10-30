/* ============================================
   BIBLIOTECA MUNDO HISPANO - Aplicación Principal
   ============================================
   PWA para explorar y leer recursos bíblicos.
   Funciona offline usando IndexedDB.
   ============================================ */

// ==================== CONSTANTES ====================

const CATEGORIES = [
  { id: 'biblia', title: 'Biblias y Comentarios', description: 'Reina-Valera, NVI, diccionarios y comentarios bíblicos.' },
  { id: 'estudio', title: 'Estudio Bíblico', description: 'Guías de estudio, concordancias y geografía bíblica.' },
  { id: 'predicacion', title: 'Ministerios de Predicación', description: 'Sermones, doctrina y materiales para predicar.' },
  { id: 'pastoral', title: 'Ministerio Pastoral', description: 'Consejos pastorales, eclesiología y líderes.' },
  { id: 'otro', title: 'Otros Recursos', description: 'Materiales diversos que no encajan en otras categorías.' }
];

// ==================== ESTADO GLOBAL ====================

let BOOKS = [];
let currentBook = null;
let previousView = 'home';
let currentCategory = null;

// Variables para PDF.js
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.2;

// ==================== INDEXEDDB (Funcionamiento offline) ====================

const DB_NAME = 'bibmundo-db';
const STORE_NAME = 'biblioteca';

async function openDB() {
  if (!('indexedDB' in window)) return null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveBooksToDB(books) {
  const db = await openDB();
  if (!db) return;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  books.forEach(book => store.put(book));
  return tx.complete;
}

async function loadBooksFromDB() {
  const db = await openDB();
  if (!db) return [];
  return new Promise(resolve => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

// ==================== FUNCIONES DE RENDER ====================

function $(selector) {
  return document.querySelector(selector);
}

function renderCategories() {
  const container = $('#categories');
  container.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const card = document.createElement('button');
    card.className = 'card';
    card.innerHTML = `<h3>${cat.title}</h3><p>${cat.description}</p>`;
    card.addEventListener('click', () => showCategory(cat.id));
    container.append(card);
  });
}

function renderBooks(list) {
  const container = $('#results');
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = `<div class="empty">No se encontraron resultados.</div>`;
    return;
  }
  list.forEach(book => {
    const card = document.createElement('button');
    card.className = 'card';
    const description = book.excerpt || 'Haz clic para abrir el PDF.';
    card.innerHTML = `<h3>${book.title}</h3><p>${description}</p>`;
    card.addEventListener('click', () => openBook(book.id));
    container.append(card);
  });
}

// ==================== NAVEGACIÓN ====================

function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.hidden = section.id !== id;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCategory(categoryId) {
  currentCategory = categoryId;
  previousView = 'category';
  
  const category = CATEGORIES.find(c => c.id === categoryId);
  const categoryTitle = $('#category-title');
  
  if (category) {
    categoryTitle.textContent = category.title;
    categoryTitle.hidden = false;
  }
  
  const books = BOOKS.filter(b => b.category === categoryId);
  $('#results').hidden = false;
  $('#categories').hidden = true;
  $('#show-all').hidden = false;
  
  renderBooks(books);
}

function showAllCategories() {
  currentCategory = null;
  previousView = 'home';
  
  $('#category-title').hidden = true;
  $('#results').hidden = true;
  $('#categories').hidden = false;
  $('#show-all').hidden = true;
}

function goBack() {
  if (previousView === 'category' || previousView === 'results') {
    showAllCategories();
  } else {
    showSection('home');
    $('#results').hidden = true;
    $('#categories').hidden = false;
  }
}

// ==================== PDF.JS - VISOR DE PDF ====================

async function openBook(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  if (!isValidPdfUrl(book.file)) {
    console.error('URL inválida:', book.file);
    return;
  }

  currentBook = book;
  previousView = $('#results').hidden ? 'home' : 'results';
  
  $('#readerTitle').textContent = book.title;
  $('#readerDesc').textContent = book.excerpt || 'Cargando documento...';
  
  showSection('reader');
  
  // Mostrar controls y cargar PDF
  $('#pdf-controls').hidden = false;
  $('#pdf-loading').hidden = false;
  $('#pdf-error').hidden = true;
  $('#pdf-container').hidden = true;
  
  await loadPDF(book.file);
}

function isValidPdfUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.toLowerCase().trim().endsWith('.pdf');
}

async function loadPDF(url) {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    
    $('#pdf-loading').hidden = true;
    $('#pdf-container').hidden = false;
    
    document.getElementById('page-num').textContent = `Página ${pageNum} de ${pdfDoc.numPages}`;
    
    renderPage(pageNum);
  } catch (error) {
    console.error('Error al cargar PDF:', error);
    $('#pdf-loading').hidden = true;
    $('#pdf-error').hidden = false;
    $('#pdf-controls').hidden = true;
  }
}

async function renderPage(num) {
  pageRendering = true;
  
  try {
    const page = await pdfDoc.getPage(num);
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    pageRendering = false;
    
    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  } catch (error) {
    pageRendering = false;
    console.error('Error renderizando página:', error);
  }
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  document.getElementById('page-num').textContent = `Página ${pageNum} de ${pdfDoc.numPages}`;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  document.getElementById('page-num').textContent = `Página ${pageNum} de ${pdfDoc.numPages}`;
  queueRenderPage(pageNum);
}

// ==================== EVENTOS ====================

function setupEvents() {
  // Botón volver
  $('#back').addEventListener('click', () => {
    if (pdfDoc) {
      pdfDoc.destroy();
      pdfDoc = null;
    }
    pageNum = 1;
    goBack();
  });

  // Botón ver todas las categorías
  $('#show-all').addEventListener('click', showAllCategories);

  // Búsqueda en tiempo real
  $('#search').addEventListener('input', event => {
    const term = event.target.value.trim().toLowerCase();
    
    if (!term) {
      $('#results').hidden = true;
      $('#categories').hidden = false;
      $('#show-all').hidden = true;
      $('#category-title').hidden = true;
      return;
    }

    $('#category-title').hidden = true;
    $('#categories').hidden = true;
    $('#results').hidden = false;
    $('#show-all').hidden = false;
    previousView = 'results';

    const matches = BOOKS.filter(book => {
      const searchText = (book.title + ' ' + (book.excerpt || '')).toLowerCase();
      return searchText.includes(term);
    });

    renderBooks(matches);
  });

  // Controles de PDF
  $('#prev-page').addEventListener('click', onPrevPage);
  $('#next-page').addEventListener('click', onNextPage);
}

// ==================== CARGA DE DATOS ====================

async function loadLibrary() {
  try {
    let books = await loadBooksFromDB();
    if (books.length > 0) {
      console.log('Biblioteca cargada desde caché offline');
      BOOKS = books;
      return;
    }

    const resp = await fetch('./library.json');
    if (!resp.ok) throw new Error('No se pudo cargar library.json');
    
    const data = await resp.json();
    BOOKS = Array.isArray(data.books) ? data.books : [];
    await saveBooksToDB(BOOKS);
    console.log('Biblioteca guardada en caché offline');
  } catch (err) {
    console.error('Error al cargar la biblioteca:', err);
    BOOKS = [];
  }
}

// ==================== SERVICE WORKER ====================

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registrado:', reg.scope);
    } catch (err) {
      console.warn('No se pudo registrar Service Worker:', err);
    }
  }
}

// ==================== INSTALACIÓN PWA ====================

function setupInstallPrompt() {
  let deferredPrompt;
  const installButton = $('#btn-install');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.hidden = false;
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('Usuario instaló la PWA');
    }
    deferredPrompt = null;
    installButton.hidden = true;
  });
}

// ==================== INICIALIZACIÓN ====================

async function init() {
  await loadLibrary();
  renderCategories();
  setupEvents();
  registerServiceWorker();
  setupInstallPrompt();
  showSection('home');
}

document.addEventListener('DOMContentLoaded', init);
