import os
import json
import sys
import fitz  # PyMuPDF


def extract_images(pdf_path: str, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    image_entries = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_text = page.get_text("text") or ""
        # Enumerate images on the page
        img_list = page.get_images(full=True)
        if not img_list:
            continue
        for img_idx, img in enumerate(img_list):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            # Convert CMYK or alpha-containing pixmaps to RGB
            if pix.n - pix.alpha > 4:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            filename = f"page-{page_index+1:03d}-img-{img_idx+1:02d}.png"
            out_path = os.path.join(out_dir, filename)
            pix.save(out_path)
            pix = None
            image_entries.append({
                "file": filename,
                "path": out_path,
                "page": page_index + 1,
                "page_text": page_text,
            })

    return image_entries


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract_images_from_pdf.py <pdf_path> [images_out_dir] [context_out_json]")
        sys.exit(1)
    pdf_path = sys.argv[1]
    images_out_dir = sys.argv[2] if len(sys.argv) >= 3 else os.path.join("output", "extracted_images")
    context_out_json = sys.argv[3] if len(sys.argv) >= 4 else os.path.join("output", "image_context.json")

    entries = extract_images(pdf_path, images_out_dir)
    os.makedirs(os.path.dirname(context_out_json), exist_ok=True)
    with open(context_out_json, "w", encoding="utf-8") as f:
        json.dump({e["file"]: {"page": e["page"], "page_text": e["page_text"]} for e in entries}, f, indent=2)

    print(f"Extracted {len(entries)} images to {images_out_dir}")
    print(f"Saved image context to {context_out_json}")


if __name__ == "__main__":
    main()