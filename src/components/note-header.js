class NoteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #6200ea;
          color: white;
          padding: 20px;
          font-size: 24px;
          font-weight: bold;
          border-bottom: 3px solid #03a9f4; /* Garis aksen */
        }
        .title {
          margin: 0;
        }
        .search-container {
          display: flex;
          align-items: center;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          padding: 5px 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .search-input {
          border: none;
          padding: 10px;
          font-size: 16px;
          outline: none;
          width: 200px;
        }
        .search-input::placeholder {
          color: #b0bec5;
        }
        .search-icon {
          border: none;
          background-color: white;
          padding: 10px;
          font-size: 16px;
          cursor: pointer;
        }
      </style>
      <header>
        <div class="title">Aplikasi Catatan</div>
        <div class="search-container">
          <input type="text" class="search-input" placeholder="Cari catatan...">
          <button class="search-icon">🔍</button>
        </div>
      </header>
    `;

    this.shadowRoot
      .querySelector(".search-icon")
      .addEventListener("click", () => {
        const query = this.shadowRoot.querySelector(".search-input").value;
        const event = new CustomEvent("search-notes", { detail: query });
        document.dispatchEvent(event);
      });
  }
}

if (!customElements.get("note-header")) {
  customElements.define("note-header", NoteHeader);
}
