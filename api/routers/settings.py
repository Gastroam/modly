from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
from typing import Optional

import services.generator_registry as reg_module

router = APIRouter(prefix="/settings", tags=["settings"])


class PathsUpdate(BaseModel):
    models_dir:    Optional[str] = None
    workspace_dir: Optional[str] = None


@router.get("/paths")
async def get_paths():
    return {
        "models_dir":    str(reg_module.MODELS_DIR),
        "workspace_dir": str(reg_module.WORKSPACE_DIR),
    }


@router.post("/paths")
async def update_paths(body: PathsUpdate):
    reg_module.generator_registry.update_paths(
        models_dir    = Path(body.models_dir)    if body.models_dir    else None,
        workspace_dir = Path(body.workspace_dir) if body.workspace_dir else None,
    )
    return {
        "models_dir":    str(reg_module.MODELS_DIR),
        "workspace_dir": str(reg_module.WORKSPACE_DIR),
    }
