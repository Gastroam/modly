"""
InstantMeshGenerator — adapter for InstantMesh (TencentARC/InstantMesh).
Target: mid-range/high-end PCs, ~16 GB VRAM.
Pipeline: image → Zero123++ (multi-view) → reconstruction → GLB

TODO: implement load() and generate() when InstantMesh support is added.
      Reference: https://github.com/TencentARC/InstantMesh
"""
from pathlib import Path
from typing import Callable, Optional

from .base import BaseGenerator


class InstantMeshGenerator(BaseGenerator):
    MODEL_ID     = "instantmesh"
    DISPLAY_NAME = "InstantMesh"
    VRAM_GB      = 16

    def is_downloaded(self) -> bool:
        return self.model_dir.exists() and any(self.model_dir.iterdir())

    def load(self) -> None:
        raise NotImplementedError("InstantMesh support not yet implemented.")

    def generate(
        self,
        image_bytes: bytes,
        params: dict,
        progress_cb: Optional[Callable[[int, str], None]] = None,
    ) -> Path:
        raise NotImplementedError("InstantMesh support not yet implemented.")

    @classmethod
    def params_schema(cls) -> list:
        return [
            {
                "id":      "num_views",
                "label":   "Number of Views",
                "type":    "select",
                "default": 6,
                "options": [
                    {"value": 4, "label": "4 views (faster)"},
                    {"value": 6, "label": "6 views (better)"},
                ],
            },
            {
                "id":      "num_inference_steps",
                "label":   "Inference Steps",
                "type":    "select",
                "default": 75,
                "options": [
                    {"value": 30,  "label": "Fast (30 steps)"},
                    {"value": 75,  "label": "Balanced (75 steps)"},
                ],
            },
        ]
