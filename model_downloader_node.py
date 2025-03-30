import json
import os
from huggingface_hub import hf_hub_download
from server import PromptServer
import aiohttp
import asyncio
from pathlib import Path
from aiohttp import web
import logging
from server import PromptServer
from execution import PromptExecutor

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
        base_model_path = model_config.get('base_model_path', os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models'))
        
        # Prepend base_model_path to local_path if it's not an absolute path
        if not os.path.isabs(local_path):
            local_path = os.path.join(base_model_path, local_path)
        
        if os.path.exists(local_path):
            return f"File already exists at {local_path}"
        
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        try:
            # Use asyncio.to_thread to run the blocking hf_hub_download in a separate thread
            logger.info(f"Starting download of {filename} from {repo_id}")
            await asyncio.to_thread(
                hf_hub_download,
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
                    try:
                        # Create event loop if it doesn't exist
                        try:
                            loop = asyncio.get_event_loop()
                        except RuntimeError:
                            loop = asyncio.new_event_loop()
                            asyncio.set_event_loop(loop)
                        
                        # Run the download
                        status = loop.run_until_complete(self.download_model(model))
                        return (status,)
                    except Exception as e:
                        error_msg = f"Error downloading {model_name}: {str(e)}"
                        logger.error(error_msg, exc_info=True)
                        return (error_msg,)
            
            return (f"No matching models found for {model_name}",)

class DownloadModelNode:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "model_config": ("MODEL_CONFIG",),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "execute"
    CATEGORY = "model_downloader"
    OUTPUT_NODE = True

    def execute(self, model_config):
        try:
            logger.info(f"Starting download for model config: {model_config}")
            downloader = get_model_downloader()
            
            # Create event loop if it doesn't exist
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Run the download
            status = loop.run_until_complete(downloader.download_model(model_config))
            logger.info(f"Download completed with status: {status}")
            return (status,)
        except Exception as e:
            error_msg = f"Error in download node: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return (error_msg,)

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
    
    # Get active config and add download status
    active_config = downloader.active_config.copy()
    
    # Check if each enabled model is downloaded
    if not downloader.model_config_path.exists():
        logger.error("Model config file not found")
        return web.json_response({"error": "Model config file not found"}, status=500)
        
    with open(downloader.model_config_path, 'r') as f:
        config = json.load(f)
    
    # Add download status for each model
    model_status = {}
    for model in config:
        model_name = os.path.basename(model.get("local_path", ""))
        if model_name:
            model_status[model_name] = {
                "downloaded": os.path.exists(model["local_path"]),
                "path": model["local_path"]
            }
    
    active_config["model_status"] = model_status
    return web.json_response(active_config)

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
        logger.info(f"Received data: {data}")
        model_name = data.get("model_name")
        if not model_name:
            logger.error("No model_name provided in request")
            return web.json_response({"status": "Error: No model name provided"}, status=400)
        
        if not downloader.model_config_path.exists():
            logger.error(f"Model config file not found at {downloader.model_config_path}")
            return web.json_response({"status": f"Error: Model config file not found at {downloader.model_config_path}"}, status=500)
        
        with open(downloader.model_config_path, 'r') as f:
            config = json.load(f)
            logger.info(f"Loaded config: {config}")
        
        model_found = False
        for model in config:
            if model_name in model.get("local_path", ""):
                model_found = True
                logger.info(f"Found matching model: {model}")
                
                try:
                    # Run the download directly since we're already in an async context
                    status = await downloader.download_model(model)
                    logger.info(f"Download completed with status: {status}")
                    return web.json_response({"status": status})
                except Exception as e:
                    error_msg = f"Error downloading {model_name}: {str(e)}"
                    logger.error(error_msg, exc_info=True)
                    return web.json_response({"status": error_msg}, status=500)
        
        if not model_found:
            logger.error(f"No matching model found for {model_name}")
            return web.json_response({"status": f"No matching models found for {model_name}"}, status=404)
            
    except Exception as e:
        logger.error(f"Error in download endpoint: {str(e)}", exc_info=True)
        return web.json_response({"error": str(e)}, status=500)

# Register routes when the module is loaded
logger.info("=== Initializing hal.fun model downloader ===")

def register_routes(server):
    logger.info("Registering routes with server")
    server.routes.get("/hal-fun-downloader/config")(get_config)
    server.routes.get("/hal-fun-downloader/active")(get_active_config)
    server.routes.post("/hal-fun-downloader/active")(update_active_config)
    server.routes.post("/hal-fun-downloader/download")(download_model_handler)
    logger.info("Routes registered successfully")

# Wait for server to be ready
server = PromptServer.instance
if server:
    register_routes(server)
else:
    logger.warning("No server instance found, will register routes when server is ready")
    # Register a callback to be called when the server is ready
    PromptServer.instance = None
    def on_server_ready(server):
        register_routes(server)
    PromptServer.on_server_ready = on_server_ready

# A dictionary that contains all nodes you want to export with their names
NODE_CLASS_MAPPINGS = {
    "ModelDownloader": ModelDownloader,
    "DownloadModel": DownloadModelNode
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "ModelDownloader": "Hal.fun Model Downloader",
    "DownloadModel": "Download Model"
}

# Register the download function as a node
def register_download_node():
    logger.info("Registering download node")
    server = PromptServer.instance
    if server and hasattr(server, 'nodes'):
        server.nodes.register_node("download_model", DownloadModelNode)
        logger.info("Download node registered successfully")
    else:
        logger.warning("Could not register download node - server or nodes not ready")

# Wait for server to be ready and register the download node
server = PromptServer.instance
if server:
    register_download_node()
else:
    logger.warning("No server instance found, will register download node when server is ready")
    def on_server_ready(server):
        register_download_node()
    PromptServer.on_server_ready = on_server_ready 