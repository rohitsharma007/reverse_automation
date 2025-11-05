import os
import sys
import json
from typing import List

try:
    from PIL import Image
except Exception:
    Image = None

# Optional perceptual hash for reference-based matching
IMAGEHASH_AVAILABLE = False
try:
    import imagehash  # type: ignore
    IMAGEHASH_AVAILABLE = True
except Exception:
    IMAGEHASH_AVAILABLE = False


def is_logo_like(img_path: str) -> bool:
    """Heuristic: treat small images as logos/headers.
    - Small: width <= 220 and height <= 60 (tight bounds for header logos)
    - If PIL unavailable, return False
    """
    if Image is None:
        return False
    try:
        with Image.open(img_path) as im:
            im = im.convert("RGB")
            w, h = im.size
            if w <= 220 and h <= 60:
                return True
    except Exception:
        return False
    return False


def is_reference_match(img_path: str, ref_hashes: List[object]) -> bool:
    if not IMAGEHASH_AVAILABLE or not ref_hashes:
        return False
    try:
        with Image.open(img_path) as im:
            ah = imagehash.average_hash(im)
            for rh in ref_hashes:
                # Hamming distance threshold; keep simple/forgiving
                if ah - rh <= 6:
                    return True
    except Exception:
        return False
    return False


def load_refs(ref_paths: List[str]):
    if not IMAGEHASH_AVAILABLE or not ref_paths:
        return []
    hashes = []
    for p in ref_paths:
        try:
            with Image.open(p) as im:
                hashes.append(imagehash.average_hash(im))
        except Exception:
            pass
    return hashes


def filter_images(images_dir: str, context_path: str = None, ref_paths: List[str] = None):
    ref_paths = ref_paths or []
    context = {}
    if context_path and os.path.isfile(context_path):
        try:
            with open(context_path, "r", encoding="utf-8") as f:
                context = json.load(f)
        except Exception:
            context = {}

    ref_hashes = load_refs(ref_paths)
    files = [f for f in os.listdir(images_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

    removed = []
    for f in files:
        path = os.path.join(images_dir, f)
        # Filename hint
        name_hint = any(k in f.lower() for k in ["logo", "header", "footer"])  # coarse filter
        # Heuristic logo detection
        logo_like = is_logo_like(path)
        # Reference matching if provided
        ref_match = is_reference_match(path, ref_hashes)

        if name_hint or logo_like or ref_match:
            try:
                os.remove(path)
                removed.append(f)
                if f in context:
                    del context[f]
            except Exception:
                pass

    # Persist updated context if path was provided
    if context_path:
        try:
            os.makedirs(os.path.dirname(context_path), exist_ok=True)
            with open(context_path, "w", encoding="utf-8") as f:
                json.dump(context, f, indent=2)
        except Exception:
            pass

    return removed


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 filter_images.py <images_dir> <context_json_path> [--ref <logo_path> ...]")
        sys.exit(1)
    images_dir = sys.argv[1]
    context_path = sys.argv[2]
    ref_paths = []

    # Parse optional refs
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == "--ref" and i + 1 < len(sys.argv):
            ref_paths.append(sys.argv[i + 1])
            i += 2
        else:
            i += 1

    removed = filter_images(images_dir, context_path, ref_paths)
    print(f"Removed {len(removed)} images:")
    for f in removed:
        print(f"- {f}")


if __name__ == "__main__":
    main()