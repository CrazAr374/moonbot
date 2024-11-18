// Constants for chat responses
const MISSION_RESPONSES = {
  "mission-data": {
    title: "Mission Data Analysis",
    responses: [
      "Current mission status: Nominal. All systems functioning within parameters.",
      "Latest telemetry data shows successful orbital insertion.",
      "Mission objectives are 85% complete as of latest update.",
    ],
  },
  "distance-calc": {
    title: "Distance Calculation",
    responses: [
      "Current distance from Earth: 384,400 km",
      "Distance to nearest crater: 2.5 km",
      "Total distance traveled: 127.3 km",
    ],
  },
  "crater-depth": {
    title: "Crater Analysis",
    responses: [
      "Average crater depth in current region: 2.3 km",
      "Largest crater detected: 4.7 km diameter",
      "Surface composition: 68% regolith, 32% bedrock",
    ],
  },
};

class SpaceBot {
  constructor() {
    this.chatBox = document.querySelector(".chat-box");
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.currentTopic = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.querySelectorAll(".scientists-list li").forEach((item) => {
      item.addEventListener("click", (e) => this.handleTopicSelection(e));
      item.addEventListener(
        "touchstart",
        () => {
          item.style.transform = "scale(0.98)";
        },
        { passive: true }
      );
      item.addEventListener(
        "touchend",
        () => {
          item.style.transform = "";
        },
        { passive: true }
      );
    });

    this.sendBtn.addEventListener("click", () => this.handleMessageSend());
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleMessageSend();
    });
  }

  handleTopicSelection(e) {
    const listItem = e.target.closest("li[data-topic]");
    if (!listItem) return;

    const topic = listItem.getAttribute("data-topic");

    document.querySelectorAll(".scientists-list li").forEach((item) => {
      item.classList.remove("active");
    });

    listItem.classList.add("active");

    if (MISSION_RESPONSES[topic]) {
      this.currentTopic = topic;
      this.addMessage(
        `Switching to ${MISSION_RESPONSES[topic].title}...`,
        "bot"
      );

      setTimeout(() => {
        this.addMessage(MISSION_RESPONSES[topic].responses[0], "bot");
      }, 1000);
    }
  }

  handleMessageSend() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessage(message, "user");
    this.messageInput.value = "";
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      if (this.currentTopic) {
        const responses = MISSION_RESPONSES[this.currentTopic].responses;
        const response =
          responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(response, "bot");
      } else {
        this.addMessage("Please select a topic from the sidebar first.", "bot");
      }
    }, 1500);
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-timestamp">${timestamp}</div>
        `;

    messageDiv.style.opacity = "0";
    messageDiv.style.transform = "translateY(20px)";

    this.chatBox.appendChild(messageDiv);
    this.scrollToBottom();

    setTimeout(() => {
      messageDiv.style.transition = "all 0.3s ease";
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateY(0)";
    }, 50);
  }

  showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message bot typing-indicator";
    indicator.innerHTML = "SpaceBot is typing...";
    this.chatBox.appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.querySelector(".typing-indicator");
    if (indicator) indicator.remove();
  }

  scrollToBottom() {
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }
}

class EnhancedSpaceBot extends SpaceBot {
  constructor() {
    super();
    this.modelViewer = document.getElementById("modelViewer");
    this.voiceBtn = document.querySelector(".voice-btn");
    this.recognition = null;
    this.initializeVoiceRecognition();
    this.initializeThreeJS();
    this.setupNotifications();
    this.setupTextToSpeech();
  }

  initializeVoiceRecognition() {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.messageInput.value = transcript;
        this.handleMessageSend();
      };

      this.voiceBtn.addEventListener("click", () =>
        this.toggleVoiceRecognition()
      );
    }
  }

  toggleVoiceRecognition() {
    if (this.voiceBtn.classList.contains("active")) {
      this.recognition.stop();
      this.voiceBtn.classList.remove("active");
    } else {
      this.recognition.start();
      this.voiceBtn.classList.add("active");
    }
  }

  initializeThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(300, 300);
    this.modelViewer
      .querySelector(".model-container")
      .appendChild(renderer.domElement);

    // Add simple cube as placeholder
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();
  }

  setupNotifications() {
    const notificationPanel = document.querySelector(".notification-panel");

    const showNotification = (message) => {
      const notification = document.createElement("div");
      notification.className = "notification";
      notification.innerHTML = `
                <i class="fas fa-bell"></i>
                <span>${message}</span>
            `;

      notificationPanel.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    };

    // Example notification trigger
    setInterval(() => {
      const messages = [
        "New mission data available",
        "Oxygen levels optimal",
        "Weather update received",
      ];
      showNotification(messages[Math.floor(Math.random() * messages.length)]);
    }, 10000);
  }

  setupTextToSpeech() {
    this.speechEnabled = "speechSynthesis" in window;
    this.speaking = false;
  }

  speak(text) {
    if (!this.speechEnabled || this.speaking) return;

    this.speaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      this.speaking = false;
    };
    speechSynthesis.speak(utterance);
  }

  handleTopicSelection(e) {
    const topic = e.target.getAttribute("data-topic");
    if (!topic) return;

    // Remove active class from all items
    document.querySelectorAll(".scientists-list li").forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to selected item
    e.target.classList.add("active");

    const response = `Analyzing ${topic.replace(
      "-",
      " "
    )}. Not connected to backend yet.`;
    this.addMessage(response, "bot");
    this.speak(response);
  }

  handleMessageSend() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage(message, "user");
    this.messageInput.value = "";

    // Bot response
    setTimeout(() => {
      const response =
        "I understand your query, but I'm not connected to the backend yet.";
      this.addMessage(response, "bot");
      this.speak(response);
    }, 1000);
  }

  addMessage(text, sender) {
    super.addMessage(text, sender);

    // Text-to-speech for bot messages
    if (sender === "bot" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
}

class ConnectionManager {
  constructor() {
    this.authModal = document.getElementById("authModal");
    this.loginBtn = document.getElementById("loginBtn");
    this.agentId = document.getElementById("agentId");
    this.accessCode = document.getElementById("accessCode");
    this.connectionStatus = {
      isConnected: false,
      lastPing: null,
      retryCount: 0,
    };
    this.initializeListeners();
  }

  initializeListeners() {
    this.loginBtn.addEventListener("click", () => this.handleLogin());
    // Enter key support
    this.accessCode.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleLogin();
    });
  }

  async handleLogin() {
    const agentId = this.agentId.value.trim();
    const accessCode = this.accessCode.value.trim();

    if (!this.validateCredentials(agentId, accessCode)) {
      this.showError("Invalid credentials format");
      return;
    }

    this.showLoadingState();

    try {
      await this.establishConnection(agentId, accessCode);
      this.hideAuthModal();
      this.startConnectionMonitoring();
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  validateCredentials(agentId, accessCode) {
    return agentId.length >= 6 && accessCode.length >= 8;
  }

  showLoadingState() {
    this.loginBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Establishing Connection...';
    this.loginBtn.disabled = true;
  }

  async establishConnection(agentId, accessCode) {
    // Simulate connection attempt
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (agentId === "Atharva" && accessCode === "spacebot123") {
          this.connectionStatus.isConnected = true;
          resolve();
        } else {
          reject(new Error("Authentication failed"));
        }
      }, 2000);
    });
  }

  hideAuthModal() {
    this.authModal.style.opacity = "0";
    setTimeout(() => {
      this.authModal.style.display = "none";
    }, 300);
  }

  startConnectionMonitoring() {
    setInterval(() => this.checkConnection(), 5000);
  }

  async checkConnection() {
    try {
      const ping = await this.measurePing();
      this.updateConnectionUI(ping);
    } catch (error) {
      this.handleConnectionLoss();
    }
  }

  async measurePing() {
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
    return Math.floor(performance.now() - start);
  }

  updateConnectionUI(ping) {
    const pingElement = document.querySelector(".ping");
    const signalStrength = document.querySelector(".signal-strength");

    pingElement.textContent = `Ping: ${ping}ms`;

    if (ping < 100) {
      signalStrength.innerHTML = '<i class="fas fa-signal"></i>';
    } else if (ping < 300) {
      signalStrength.innerHTML =
        '<i class="fas fa-signal" style="opacity: 0.7"></i>';
    } else {
      signalStrength.innerHTML =
        '<i class="fas fa-signal" style="opacity: 0.4"></i>';
    }
  }

  handleConnectionError(error) {
    this.loginBtn.innerHTML = "Initialize Connection";
    this.loginBtn.disabled = false;

    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent = error.message;

    this.loginBtn.parentNode.insertBefore(
      errorMessage,
      this.loginBtn.nextSibling
    );

    setTimeout(() => errorMessage.remove(), 3000);
  }

  handleConnectionLoss() {
    this.connectionStatus.retryCount++;

    if (this.connectionStatus.retryCount > 3) {
      this.showReconnectModal();
    }
  }

  showReconnectModal() {
    this.authModal.style.display = "flex";
    this.authModal.style.opacity = "1";
    this.agentId.value = "";
    this.accessCode.value = "";
    this.loginBtn.innerHTML = "Reconnect";
    this.connectionStatus.retryCount = 0;
  }
}

// Initialize connection manager when document loads
document.addEventListener("DOMContentLoaded", () => {
  const spaceBot = new EnhancedSpaceBot();
  const connectionManager = new ConnectionManager();
  window.connectionManager = connectionManager; // Make it globally accessible

  // Theme toggle
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
  });

  const loadingOverlay = document.querySelector(".loading-overlay");
  setTimeout(() => {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => (loadingOverlay.style.display = "none"), 300);
  }, 2000);

  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light-theme");
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    localStorage.setItem(
      "theme",
      body.classList.contains("light-theme") ? "light" : "dark"
    );
  });

  const modelViewerBtn = document.querySelector(".model-viewer-btn");
  const modelViewer = document.getElementById("modelViewer");
  const closeViewer = document.querySelector(".close-viewer");

  modelViewerBtn.addEventListener("click", () => {
    modelViewer.classList.add("active");
  });

  closeViewer.addEventListener("click", () => {
    modelViewer.classList.remove("active");
  });

  const hamburger = document.querySelector('.hamburger-menu');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.menu-overlay');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Close sidebar on menu item click for mobile
  const menuItems = document.querySelectorAll('.scientists-list li');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }
    });
  });
});

// Enhanced notification system
function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-bell"></i>
    <span>${message}</span>
  `;

  const panel = document.querySelector('.notification-panel');
  panel.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

class ThemeManager {
  constructor() {
    this.themeToggle = document.querySelector(".theme-toggle");
    this.body = document.body;
    this.icon = this.themeToggle.querySelector("i");
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      this.body.classList.add("light-theme");
      this.icon.classList.replace("fa-moon", "fa-sun");
    }
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
  }

  toggleTheme() {
    this.body.classList.toggle("light-theme");
    const isLight = this.body.classList.contains("light-theme");

    // Update icon
    this.icon.classList.replace(
      isLight ? "fa-moon" : "fa-sun",
      isLight ? "fa-sun" : "fa-moon"
    );

    // Save preference
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});
