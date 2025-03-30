import json
import os
from huggingface_hub import hf_hub_download
from server import PromptServer
import aiohttp
import asyncio
from pathlib import Path
from aiohttp import web
import logging

# Set up logging with a more visible format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("hal.fun.model.downloader")

# Create a global instance of ModelDownloader
model_downloader = None

def get_model_downloader():
    global model_downloader
    if model_downloader is None:
        model_downloader = ModelDownloader()
    return model_downloader

class ModelDownloader:
    """
    A node for managing and downloading models from Hugging Face
    """
    def __init__(self):
        self.config_dir = Path("user/default/hal.fun-downloader")
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.active_config_path = self.config_dir / "active_config.json"
        self.model_config_path = Path(__file__).parent / "model_config.json"
        
        # Load or create active configuration
        if self.active_config_path.exists():
            with open(self.active_config_path, 'r') as f:
                self.active_config = json.load(f)
        else:
            self.active_config = {"enabled_models": []}
            self._save_active_config()

    def _save_active_config(self):
        with open(self.active_config_path, 'w') as f:
            json.dump(self.active_config, f, indent=2)

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "action": (["check_downloads", "download_selected"],),
                "model_name": ("STRING", {"multiline": False}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "execute"
    CATEGORY = "model_downloader"

    async def download_model(self, model_config):
        repo_id = model_config['repo_id']
        subfolder = model_config['subfolder']
        filename = model_config['filename']
        local_path = model_config['local_path']
        
        if os.path.exists(local_path):
            return f"File already exists at {local_path}"
        
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        try:
            hf_hub_download(
                repo_id=repo_id,
                subfolder=subfolder,
                filename=filename,
                local_dir=os.path.dirname(local_path)
            )
            
            downloaded_path = os.path.join(os.path.dirname(local_path), subfolder, filename)
            if downloaded_path != local_path:
                os.rename(downloaded_path, local_path)
                
            return f"Successfully downloaded {filename} to {local_path}"
        except Exception as e:
            return f"Error downloading {filename}: {str(e)}"

    def execute(self, action, model_name):
        if action == "check_downloads":
            if not self.model_config_path.exists():
                return (f"Error: Model config file not found at {self.model_config_path}",)
            
            with open(self.model_config_path, 'r') as f:
                config = json.load(f)
            
            status = []
            for model in config:
                if model_name in model.get("local_path", ""):
                    if os.path.exists(model["local_path"]):
                        status.append(f"✓ {model_name} is downloaded")
                    else:
                        status.append(f"✗ {model_name} is not downloaded")
            
            return ("\n".join(status) if status else f"No matching models found for {model_name}",)
        
        elif action == "download_selected":
            if not self.model_config_path.exists():
                return (f"Error: Model config file not found at {self.model_config_path}",)
            
            with open(self.model_config_path, 'r') as f:
                config = json.load(f)
            
            for model in config:
                if model_name in model.get("local_path", ""):
                    asyncio.create_task(self.download_model(model))
                    return (f"Started download for {model_name}",)
            
            return (f"No matching models found for {model_name}",)

# API route handlers
async def get_config(request):
    logger.info(f"Config endpoint called: {request.path}")
    downloader = get_model_downloader()
    try:
        with open(downloader.model_config_path, 'r') as f:
            config = json.load(f)
        return web.json_response(config)
    except Exception as e:
        logger.error(f"Error in config endpoint: {str(e)}")
        return web.json_response({"error": str(e)}, status=500)

async def get_active_config(request):
    logger.info(f"Active config endpoint called: {request.path}")
    downloader = get_model_downloader()
    return web.json_response(downloader.active_config)

async def update_active_config(request):
    logger.info(f"Update active config endpoint called: {request.path}")
    downloader = get_model_downloader()
    try:
        data = await request.json()
        downloader.active_config = data
        downloader._save_active_config()
        return web.json_response({"status": "success"})
    except Exception as e:
        logger.error(f"Error in update active config: {str(e)}")
        return web.json_response({"error": str(e)}, status=500)

async def download_model_handler(request):
    logger.info(f"Download endpoint called: {request.path}")
    downloader = get_model_downloader()
    try:
        data = await request.json()
        model_name = data.get("model_name")
        if not model_name:
            return web.json_response({"status": "Error: No model name provided"}, status=400)
        
        with open(downloader.model_config_path, 'r') as f:
            config = json.load(f)
        
        for model in config:
            if model_name in model.get("local_path", ""):
                status = await downloader.download_model(model)
                return web.json_response({"status": status})
        
        return web.json_response({"status": f"No matching models found for {model_name}"}, status=404)
    except Exception as e:
        logger.error(f"Error in download endpoint: {str(e)}")
        return web.json_response({"error": str(e)}, status=500)

# Register routes when the module is loaded
logger.info("=== Initializing hal.fun model downloader ===")
server = PromptServer.instance
if server and hasattr(server, 'routes'):
    logger.info("Found server instance, adding routes")
    # Register routes without the /api prefix - the server will add it
    server.routes.get("/hal-fun-downloader/config")(get_config)
    server.routes.get("/hal-fun-downloader/active")(get_active_config)
    server.routes.post("/hal-fun-downloader/active")(update_active_config)
    server.routes.post("/hal-fun-downloader/download")(download_model_handler)
    logger.info("Routes registered successfully")
else:
    logger.warning("No server instance found, routes not registered")

# A dictionary that contains all nodes you want to export with their names
NODE_CLASS_MAPPINGS = {
    "ModelDownloader": ModelDownloader
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "ModelDownloader": "Hal.fun Model Downloader"
} 