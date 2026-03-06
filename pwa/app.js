// Biblioteca Mundo Hispano - PWA
// Usa IndexedDB para guardar libros y permite abrir PDFs desde la carpeta LIBRARY

const CATEGORIES = [
  {
    id: 'biblia',
    title: 'Biblias y Comentarios',
    description: 'Reina-Valera, NVI, diccionarios y comentarios bíblicos.'
  },
  {
    id: 'estudio',
    title: 'Estudio Bíblico',
    description: 'Guías de estudio, concordancias y geografía bíblica.'
  },
  {
    id: 'predicacion',
    title: 'Ministerios de Predicación y Enseñanza',
    description: 'Sermones, doctrina y materiales para predicar.'
  },
  {
    id: 'pastoral',
    title: 'Ministerio Pastoral',
    description: 'Consejos pastorales, eclesiología y recursos para líderes.'
  },
  {
    id: 'otro',
    title: 'Otros Recursos',
    description: 'Materiales que no encajan en las categorías anteriores.'
  }
];

let BOOKS = [];

const dbName = 'bibmundo-db';
const storeName = 'guardados';

async function openDB() {
  if (!('indexedDB' in window)) return null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToDB(item) {
  const db = await openDB();
  if (!db) return;
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.put(item);
  return tx.complete;
}

async function getSavedItems() {
  const db = await openDB();
  if (!db) return [];
  return new Promise(resolve => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function deleteSaved(id) {
  const db = await openDB();
  if (!db) return;
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(id);
  return tx.complete;
}

function $(selector) {
  return document.querySelector(selector);
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.hidden = section.id !== id;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    card.innerHTML = `<h3>${book.title}</h3><p>${book.excerpt || 'Abrir PDF para ver la descripción.'}</p>`;
    card.addEventListener('click', () => openBook(book.id));
    container.append(card);
  });
}

let previousView = 'home';
let previousCategory = null;

function showCategory(categoryId) {
  previousView = 'category';
  previousCategory = categoryId;
  const books = BOOKS.filter(b => b.category === categoryId);
  $('#results').hidden = false;
  $('#categories').hidden = true;
  renderBooks(books);
}

function openBook(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  $('#readerTitle').textContent = book.title;
  $('#readerDesc').textContent = book.excerpt || 'Abre el PDF para ver el contenido completo.';
  $('#readerFrame').src = book.file;

  previousView = $('#results').hidden ? 'home' : 'results';
  showSection('reader');
  currentBook = book;
  updateSaveButton();
}

let currentBook = null;

async function updateSaveButton() {
  const btn = $('#save');
  if (!currentBook) return;
  const saved = await getSavedItems();
  const exists = saved.some(item => item.id === currentBook.id);
  btn.textContent = exists ? 'Guardado' : 'Guardar';
  btn.disabled = exists;
}

async function renderSaved() {
  const savedList = await getSavedItems();
  const container = $('#savedList');
  container.innerHTML = '';

  if (!savedList.length) {
    $('#savedEmpty').hidden = false;
    return;
  }

  $('#savedEmpty').hidden = true;
  savedList.forEach(book => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${book.title}</h3><p>${book.excerpt || 'No hay descripción.'}</p>`;

    const actions = document.createElement('div');
    actions.style.marginTop = '10px';
    actions.style.display = 'flex';
    actions.style.gap = '10px';

    const open = document.createElement('button');
    open.className = 'btn-clear';
    open.textContent = 'Abrir';
    open.addEventListener('click', () => {
      previousView = 'saved';
      currentBook = book;
      $('#readerTitle').textContent = book.title;
      $('#readerDesc').textContent = book.excerpt || '';
      $('#readerFrame').src = book.file;
      showSection('reader');
      updateSaveButton();
    });

    const remove = document.createElement('button');
    remove.className = 'btn-clear';
    remove.textContent = 'Eliminar';
    remove.addEventListener('click', async () => {
      await deleteSaved(book.id);
      renderSaved();
    });

    actions.append(open, remove);
    card.append(actions);
    container.append(card);
  });
}

function setupEvents() {
  $('#back').addEventListener('click', () => {
    if (previousView === 'category' && previousCategory) {
      showCategory(previousCategory);
    } else if (previousView === 'results') {
      $('#results').hidden = false;
      $('#categories').hidden = true;
      showSection('home');
    } else if (previousView === 'saved') {
      showSection('saved');
    } else {
      showSection('home');
      $('#results').hidden = true;
      $('#categories').hidden = false;
    }
  });

  $('#backFromSaved').addEventListener('click', () => showSection('home'));

  $('#save').addEventListener('click', async () => {
    if (!currentBook) return;
    await saveToDB(currentBook);
    updateSaveButton();
  });

  $('#show-saved').addEventListener('click', async () => {
    previousView = 'saved';
    showSection('saved');
    await renderSaved();
  });

  $('#search').addEventListener('input', event => {
    const term = event.target.value.trim().toLowerCase();
    if (!term) {
      $('#results').hidden = true;
      $('#categories').hidden = false;
      return;
    }

    $('#categories').hidden = true;
    $('#results').hidden = false;

    previousView = 'results';
    const matches = BOOKS.filter(book => {
      return (book.title + book.excerpt)
        .toLowerCase()
        .includes(term);
    });

    renderBooks(matches);
  });
}

async function loadLibrary() {
  try {
    const resp = await fetch('library.json');
    if (!resp.ok) throw new Error('No se pudo cargar library.json');
    const data = await resp.json();
    BOOKS = Array.isArray(data.books) ? data.books : [];
  } catch (err) {
    console.warn('Error al cargar la biblioteca:', err);
    BOOKS = [];
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker registrado:', reg.scope);
    } catch (err) {
      console.warn('No se pudo registrar Service Worker:', err);
    }
  }
}

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
      console.log('Usuario aceptó instalar la PWA');
    }
    deferredPrompt = null;
    installButton.hidden = true;
  });
}

async function init() {
  await loadLibrary();
  renderCategories();
  setupEvents();
  registerServiceWorker();
  setupInstallPrompt();
  showSection('home');
}

init();
