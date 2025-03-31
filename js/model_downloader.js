import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

// Create style element
const style = document.createElement("style");
style.textContent = `
.hal-fun-top-menu {
    box-sizing: border-box;
    white-space: nowrap;
    background: var(--content-bg);
    color: var(--content-fg);
    display: flex;
    flex-direction: column;
    min-width: 400px;
    max-width: 800px;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    box-shadow: rgb(0 0 0 / 20%) 0px 5px 5px -3px, 
                rgb(0 0 0 / 14%) 0px 8px 10px 1px, 
                rgb(0 0 0 / 12%) 0px 3px 14px 2px;
    max-height: 80vh;
    overflow-y: auto;
}

.hal-fun-top-menu * {
    box-sizing: inherit;
}

.hal-fun-downloader-container {
    display: flex;
    flex-direction: column;
}

.hal-fun-downloader-container h2 {
    margin: 0;
    padding: 8px 12px;
    color: var(--fg-color);
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
    text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
}

.model-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.model-item {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
}

.model-item:last-child {
    border-bottom: none;
}

.model-item:hover {
    background-color: var(--comfy-input-bg);
}

.model-item label {
    display: flex;
    align-items: center;
    gap: 0.6em;
    cursor: pointer;
    user-select: none;
    flex-grow: 1;
    width: 100%;
    text-align: start;
    padding: 8px 12px 8px 8px;
}

.model-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent-color);
}

.download-btn {
    background: none;
    color: var(--fg-color);
    border: 1px solid var(--border-color);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
    margin-left: 8px;
}

.download-btn:hover {
    background-color: var(--comfy-input-bg);
}

.download-status {
    padding: 8px 12px;
    border-top: 1px solid var(--border-color);
    color: var(--fg-color);
    font-size: 0.9rem;
    font-style: italic;
    text-align: center;
}

/* Animation */
.comfyui-popup.left {
    transform-origin: top right;
    animation: popup-left 0.2s ease-out;
}

@keyframes popup-left {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.model-controls {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.model-controls button {
    background: none;
    color: var(--fg-color);
    border: 1px solid var(--border-color);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
}

.model-controls button:hover {
    background-color: var(--comfy-input-bg);
}

.model-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.model-item .status-icon {
    margin-right: 8px;
    color: var(--error-color);
}

.model-item .status-icon.downloaded {
    color: var(--success-color);
}

.download-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.login-section {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.login-section .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.login-section input {
    flex-grow: 1;
    margin-right: 8px;
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--comfy-input-bg);
    color: var(--fg-color);
}

.login-section .token-link {
    color: var(--accent-color);
    text-decoration: underline;
    font-size: 0.8rem;
    text-align: center;
}

.login-section .token-link:hover {
    opacity: 0.8;
}

.login-section button {
    background: none;
    color: var(--fg-color);
    border: 1px solid var(--border-color);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;
}

.login-section button:hover {
    background-color: var(--comfy-input-bg);
}

.login-section button.logged-in {
    color: var(--success-color);
}

.license-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--content-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 20px;
    z-index: 1000;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.license-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.license-dialog h3 {
    margin: 0 0 16px 0;
    color: var(--fg-color);
}

.license-dialog p {
    margin: 0 0 16px 0;
    color: var(--fg-color);
    line-height: 1.5;
}

.license-dialog .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.license-dialog button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.license-dialog .cancel-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--fg-color);
}

.license-dialog .accept-btn {
    background: var(--accent-color);
    border: none;
    color: white;
}

.model-item .status-icon.gated {
    color: var(--warning-color);
}

.model-item .license-info {
    font-size: 0.8rem;
    color: var(--warning-color);
    margin-left: 8px;
    text-decoration: none;
}

.model-item .license-info:hover {
    text-decoration: underline;
}

.model-item .license-info.granted {
    color: var(--success-color);
}
`;

document.head.appendChild(style);

// Create a new extension
app.registerExtension({
  name: "hal.fun.model.downloader",
  async setup() {
    // Find the right menu group or create a new one
    const menuRight = document.querySelector(
      ".comfyui-menu-right .comfyui-button-group"
    );
    if (!menuRight) return;

    // Create the button
    const button = document.createElement("button");
    button.className = "comfyui-button";
    button.title = "Model Downloader";
    button.innerHTML = '<i class="mdi mdi-download"></i><span>Models</span>';

    // Create the panel
    const panel = document.createElement("div");
    panel.style.display = "none";
    panel.className = "comfy-menu-panel comfyui-popup hal-fun-top-menu";
    panel.style.position = "fixed";
    panel.style.top = "40px";
    panel.style.right = "10px";
    panel.innerHTML = `
            <div class="hal-fun-downloader-container">
                <h2>🦾 Hal.fun Model Downloader</h2>
                <div class="login-section">
                    <div class="input-group">
                        <input type="password" class="hf-token-input" placeholder="Hugging Face Token">
                        <button class="login-btn">Login</button>
                    </div>
                    <a href="https://huggingface.co/settings/tokens/new?tokenType=read" target="_blank" class="token-link">Get a read token from Hugging Face</a>
                    <div class="user-info hidden">
                        <span class="user-name"></span>
                        <button class="logout-btn">Logout</button>
                    </div>
                </div>
                <div class="model-controls">
                    <button class="select-all-btn">Select All</button>
                    <button class="download-selected-btn">Download Selected</button>
                </div>
                <menu class="model-list"></menu>
                <div class="download-status"></div>
            </div>
            <div class="license-dialog-overlay" style="display: none;"></div>
            <div class="license-dialog" style="display: none;">
                <h3>License Agreement Required</h3>
                <p>This model requires you to accept the following license agreement:</p>
                <p class="license-name"></p>
                <p>Please visit the model page to review and accept the license:</p>
                <p><a href="#" class="license-url" target="_blank">View License Agreement</a></p>
                <div class="buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="accept-btn">I Accept</button>
                </div>
            </div>
        `;
    document.body.appendChild(panel);

    // Toggle panel when clicking the button
    button.onclick = () => {
      if (panel.style.display === "none") {
        panel.style.display = "block";
        panel.classList.add("left", "open");
        button.classList.add("primary");
      } else {
        panel.style.display = "none";
        panel.classList.remove("left", "open");
        button.classList.remove("primary");
      }
    };

    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !panel.contains(e.target) &&
        !button.contains(e.target) &&
        panel.style.display === "block"
      ) {
        panel.style.display = "none";
        panel.classList.remove("left", "open");
        button.classList.remove("primary");
      }
    });

    // Add button to menu
    menuRight.appendChild(button);

    // Load model configurations
    async function loadModels() {
      try {
        const response = await api.fetchApi("/hal-fun-downloader/config");
        if (!response.ok) {
          throw new Error(
            `Config API error: ${response.status} ${response.statusText}`
          );
        }
        const config = await response.json();
        console.log("Loaded config:", config);

        const activeResponse = await api.fetchApi("/hal-fun-downloader/active");
        if (!activeResponse.ok) {
          throw new Error(
            `Active config API error: ${activeResponse.status} ${activeResponse.statusText}`
          );
        }
        const activeConfig = await activeResponse.json();
        console.log("Loaded active config:", activeConfig);

        const modelList = panel.querySelector(".model-list");
        if (!modelList) {
          throw new Error("Could not find .model-list element");
        }
        modelList.innerHTML = "";

        if (!Array.isArray(config) || config.length === 0) {
          modelList.innerHTML =
            '<li class="model-item">No models found in configuration</li>';
          return;
        }

        // Add event listeners for control buttons
        const selectAllBtn = panel.querySelector(".select-all-btn");
        const downloadSelectedBtn = panel.querySelector(
          ".download-selected-btn"
        );

        selectAllBtn.onclick = () => {
          const checkboxes = modelList.querySelectorAll(
            'input[type="checkbox"]'
          );
          const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
          checkboxes.forEach((cb) => {
            cb.checked = !allChecked;
            cb.dispatchEvent(new Event("change"));
          });
          selectAllBtn.textContent = allChecked ? "Select All" : "Deselect All";
        };

        downloadSelectedBtn.onclick = async () => {
          const selectedModels = Array.from(
            modelList.querySelectorAll('input[type="checkbox"]:checked')
          ).map((cb) => cb.dataset.modelName);

          if (selectedModels.length === 0) {
            const status = panel.querySelector(".download-status");
            status.textContent = "Please select models to download";
            return;
          }

          const status = panel.querySelector(".download-status");
          status.textContent = "Downloading selected models...";
          downloadSelectedBtn.disabled = true;

          try {
            for (const modelName of selectedModels) {
              if (!activeConfig.model_status[modelName]?.downloaded) {
                status.textContent = `Downloading ${modelName}...`;
                const response = await api.fetchApi(
                  "/hal-fun-downloader/download",
                  {
                    method: "POST",
                    body: JSON.stringify({ model_name: modelName }),
                  }
                );
                if (!response.ok)
                  throw new Error(`Failed to download ${modelName}`);
              }
            }
            status.textContent = "All selected models downloaded successfully";
            await loadModels(); // Refresh the list
          } catch (error) {
            console.error("Download error:", error);
            status.textContent = `Error: ${error.message}`;
          } finally {
            downloadSelectedBtn.disabled = false;
          }
        };

        // Create model items asynchronously
        for (const model of config) {
          if (!model || !model.local_path) {
            console.warn("Invalid model config:", model);
            continue;
          }

          const modelName = model.local_path.split("/").pop();
          const isEnabled =
            Array.isArray(activeConfig?.enabled_models) &&
            activeConfig.enabled_models.includes(modelName);
          const isDownloaded =
            activeConfig.model_status?.[modelName]?.downloaded;

          const modelItem = document.createElement("li");
          modelItem.className = "model-item";
          modelItem.innerHTML = `
                <label>
                    <input type="checkbox" data-model-name="${modelName}" ${
            isEnabled ? "checked" : ""
          }>
                    ${
                      isDownloaded
                        ? '<span class="status-icon downloaded">✓</span>'
                        : model.license?.required
                        ? '<span class="status-icon gated">🔒</span>'
                        : ""
                    }
                    ${modelName}
                    ${
                      model.license?.required
                        ? `<a href="${model.license.url}" target="_blank" class="license-info">(License Required)</a>`
                        : ""
                    }
                </label>
                <button class="download-btn" ${isDownloaded ? "disabled" : ""}>
                    ${isDownloaded ? "Downloaded" : "Download"}
                </button>
            `;

          // Check license status for models that require it
          if (model.license?.required) {
            const licenseInfo = modelItem.querySelector(".license-info");
            if (licenseInfo) {
              try {
                const response = await api.fetchApi(
                  "/hal-fun-downloader/check-license",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      repo_id: model.repo_id,
                      filename: model.filename,
                    }),
                  }
                );

                if (!response.ok) {
                  throw new Error(`License check failed: ${response.status}`);
                }

                const result = await response.json();
                if (result.accepted) {
                  licenseInfo.textContent = "(License Granted)";
                  licenseInfo.classList.add("granted");
                } else {
                  licenseInfo.textContent = "(License Required)";
                  licenseInfo.classList.remove("granted");
                }
              } catch (error) {
                console.error("License check error:", error);
                if (
                  error.message.includes("401") ||
                  error.message.includes("403")
                ) {
                  licenseInfo.textContent = "(Login Required)";
                  licenseInfo.classList.remove("granted");
                } else {
                  licenseInfo.textContent = "(License Required)";
                  licenseInfo.classList.remove("granted");
                }
              }
            }
          }

          const checkbox = modelItem.querySelector("input");
          checkbox.onchange = async () => {
            try {
              if (checkbox.checked) {
                activeConfig.enabled_models.push(modelName);
              } else {
                activeConfig.enabled_models =
                  activeConfig.enabled_models.filter((m) => m !== modelName);
              }
              const updateResponse = await api.fetchApi(
                "/hal-fun-downloader/active",
                {
                  method: "POST",
                  body: JSON.stringify(activeConfig),
                }
              );
              if (!updateResponse.ok) {
                throw new Error(
                  `Failed to update active config: ${updateResponse.status}`
                );
              }
            } catch (error) {
              console.error("Error updating model status:", error);
              checkbox.checked = !checkbox.checked; // Revert the checkbox
              const status = panel.querySelector(".download-status");
              status.textContent = `Error: ${error.message}`;
            }
          };

          const downloadBtn = modelItem.querySelector(".download-btn");
          downloadBtn.onclick = async () => {
            const status = panel.querySelector(".download-status");
            if (model.license?.required) {
              try {
                const response = await api.fetchApi(
                  "/hal-fun-downloader/check-license",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      repo_id: model.repo_id,
                      filename: model.filename,
                    }),
                  }
                );

                if (!response.ok) {
                  throw new Error(`License check failed: ${response.status}`);
                }

                const result = await response.json();
                if (!result.accepted) {
                  showLicenseDialog(model);
                  return;
                }
              } catch (error) {
                console.error("License check error:", error);
                status.textContent = `Error checking license: ${error.message}`;
                return;
              }
            }

            status.textContent = "Starting download...";
            downloadBtn.disabled = true;

            try {
              const response = await api.fetchApi(
                "/hal-fun-downloader/download",
                {
                  method: "POST",
                  body: JSON.stringify({ model_name: modelName }),
                }
              );
              if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
              }
              const result = await response.json();
              status.textContent = result.status;
              await loadModels(); // Refresh the list
            } catch (error) {
              console.error("Download error:", error);
              status.textContent = `Error: ${error.message}`;
            } finally {
              downloadBtn.disabled = false;
            }
          };

          modelList.appendChild(modelItem);
        }
      } catch (error) {
        console.error("Error loading models:", error);
        const modelList = panel.querySelector(".model-list");
        if (modelList) {
          modelList.innerHTML = `<li class="model-item">Error loading models: ${error.message}</li>`;
        }
        const status = panel.querySelector(".download-status");
        if (status) {
          status.textContent = `Error: ${error.message}`;
        }
      }
    }

    // Load models when the extension is initialized and when the panel is opened
    checkLoginStatus(); // Check login status on initialization
    loadModels();
    button.addEventListener("click", () => {
      if (panel.style.display === "none") {
        checkLoginStatus();
        loadModels(); // Refresh the list when opening the panel
      }
    });

    // Add login functionality
    async function checkLoginStatus() {
      try {
        const response = await api.fetchApi("/hal-fun-downloader/login-status");
        if (!response.ok)
          throw new Error(`Login status error: ${response.status}`);
        const data = await response.json();
        updateLoginUI(data.logged_in);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    }

    function updateLoginUI(isLoggedIn) {
      const loginBtn = panel.querySelector(".login-btn");
      const tokenInput = panel.querySelector(".hf-token-input");
      const tokenLink = panel.querySelector(".token-link");
      const inputGroup = panel.querySelector(".input-group");
      const userInfo = panel.querySelector(".user-info");
      const userName = panel.querySelector(".user-name");
      const logoutBtn = panel.querySelector(".logout-btn");

      if (isLoggedIn) {
        loginBtn.textContent = "Logged In";
        loginBtn.classList.add("logged-in");
        tokenInput.value = "";
        tokenInput.disabled = true;
        tokenLink.classList.add("hidden");
        inputGroup.style.display = "none";
        userInfo.classList.remove("hidden");
        userName.textContent = "Logged in to Hugging Face";
      } else {
        loginBtn.textContent = "Login";
        loginBtn.classList.remove("logged-in");
        tokenInput.disabled = false;
        tokenLink.classList.remove("hidden");
        inputGroup.style.display = "flex";
        userInfo.classList.add("hidden");
      }
    }

    // Add login button handler
    const loginBtn = panel.querySelector(".login-btn");
    loginBtn.onclick = async () => {
      const tokenInput = panel.querySelector(".hf-token-input");
      const token = tokenInput.value.trim();
      const status = panel.querySelector(".download-status");

      // If already logged in, handle logout
      if (loginBtn.classList.contains("logged-in")) {
        try {
          status.textContent = "Logging out...";
          const response = await api.fetchApi("/hal-fun-downloader/logout", {
            method: "POST",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Logout failed");
          }

          updateLoginUI(false);
          status.textContent = "Successfully logged out";

          // Refresh the model list to update download and license status
          await loadModels();
        } catch (error) {
          console.error("Logout error:", error);
          status.textContent = `Logout error: ${error.message}`;
        }
        return;
      }

      // Handle login
      if (!token) {
        status.textContent =
          "Please create a new read token at https://huggingface.co/settings/tokens/new?tokenType=read";
        return;
      }

      try {
        status.textContent = "Logging in...";
        const response = await api.fetchApi("/hal-fun-downloader/login", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Login failed");
        }

        updateLoginUI(true);
        status.textContent = "Successfully logged in";

        // Refresh the model list to update download and license status
        await loadModels();
      } catch (error) {
        console.error("Login error:", error);
        status.textContent = `Login error: ${error.message}`;
      }
    };

    // Add logout button handler
    const logoutBtn = panel.querySelector(".logout-btn");
    logoutBtn.onclick = async () => {
      const status = panel.querySelector(".download-status");
      try {
        status.textContent = "Logging out...";
        const response = await api.fetchApi("/hal-fun-downloader/logout", {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Logout failed");
        }

        updateLoginUI(false);
        status.textContent = "Successfully logged out";

        // Refresh the model list to update download and license status
        await loadModels();
      } catch (error) {
        console.error("Logout error:", error);
        status.textContent = `Logout error: ${error.message}`;
      }
    };

    // Add license dialog handling
    const licenseDialog = panel.querySelector(".license-dialog");
    const licenseOverlay = panel.querySelector(".license-dialog-overlay");
    const licenseUrl = panel.querySelector(".license-url");
    const licenseName = panel.querySelector(".license-name");
    const cancelBtn = panel.querySelector(".cancel-btn");
    const acceptBtn = panel.querySelector(".accept-btn");

    function showLicenseDialog(model) {
      licenseName.textContent = model.license.name;
      licenseUrl.href = model.license.url;
      licenseDialog.style.display = "block";
      licenseOverlay.style.display = "block";

      // Update accept button to check license status
      acceptBtn.onclick = async () => {
        try {
          const status = panel.querySelector(".download-status");
          status.textContent = "Checking license acceptance...";

          const response = await api.fetchApi(
            "/hal-fun-downloader/check-license",
            {
              method: "POST",
              body: JSON.stringify({
                repo_id: model.repo_id,
                filename: model.filename,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`License check failed: ${response.status}`);
          }

          const result = await response.json();
          if (result.accepted) {
            hideLicenseDialog();
            // Proceed with download
            downloadBtn.click();
          } else {
            status.textContent =
              "Please accept the license on Hugging Face first";
            window.open(licenseUrl.href, "_blank");
          }
        } catch (error) {
          console.error("License check error:", error);
          status.textContent = `Error checking license: ${error.message}`;
        }
      };
    }

    function hideLicenseDialog() {
      licenseDialog.style.display = "none";
      licenseOverlay.style.display = "none";
    }

    cancelBtn.onclick = hideLicenseDialog;
    acceptBtn.onclick = () => {
      hideLicenseDialog();
      // Open the license URL in a new tab
      window.open(licenseUrl.href, "_blank");
    };
  },
});
