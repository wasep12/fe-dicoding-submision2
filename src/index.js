import './styles/styles.css';
import './components/note-header';
import './components/note-input';
import './components/note-item';
import './components/note-archive-item';
import './components/loading-bar';

// URL API yang digunakan
const API_URL = 'https://notes-api.dicoding.dev/v2';

// Flag untuk mencegah multiple fetch
let fetchingNotes = false;
let currentFilter = 'not-archived';
let currentQuery = '';

// Tampilkan loading bar
function showLoading() {
  const loadingBar = document.createElement('loading-bar');
  document.body.appendChild(loadingBar);
  loadingBar.simulateLoading(3500); // Durasi loading 3 detik
  return loadingBar;
}

// Hapus loading bar
function hideLoading(loadingBar) {
  document.body.removeChild(loadingBar);
}

// Ambil dan tampilkan catatan
async function fetchNotes(filter = 'not-archived', query = '') {
  if (fetchingNotes) {
    console.log('Fetching notes sudah dalam proses...');
    return; // Mencegah multiple fetch
  }
  fetchingNotes = true;

  const loadingBar = showLoading();
  try {
    const endpoint = filter === 'archived' ? 'notes/archived' : 'notes';
    console.log(`Fetching notes from endpoint: ${endpoint}`);
    const response = await fetch(`${API_URL}/${endpoint}`);
    const result = await response.json();

    console.log('Respon API fetchNotes:', result);

    if (result.status === 'success' && Array.isArray(result.data)) {
      const filteredNotes = result.data.filter(
        (note) =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.body.toLowerCase().includes(query.toLowerCase())
      );
      displayNotes(filteredNotes, filter); // Perbarui tampilan dengan data yang difilter
    } else {
      console.error('Respon API tidak terduga:', result);
    }
  } catch (error) {
    console.error('Error saat mengambil catatan:', error);
  } finally {
    hideLoading(loadingBar);
    fetchingNotes = false; // Reset flag setelah fetching selesai
  }
}

// Tampilkan catatan di kontainer
function displayNotes(notes = [], filter = 'not-archived') {
  console.log('Menampilkan catatan:', notes);

  if (!Array.isArray(notes)) {
    console.error('Data catatan tidak valid:', notes);
    return;
  }

  const notesContainer = document.getElementById('notesContainer');
  notesContainer.innerHTML = '';

  notes.forEach((note) => {
    const noteElement = document.createElement(
      filter === 'archived' ? 'note-archive-item' : 'note-item'
    );
    noteElement.note = {
      ...note,
      createdAt: new Date(note.createdAt).toISOString(), // Pastikan format yang benar
    };
    notesContainer.appendChild(noteElement);
  });
}

// Tangani penambahan catatan
document.addEventListener('note-added', async (event) => {
  const note = event.detail;

  console.log('Catatan yang akan ditambahkan:', note);

  if (!note.title || !note.body) {
    console.error('Judul dan deskripsi catatan diperlukan.');
    return;
  }

  const loadingBar = showLoading();
  try {
    // Hanya kirim title dan body
    const { title, body } = note;
    console.log('Data yang dikirim ke API:', { title, body });

    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      console.log('Catatan berhasil ditambahkan:', result);
      await fetchNotes(currentFilter, currentQuery); // Perbarui data dengan mengambil catatan terbaru
    } else {
      console.error('Gagal menambahkan catatan:', result);
    }
  } catch (error) {
    console.error('Error saat menambahkan catatan:', error);
  } finally {
    hideLoading(loadingBar);
  }
});

// Tangani penghapusan catatan
document.addEventListener('delete-note', async (event) => {
  const noteToDelete = event.detail;
  const confirmDeletePopup = document.getElementById('confirm-delete-popup');
  confirmDeletePopup.querySelector('#delete-confirm-message').innerText =
    `Apakah Anda yakin ingin menghapus catatan berjudul "${noteToDelete.title}"?`;

  document.getElementById('confirm-delete').onclick = async () => {
    const loadingBar = showLoading();
    try {
      const response = await fetch(`${API_URL}/notes/${noteToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.status === 'success') {
        console.log('Catatan berhasil dihapus:', result);
        await fetchNotes(currentFilter, currentQuery); // Perbarui data dengan mengambil catatan terbaru
        confirmDeletePopup.style.display = 'none';
      } else {
        console.error('Gagal menghapus catatan:', result);
      }
    } catch (error) {
      console.error('Error saat menghapus catatan:', error);
    } finally {
      hideLoading(loadingBar);
    }
  };

  document.getElementById('cancel-delete').onclick = () => {
    confirmDeletePopup.style.display = 'none';
  };

  confirmDeletePopup.style.display = 'flex';
});

// Tangani pengarsipan catatan
document.addEventListener('archive-note', async (event) => {
  const noteToArchive = event.detail;
  const loadingBar = showLoading();
  try {
    const endpoint = noteToArchive.archived ? 'unarchive' : 'archive';
    const response = await fetch(
      `${API_URL}/notes/${noteToArchive.id}/${endpoint}`,
      {
        method: 'POST',
      }
    );
    const result = await response.json();

    if (result.status === 'success') {
      console.log('Status catatan berhasil diupdate:', result);
      await fetchNotes(currentFilter, currentQuery); // Perbarui data dengan mengambil catatan terbaru
    } else {
      console.error('Gagal mengupdate status catatan:', result);
    }
  } catch (error) {
    console.error('Error saat mengupdate status catatan:', error);
  } finally {
    hideLoading(loadingBar);
  }
});

// Event listener untuk navigasi antara notes dan archived
document.getElementById('notes-tab').addEventListener('click', () => {
  currentFilter = 'not-archived';
  fetchNotes(currentFilter, currentQuery);
});

document.getElementById('archived-tab').addEventListener('click', () => {
  currentFilter = 'archived';
  fetchNotes(currentFilter, currentQuery);
});

// Event listener untuk pencarian catatan
document.addEventListener('search-notes', async (event) => {
  currentQuery = event.detail;
  await fetchNotes(currentFilter, currentQuery);
});

// Ambil catatan awal
fetchNotes(currentFilter, currentQuery);

// Custom Element: NoteItem
class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.handleArchiveClick = this.handleArchiveClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleViewMoreClick = this.handleViewMoreClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.shadowRoot
      .querySelector('.archive-btn')
      .addEventListener('click', this.handleArchiveClick);
    this.shadowRoot
      .querySelector('.delete-btn')
      .addEventListener('click', this.handleDeleteClick);
    this.shadowRoot
      .querySelector('.view-more-btn')
      .addEventListener('click', this.handleViewMoreClick);
  }

  disconnectedCallback() {
    this.shadowRoot
      .querySelector('.archive-btn')
      .removeEventListener('click', this.handleArchiveClick);
    this.shadowRoot
      .querySelector('.delete-btn')
      .removeEventListener('click', this.handleDeleteClick);
    this.shadowRoot
      .querySelector('.view-more-btn')
      .removeEventListener('click', this.handleViewMoreClick);
  }

  set note(note) {
    this._note = note;
    this.render();
  }

  get note() {
    return this._note;
  }

  render() {
    const note = this.note || {};
    const {
      title = 'No Title',
      body = 'No Description',
      createdAt = 'Unknown Date',
    } = note;

    this.shadowRoot.innerHTML = `
      <style>
        .note-item {
          display: flex;
          flex-direction: column;
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: linear-gradient(135deg, #f9f9f9, #e2e2e2);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-bottom: 20px;
          min-height: 250px;
          height: 300px;
          position: relative;
          overflow: hidden;
        }
        .note-item:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }
        .note-item h2 {
          font-size: 18px;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .note-body {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 5; /* Limit the number of visible lines */
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 8em; /* Limit height of the body */
          margin-bottom: 10px; /* Space between text and actions */
        }
        .actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }
        .archive-btn, .delete-btn {
          flex-grow: 1; /* Make buttons expand to fill the container */
          background-color: #03a9f4;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          padding: 10px;
          font-size: 14px;
          transition: background-color 0.3s ease, transform 0.3s ease;
          text-align: center; /* Center text inside button */
        }
        .archive-btn:hover {
          background-color: #0288d1;
          transform: scale(1.05);
        }
        .delete-btn {
          background-color: #ff5252;
        }
        .delete-btn:hover {
          background-color: #ff1744;
          transform: scale(1.05);
        }
        .view-more-btn {
          background-color: #f9f9f9;
          color: #03a9f4;
          border: 1px solid #03a9f4;
          border-radius: 5px;
          cursor: pointer;
          padding: 5px 10px;
          font-size: 14px;
          text-align: center;
          margin-top: 10px;
        }
        .view-more-btn:hover {
          background-color: #e1f5fe;
        }
        /* Popup styles */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          visibility: hidden;
          opacity: 0;
          transition: visibility 0.3s, opacity 0.3s;
        }
        .popup-overlay.show {
          visibility: visible;
          opacity: 1;
        }
        .popup {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        .popup h2 {
          margin-top: 0;
        }
        .popup .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff5252;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          padding: 5px 10px;
        }
        .popup .close-btn:hover {
          background: #ff1744;
        }
        .popup .content {
          margin-top: 15px;
        }
      </style>
      <div class="note-item">
        <h2>${title}</h2>
        <p class="note-body">${body}</p>
        <div class="date">${new Date(createdAt).toLocaleString()}</div>
        <div class="actions">
          <button class="archive-btn">Archive</button>
          <button class="delete-btn">Delete</button>
        </div>
        <button class="view-more-btn">View More</button>
      </div>
      <div class="popup-overlay">
        <div class="popup">
          <button class="close-btn">X</button>
          <div class="popup-content">
            <h2 class="popup-title"></h2>
            <p class="popup-body"></p>
            <p class="popup-date"></p>
          </div>
        </div>
      </div>
    `;
  }

  async showPopup() {
    if (!this.note.id) return;

    const popupOverlay = this.shadowRoot.querySelector('.popup-overlay');
    const popupTitle = this.shadowRoot.querySelector('.popup-title');
    const popupBody = this.shadowRoot.querySelector('.popup-body');
    const popupDate = this.shadowRoot.querySelector('.popup-date');

    popupOverlay.classList.add('show');

    try {
      const response = await fetch(`${API_URL}/notes/${this.note.id}`);
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        popupTitle.textContent = result.data.title;
        popupBody.textContent = result.data.body;
        popupDate.textContent = new Date(
          result.data.createdAt
        ).toLocaleString();
      } else {
        popupTitle.textContent = 'Error';
        popupBody.textContent = 'Data tidak dapat dimuat.';
        popupDate.textContent = '';
      }
    } catch (error) {
      popupTitle.textContent = 'Error';
      popupBody.textContent = 'Terjadi kesalahan saat memuat data.';
      popupDate.textContent = '';
    }

    this.shadowRoot
      .querySelector('.close-btn')
      .addEventListener('click', () => {
        popupOverlay.classList.remove('show');
      });
  }
}

// Daftarkan custom element jika belum terdaftar
if (!customElements.get('note-item')) {
  customElements.define('note-item', NoteItem);
}
