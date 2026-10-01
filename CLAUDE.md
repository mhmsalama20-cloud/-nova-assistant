# Nova Assistant

## Higgsfield image generation
To generate an image, run:

    python tools/hf.py <model-path> "<prompt>"

- Default model: `higgsfield-ai/soul/v2/standard`
- Requires `pip install higgsfield-client` and env var `HF_KEY="<key_id>:<key_secret>"` (never commit the key).
- The script prints the resulting image URL; show it to the user.
