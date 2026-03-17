"""
TripoSRGenerator — adapter for TripoSR (VAST-AI-Research/TripoSR).
Target: mid-range PCs, ~6 GB VRAM.

TODO: implement load() and generate() when TripoSR support is added.
      Reference: https://github.com/VAST-AI-Research/TripoSR
"""
from pathlib import Path
from typing import Callable, Optional

from .base import BaseGenerator


class TripoSRGenerator(BaseGenerator):
    # outputs_dir is managed by BaseGenerator — no need to override __init__
    MODEL_ID     = "triposr"
    DISPLAY_NAME = "TripoSR"
    VRAM_GB      = 6

    def is_downloaded(self) -> bool:
        return self.model_dir.exists() and any(self.model_dir.iterdir())

    def load(self) -> None:
        raise NotImplementedError("TripoSR support not yet implemented.")

    def generate(
        self,
        image_bytes: bytes,
        params: dict,
        progress_cb: Optional[Callable[[int, str], None]] = None,
    ) -> Path:
        raise NotImplementedError("TripoSR support not yet implemented.")

    @classmethod
    def params_schema(cls) -> list:
        # TripoSR shares the same parameters as SF3D
        return [
            {
                "id":      "vertex_count",
                "label":   "Mesh Quality",
                "type":    "select",
                "default": 10000,
                "options": [
                    {"value": 5000,  "label": "Low (5k)"},
                    {"value": 10000, "label": "Medium (10k)"},
                    {"value": 20000, "label": "High (20k)"},
                ],
            },
            {
                "id":      "remesh",
                "label":   "Remesh",
                "type":    "select",
                "default": "quad",
                "options": [
                    {"value": "quad",     "label": "Quad"},
                    {"value": "triangle", "label": "Triangle"},
                    {"value": "none",     "label": "None"},
                ],
            },
        ]
