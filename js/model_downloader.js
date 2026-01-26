import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import { $el } from "/scripts/ui.js";

// Create a new extension
app.registerExtension({
  name: "hal.fun.model.downloader",
  
  async setup() {
    // Register a dockable panel
    const panelId = "hal-fun-model-downloader";
    
    // Create panel content function
    const createPanelContent = () => {
      const container = $el("div.hal-fun-downloader-container", {
        style: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden"
        }
      }, [
        $el("h2", {
          style: {
            margin: "0",
            padding: "16px 20px",
            fontSize: "1.25rem",
            fontWeight: "600",
            borderBottom: "1px solid var(--border-color)"
          }
        }, "🦾 Model Downloader"),
        
        // Login section
        $el("div.login-section", {
          style: {
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }
        }, [
          $el("div.input-group", {
            style: {
              display: "flex",
              gap: "8px",
              alignItems: "center"
            }
          }, [
            $el("input.hf-token-input", {
              type: "password",
              placeholder: "Hugging Face Token",
              style: {
                flex: "1",
                padding: "8px 12px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                background: "var(--comfy-input-bg)",
                color: "var(--fg-color)"
              }
            }),
            $el("button.login-btn", {
              textContent: "Login",
              style: {
                padding: "8px 16px",
                background: "var(--accent-color)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }
            })
          ]),
          $el("div.token-note", {
            style: {
              fontSize: "0.85rem",
              color: "var(--fg-color)",
              textAlign: "center"
            }
          }, [
            "You need a Hugging Face token to download gated models. ",
            $el("a", {
              href: "https://huggingface.co/settings/tokens/new?tokenType=read",
              target: "_blank",
              textContent: "Get a read token",
              style: {
                color: "var(--accent-color)"
              }
            })
          ]),
          $el("div.user-info", {
            style: {
              display: "none",
              alignItems: "center",
              gap: "8px"
            }
          }, [
            $el("span.user-name", { textContent: "Logged in to Hugging Face" }),
            $el("button.logout-btn", {
              textContent: "Logout",
              style: {
                padding: "4px 12px",
                background: "var(--error-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }
            })
          ])
        ]),
        
        // Model controls
        $el("div.model-controls", {
          style: {
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            gap: "8px"
          }
        }, [
          $el("button.select-all-btn", {
            textContent: "Select All",
            style: {
              flex: "1",
              padding: "6px 12px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              background: "var(--comfy-input-bg)",
              cursor: "pointer"
            }
          }),
          $el("button.download-selected-btn", {
            textContent: "Download Selected",
            style: {
              flex: "1",
              padding: "6px 12px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              background: "var(--comfy-input-bg)",
              cursor: "pointer"
            }
          })
        ]),
        
        // Model list
        $el("div", {
          style: {
            flex: "1",
            overflow: "auto"
          }
        }, [
          $el("ul.model-list", {
            style: {
              listStyle: "none",
              padding: "0",
              margin: "0"
            }
          })
        ]),
        
        // Status
        $el("div.download-status", {
          style: {
            padding: "12px 20px",
            borderTop: "1px solid var(--border-color)",
            fontSize: "0.9rem",
            textAlign: "center"
          }
        })
      ]);

      // Initialize functionality
      setupPanelHandlers(container);
      
      return container;
    };

    // Register the panel with ComfyUI's panel system
    app.ui.registerPanel?.({
      id: panelId,
      title: "Model Downloader",
      icon: "download",
      location: "right",
      size: { width: 400 },
      render: createPanelContent
    });

    // Add button to the menu using the new ComfyUI button API
    try {
      const { ComfyButton } = await import("../../scripts/ui/components/button.js");
      const { ComfyButtonGroup } = await import("../../scripts/ui/components/buttonGroup.js");
      
      const modelDownloaderButton = new ComfyButton({
        icon: "download",
        action: () => {
          // Toggle the panel visibility
          if (app.ui.registerPanel) {
            // If using new panel system, try to open/focus the panel
            const panel = document.querySelector(`[data-panel-id="${panelId}"]`);
            if (panel) {
              panel.click();
            }
          } else {
            // Fallback to legacy behavior
            const panel = document.querySelector(".hal-fun-downloader-container")?.parentElement;
            if (panel) {
              panel.style.display = panel.style.display === "none" ? "flex" : "none";
            }
          }
        },
        tooltip: "Model Downloader - Download and manage Hugging Face models",
        content: "Models",
        classList: "comfyui-button comfyui-menu-mobile-collapse"
      });

      // Add to menu if settingsGroup exists (new style menu)
      if (app.menu?.settingsGroup) {
        const buttonGroup = new ComfyButtonGroup(modelDownloaderButton.element);
        app.menu.settingsGroup.element.before(buttonGroup.element);
        console.log('Model Downloader button added to menu');
      } else {
        console.warn('app.menu.settingsGroup not found');
      }
    } catch (exception) {
      console.error('Error creating Model Downloader button:', exception);
      // Fallback to legacy menu button
      createLegacyMenuButton(createPanelContent);
    }

    // Fallback for older ComfyUI versions without panel API
    if (!app.ui.registerPanel) {
      console.warn("Panel API not available, creating menu button fallback");
      createLegacyMenuButton(createPanelContent);
    }
  }
});

// Handler functions
function setupPanelHandlers(container) {
  const loginBtn = container.querySelector(".login-btn");
  const logoutBtn = container.querySelector(".logout-btn");
  const tokenInput = container.querySelector(".hf-token-input");
  const userInfo = container.querySelector(".user-info");
  const inputGroup = container.querySelector(".input-group");
  const tokenNote = container.querySelector(".token-note");
  const selectAllBtn = container.querySelector(".select-all-btn");
  const downloadSelectedBtn = container.querySelector(".download-selected-btn");
  const modelList = container.querySelector(".model-list");
  const status = container.querySelector(".download-status");

  // Check login status
  async function checkLoginStatus() {
    try {
      const response = await api.fetchApi("/hal-fun-downloader/login-status");
      if (!response.ok) throw new Error(`Login status error: ${response.status}`);
      const data = await response.json();
      updateLoginUI(data.logged_in);
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }

  function updateLoginUI(isLoggedIn) {
    if (isLoggedIn) {
      loginBtn.textContent = "Logged In";
      loginBtn.style.background = "var(--success-color)";
      tokenInput.disabled = true;
      inputGroup.style.display = "none";
      userInfo.style.display = "flex";
      tokenNote.style.display = "none";
    } else {
      loginBtn.textContent = "Login";
      loginBtn.style.background = "var(--accent-color)";
      tokenInput.disabled = false;
      inputGroup.style.display = "flex";
      userInfo.style.display = "none";
      tokenNote.style.display = "block";
    }
  }

  // Login handler
  loginBtn.onclick = async () => {
    const token = tokenInput.value.trim();
    if (!token) {
      status.textContent = "Please enter a Hugging Face token";
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
      await loadModels(container);
    } catch (error) {
      console.error("Login error:", error);
      status.textContent = `Login error: ${error.message}`;
    }
  };

  // Logout handler
  logoutBtn.onclick = async () => {
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
      await loadModels(container);
    } catch (error) {
      console.error("Logout error:", error);
      status.textContent = `Logout error: ${error.message}`;
    }
  };

  // Select all handler
  selectAllBtn.onclick = () => {
    const checkboxes = modelList.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
    checkboxes.forEach((cb) => {
      cb.checked = !allChecked;
      cb.dispatchEvent(new Event("change"));
    });
    selectAllBtn.textContent = allChecked ? "Select All" : "Deselect All";
  };

  // Download selected handler
  downloadSelectedBtn.onclick = async () => {
    const selectedModels = Array.from(
      modelList.querySelectorAll('input[type="checkbox"]:checked')
    ).map((cb) => cb.dataset.modelName);

    if (selectedModels.length === 0) {
      status.textContent = "Please select models to download";
      return;
    }

    status.textContent = "Downloading selected models...";
    downloadSelectedBtn.disabled = true;

    try {
      const response = await api.fetchApi("/hal-fun-downloader/download", {
        method: "POST",
        body: JSON.stringify({ model_names: selectedModels }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download models: ${response.status}`);
      }
      
      const result = await response.json();
      status.textContent = result.status;
      await loadModels(container);
    } catch (error) {
      console.error("Download error:", error);
      status.textContent = `Error: ${error.message}`;
    } finally {
      downloadSelectedBtn.disabled = false;
    }
  };

  // Load models initially
  checkLoginStatus();
  loadModels(container);
}

async function loadModels(container) {
  const modelList = container.querySelector(".model-list");
  const status = container.querySelector(".download-status");

  try {
    const [configResponse, activeResponse] = await Promise.all([
      api.fetchApi("/hal-fun-downloader/config"),
      api.fetchApi("/hal-fun-downloader/active")
    ]);

    if (!configResponse.ok || !activeResponse.ok) {
      throw new Error("Failed to load configuration");
    }

    const config = await configResponse.json();
    const activeConfig = await activeResponse.json();

    modelList.innerHTML = "";

    if (!Array.isArray(config) || config.length === 0) {
      modelList.innerHTML = '<li style="padding: 20px; text-align: center;">No models found</li>';
      return;
    }

    for (const model of config) {
      if (!model || !model.local_path) continue;

      const modelName = model.local_path.split("/").pop();
      const isEnabled = activeConfig?.enabled_models?.includes(modelName);
      const isDownloaded = activeConfig.model_status?.[modelName]?.downloaded;

      const modelItem = $el("li.model-item", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border-color)"
        }
      }, [
        $el("label", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: "1",
            cursor: "pointer"
          }
        }, [
          $el("input", {
            type: "checkbox",
            checked: isEnabled,
            dataset: { modelName },
            onchange: async (e) => {
              try {
                if (e.target.checked) {
                  activeConfig.enabled_models.push(modelName);
                } else {
                  activeConfig.enabled_models = activeConfig.enabled_models.filter(
                    (m) => m !== modelName
                  );
                }
                const updateResponse = await api.fetchApi("/hal-fun-downloader/active", {
                  method: "POST",
                  body: JSON.stringify(activeConfig),
                });
                if (!updateResponse.ok) throw new Error("Failed to update config");
              } catch (error) {
                console.error("Error updating model status:", error);
                e.target.checked = !e.target.checked;
                status.textContent = `Error: ${error.message}`;
              }
            }
          }),
          $el("span", {
            textContent: isDownloaded ? "✓ " : model.license?.required ? "🔒 " : ""
          }),
          $el("span", { textContent: modelName })
        ]),
        $el("button.download-btn", {
          textContent: isDownloaded ? "Downloaded" : "Download",
          disabled: isDownloaded,
          style: {
            padding: "4px 12px",
            border: "1px solid var(--border-color)",
            borderRadius: "4px",
            background: "var(--comfy-input-bg)",
            cursor: isDownloaded ? "not-allowed" : "pointer",
            opacity: isDownloaded ? "0.5" : "1"
          },
          onclick: async () => {
            status.textContent = "Starting download...";
            
            try {
              const response = await api.fetchApi("/hal-fun-downloader/download", {
                method: "POST",
                body: JSON.stringify({ model_name: modelName }),
              });
              
              if (!response.ok) throw new Error(`Download failed: ${response.status}`);
              
              const result = await response.json();
              status.textContent = result.status;
              await loadModels(container);
            } catch (error) {
              console.error("Download error:", error);
              status.textContent = `Error: ${error.message}`;
            }
          }
        })
      ]);

      modelList.appendChild(modelItem);
    }
  } catch (error) {
    console.error("Error loading models:", error);
    modelList.innerHTML = `<li style="padding: 20px; text-align: center; color: var(--error-color);">Error: ${error.message}</li>`;
    status.textContent = `Error: ${error.message}`;
  }
}

// Legacy fallback for older ComfyUI versions
function createLegacyMenuButton(createPanelContent) {
  const menuRight = document.querySelector(".comfyui-menu-right .comfyui-button-group");
  if (!menuRight) return;

  const button = document.createElement("button");
  button.className = "comfyui-button";
  button.title = "Model Downloader";
  button.innerHTML = '<i class="mdi mdi-download"></i><span>Models</span>';

  const panel = createPanelContent();
  panel.style.display = "none";
  panel.style.position = "fixed";
  panel.style.top = "60px";
  panel.style.right = "10px";
  panel.style.width = "400px";
  panel.style.maxHeight = "80vh";
  panel.style.background = "var(--comfy-menu-bg)";
  panel.style.border = "1px solid var(--border-color)";
  panel.style.borderRadius = "8px";
  panel.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  panel.style.zIndex = "1000";

  document.body.appendChild(panel);

  button.onclick = () => {
    panel.style.display = panel.style.display === "none" ? "flex" : "none";
  };

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !button.contains(e.target) && panel.style.display === "flex") {
      panel.style.display = "none";
    }
  });

  menuRight.appendChild(button);
}
