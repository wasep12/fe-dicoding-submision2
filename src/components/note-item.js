const API_URL = "https://notes-api.dicoding.dev/v2";

class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot
      .querySelector(".archive-btn")
      .addEventListener("click", () => {
        const event = new CustomEvent("archive-note", { detail: this.note });
        document.dispatchEvent(event);
      });
    this.shadowRoot
      .querySelector(".delete-btn")
      .addEventListener("click", () => {
        const event = new CustomEvent("delete-note", { detail: this.note });
        document.dispatchEvent(event);
      });
    this.shadowRoot
      .querySelector(".view-more-btn")
      .addEventListener("click", () => {
        this.showPopup();
      });
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
      title = "No Title",
      body = "No Description",
      createdAt = "Unknown Date",
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

    const popupOverlay = this.shadowRoot.querySelector(".popup-overlay");
    const popupTitle = this.shadowRoot.querySelector(".popup-title");
    const popupBody = this.shadowRoot.querySelector(".popup-body");
    const popupDate = this.shadowRoot.querySelector(".popup-date");

    popupOverlay.classList.add("show");

    try {
      const response = await fetch(`${API_URL}/notes/${this.note.id}`);
      const result = await response.json();

      if (result.status === "success" && result.data) {
        popupTitle.textContent = result.data.title;
        popupBody.textContent = result.data.body;
        popupDate.textContent = new Date(
          result.data.createdAt
        ).toLocaleString();
      } else {
        popupTitle.textContent = "Error";
        popupBody.textContent = "Data tidak dapat dimuat.";
        popupDate.textContent = "";
      }
    } catch (error) {
      popupTitle.textContent = "Error";
      popupBody.textContent = "Terjadi kesalahan saat memuat data.";
      popupDate.textContent = "";
    }

    this.shadowRoot
      .querySelector(".close-btn")
      .addEventListener("click", () => {
        popupOverlay.classList.remove("show");
      });
  }
}

// Check if the element is already defined
if (!customElements.get("note-item")) {
  customElements.define("note-item", NoteItem);
}
