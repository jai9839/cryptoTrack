Generate presentation (CryptoTrack_Presentation.pptx)

Requirements
- Python 3.8+
- python-pptx and pillow

Install dependencies:

```bash
pip install python-pptx pillow
```

Run the generator from the project root:

```bash
python scripts/generate_presentation.py
```

Output: `CryptoTrack_Presentation.pptx` at the project root.

The script builds up to 20 slides using sections from `README.md` and images from the `images/` folder.
