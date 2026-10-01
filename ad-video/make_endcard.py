#!/usr/bin/env python3
"""Render the end card (brand name + tagline) as a PNG with ffmpeg, for stitch.py --endcard."""
import argparse
import json
import pathlib
import subprocess
import tempfile
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
SIZES = {'9:16': (1080, 1920), '16:9': (1920, 1080), '1:1': (1080, 1080), '4:5': (1080, 1350)}
FONTS = {  # Google Fonts, SIL Open Font License
    'title': 'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcaRyjDg.ttf',
    # Must include Arabic presentation forms (U+FE70-FEFF): older ffmpeg drawtext shapes into them.
    'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v15/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPO_9CT.ttf',
    'tagline': 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf',
}


def font(name):
    path = HERE / 'output' / 'fonts' / f'{name}.ttf'
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(FONTS[name], path)
    return path


def main():
    cfg = json.loads((HERE / 'shots.json').read_text(encoding='utf-8'))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--title', default=cfg['product_name'])
    parser.add_argument('--arabic', default='كوزي', help='name in Arabic script, "" to hide')
    parser.add_argument('--tagline', default="we're a little close, a lot cozy.")
    parser.add_argument('--out', type=pathlib.Path, default=HERE / 'endcard.png')
    args = parser.parse_args()

    width, height = SIZES[cfg['aspect_ratio']]
    scale = min(width, height) / 1080
    lines = [  # (text, font, size, color, y offset from centre)
        (args.title, 'title', 220, '0x5B4636', -150),
        (args.arabic, 'arabic', 92, '0x8A7360', 40),
        (args.tagline, 'tagline', 50, '0x6E5A4A', 190),
    ]
    with tempfile.TemporaryDirectory() as tmp:
        filters = []
        for i, (text, name, size, color, dy) in enumerate(lines):
            if not text:
                continue
            textfile = pathlib.Path(tmp) / f'{i}.txt'
            textfile.write_text(text, encoding='utf-8')
            filters.append(
                f"drawtext=fontfile='{font(name)}':textfile='{textfile}':fontsize={round(size * scale)}:"
                f"fontcolor={color}:x=(w-text_w)/2:y=(h-text_h)/2+{round(dy * scale)}"
            )
        subprocess.run(
            ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi',
             '-i', f'color=c=0xF3EDE3:s={width}x{height}', '-frames:v', '1',
             '-vf', ','.join(filters), str(args.out)],
            check=True,
        )
    print(f'Wrote {args.out}')


if __name__ == '__main__':
    main()
