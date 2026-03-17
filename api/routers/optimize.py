import os
import re
import shutil
import tempfile

import pymeshlab
import trimesh
import trimesh.visual
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.generator_registry import WORKSPACE_DIR

router = APIRouter(tags=["optimize"])


class OptimizeRequest(BaseModel):
    path: str        # format: "{collection}/{filename}"
    target_faces: int


@router.post("/mesh")
def optimize_mesh(body: OptimizeRequest):
    target_faces = max(100, min(500_000, body.target_faces))

    # Security: prevent path traversal
    input_path = (WORKSPACE_DIR / body.path).resolve()
    if not str(input_path).startswith(str(WORKSPACE_DIR.resolve())):
        raise HTTPException(400, "Invalid path")
    if not input_path.exists():
        raise HTTPException(404, f"File not found: {body.path}")

    tmp_dir = tempfile.mkdtemp()
    try:
        result = _decimate(str(input_path), target_faces, tmp_dir)
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    stem = input_path.stem
    output_name = f"{stem}_opt{target_faces}.glb"
    output_path = input_path.parent / output_name
    result.export(str(output_path))

    # Reconstruct the collection name from the path
    collection_name = body.path.split("/")[0]
    face_count = len(result.faces)
    return {"url": f"/workspace/{collection_name}/{output_name}", "face_count": face_count}


def _has_texture(geom: trimesh.Trimesh) -> bool:
    return (
        isinstance(geom.visual, trimesh.visual.TextureVisuals)
        and geom.visual.material is not None
        and getattr(geom.visual.material, "image", None) is not None
    )


def _decimate(input_path: str, target_faces: int, tmp_dir: str) -> trimesh.Trimesh:
    loaded = trimesh.load(input_path)
    if isinstance(loaded, trimesh.Scene):
        geoms = list(loaded.geometry.values())
        geom = trimesh.util.concatenate(geoms) if len(geoms) > 1 else geoms[0]
    else:
        geom = loaded

    ms = pymeshlab.MeshSet()

    if _has_texture(geom):
        # ── Textured path: OBJ intermediate to preserve UV coordinates ──────
        obj_in  = os.path.join(tmp_dir, "input.obj")
        mtl_in  = os.path.join(tmp_dir, "input.mtl")
        tex_in  = os.path.join(tmp_dir, "texture.png")
        obj_out = os.path.join(tmp_dir, "output.obj")

        # Save texture image under a known filename
        geom.visual.material.image.save(tex_in)

        # Export OBJ (trimesh writes UV coords + MTL)
        geom.export(obj_in)

        # Patch MTL so any map_Kd points to our known texture filename
        if os.path.exists(mtl_in):
            mtl = open(mtl_in).read()
            mtl = re.sub(r"map_Kd\s+\S+", "map_Kd texture.png", mtl)
            open(mtl_in, "w").write(mtl)

        ms.load_new_mesh(obj_in)
        ms.meshing_decimation_quadric_edge_collapse(
            targetfacenum=target_faces,
            preservetexcoord=True,   # ← keeps UV coordinates intact
            preservenormal=True,
            preservetopology=True,
            autoclean=True,
        )
        ms.save_current_mesh(obj_out)

        # Patch output MTL too, so trimesh can find the texture on load
        mtl_out = obj_out.replace(".obj", ".mtl")
        if os.path.exists(mtl_out):
            mtl = open(mtl_out).read()
            mtl = re.sub(r"map_Kd\s+\S+", "map_Kd texture.png", mtl)
            open(mtl_out, "w").write(mtl)

        return trimesh.load(obj_out)

    else:
        # ── Geometry-only path: PLY (fast, no texture to worry about) ────────
        ply_in  = os.path.join(tmp_dir, "input.ply")
        ply_out = os.path.join(tmp_dir, "output.ply")

        geom.export(ply_in)
        ms.load_new_mesh(ply_in)
        ms.meshing_decimation_quadric_edge_collapse(
            targetfacenum=target_faces,
            preservenormal=True,
            preservetopology=True,
            autoclean=True,
        )
        ms.save_current_mesh(ply_out)
        return trimesh.load(ply_out, force="mesh")
