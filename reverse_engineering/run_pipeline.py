import os
import sys
import subprocess


def sh(cmd: list, cwd: str = None):
    print("$", " ".join(cmd))
    subprocess.check_call(cmd, cwd=cwd)


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 run_pipeline.py --run <run_name> (--pdf <pdf_path> | --images <images_dir> [--context <context_json>])")
        sys.exit(1)

    run_name = None
    pdf_path = None
    images_dir = None
    context_json = None

    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--run" and i + 1 < len(sys.argv):
            run_name = sys.argv[i + 1]
            i += 2
        elif arg == "--pdf" and i + 1 < len(sys.argv):
            pdf_path = sys.argv[i + 1]
            i += 2
        elif arg == "--images" and i + 1 < len(sys.argv):
            images_dir = sys.argv[i + 1]
            i += 2
        elif arg == "--context" and i + 1 < len(sys.argv):
            context_json = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    if not run_name:
        print("Error: --run <run_name> is required")
        sys.exit(1)

    run_root = os.path.join("runs", run_name)
    ensure_dir(run_root)
    extracted_images_dir = os.path.join(run_root, "extracted_images")
    ensure_dir(extracted_images_dir)

    # Step 1: Get images + context
    if pdf_path:
        sh(["python3", "extract_images_from_pdf.py", pdf_path, extracted_images_dir, os.path.join(run_root, "image_context.json")])
    elif images_dir:
        # copy images into run folder to keep runs isolated
        import shutil
        for f in os.listdir(images_dir):
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                shutil.copy2(os.path.join(images_dir, f), os.path.join(extracted_images_dir, f))
        # context optional: if provided, copy
        if context_json and os.path.isfile(context_json):
            shutil.copy2(context_json, os.path.join(run_root, "image_context.json"))
        else:
            # create a minimal empty context
            with open(os.path.join(run_root, "image_context.json"), "w", encoding="utf-8") as f:
                f.write("{}")
    else:
        print("Error: provide either --pdf <path> or --images <dir>")
        sys.exit(1)

    # Step 2: Derive categories from PDF, if pdf provided; else reuse default
    categories_json = os.path.join(run_root, "categories.json")
    if pdf_path:
        sh(["python3", "derive_categories_from_pdf.py", pdf_path, run_root])
    else:
        # create default categories if none exist
        if not os.path.isfile(categories_json):
            with open(categories_json, "w", encoding="utf-8") as f:
                f.write("{}")

    # Step 3: Filter logos/headers
    sh(["python3", "filter_images.py", extracted_images_dir, os.path.join(run_root, "image_context.json")])

    # Step 4: Generate test cases
    test_cases_md = os.path.join(run_root, "test_cases.md")
    sh(["python3", "generate_test_cases.py", extracted_images_dir, test_cases_md, categories_json, os.path.join(run_root, "image_context.json"), "--consolidated"])

    print("\nRun complete:")
    print(f"- Run folder: {run_root}")
    print(f"- Test cases: {test_cases_md}")
    print(f"- Grouped: {os.path.join(run_root, 'grouped.json')}")
    print(f"- Consolidated: {os.path.splitext(test_cases_md)[0]}_consolidated.md")
    print(f"- Images: {extracted_images_dir}")


if __name__ == "__main__":
    main()