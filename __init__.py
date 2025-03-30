import os
import folder_paths
from .model_downloader_node import ModelDownloader

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.realpath(__file__)), "js")
NODE_CLASS_MAPPINGS = {
    "ModelDownloader": ModelDownloader
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "ModelDownloader": "Hal.fun Model Downloader"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY'] 