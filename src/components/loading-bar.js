class LoadingBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
              .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
              }
      
              .loading-bar-container {
                background: #fff;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                text-align: center;
                width: 100%;
                max-width: 400px;
                position: relative;
              }
      
              .loading-bar {
                height: 25px;
                width: 0;
                background: #4caf50;
                border-radius: 12px;
                transition: width 0.4s ease;
                margin-bottom: 15px;
                position: relative;
                overflow: hidden;
              }
      
              .loading-text {
                font-size: 18px;
                color: #333;
                font-weight: bold;
              }
      
              .loading-percent {
                font-size: 20px;
                font-weight: bold;
                color: #4caf50;
              }
      
              .spinner {
                border: 8px solid rgba(0, 0, 0, 0.1);
                border-left-color: #4caf50;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
                margin-bottom: 20px; /* Jarak antara spinner dan loading bar */
              }
      
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
            <div class="loading-overlay">
              <div class="loading-bar-container">
                <div class="spinner"></div>
                <div class="loading-bar"></div>
                <div class="loading-text">Loading... <span class="loading-percent">0%</span></div>
              </div>
            </div>
          `;
  }

  connectedCallback() {
    this.updateProgress(0);
  }

  updateProgress(percent) {
    const loadingBar = this.shadowRoot.querySelector(".loading-bar");
    const loadingPercent = this.shadowRoot.querySelector(".loading-percent");
    loadingBar.style.width = `${percent}%`;
    loadingPercent.textContent = `${percent}%`;

    // Stop animation once loading is complete
    if (percent === 100) {
      this.shadowRoot.querySelector(".spinner").style.animation = "none";
    }
  }

  simulateLoading(duration) {
    let percent = 0;
    const intervalTime = duration / 100;
    const interval = setInterval(() => {
      if (percent < 100) {
        percent += 1;
        this.updateProgress(percent);
      } else {
        clearInterval(interval);
        setTimeout(() => this.remove(), 300); // Delay before removing
      }
    }, intervalTime);
  }
}

if (!customElements.get("loading-bar")) {
  customElements.define("loading-bar", LoadingBar);
}
