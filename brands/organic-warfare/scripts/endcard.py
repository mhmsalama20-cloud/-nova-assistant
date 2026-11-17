"""End card renderer (V1): black tagline card + logo slam with light fire and embers.

Usage: python3 endcard.py TAG_DUR LOGO_DUR [FIRE_MP4] [OUT_MP4] [FIRE_BEHIND] [FIRE_AMBIENT]
V1 used:  python3 endcard.py 1.8 2.9333 <fire> endcard.mp4 0.8 0.5
Needs: pip install opencv-python-headless numpy pillow ; ffmpeg on PATH.
"""
import sys, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cv2
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "assets"

W, H, FPS = 1080, 1920, 30
TAG_DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 1.6
LOGO_DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
FIRE = sys.argv[3] if len(sys.argv) > 3 else str(ASSETS / 'vfx' / 'fire_embers_on_black_1080x1920.mp4')
OUT = sys.argv[4] if len(sys.argv) > 4 else 'endcard.mp4'
FONT = str(ASSETS / 'fonts' / 'cinzel-latin-600-normal.woff')

def ease_out(t):
    return 1 - (1 - t) ** 3

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

# ---------- tagline ----------
def tracked_text(draw_img, text, font, y, tracking, fill):
    d = ImageDraw.Draw(draw_img)
    widths = [font.getlength(c) for c in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = (W - total) / 2
    for c, w in zip(text, widths):
        d.text((x, y), c, font=font, fill=fill)
        x += w + tracking

font = ImageFont.truetype(FONT, 66)
tag = Image.new('RGBA', (W, H), (0, 0, 0, 0))
tracked_text(tag, "NATURE'S ARMY.", font, 860, 14, (238, 228, 208, 255))
tracked_text(tag, "YOUR ADVANTAGE.", font, 960, 14, (214, 172, 96, 255))
tag_np = np.asarray(tag).astype(np.float32) / 255.0

# ---------- logo ----------
logo = np.asarray(Image.open(ASSETS / 'logo' / 'logo_transparent_3746x2160.png')).astype(np.float32) / 255.0
lrgb, la = logo[..., :3], logo[..., 3]
# occlusion matte: filled version of alpha so fire does not shine through dark logo details
occ = cv2.morphologyEx((la > 0.3).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((41, 41), np.uint8))
occ = cv2.GaussianBlur(occ.astype(np.float32), (0, 0), 4)
occ = np.maximum(occ, la)
LOGO_W = 960
lh = int(logo.shape[0] * LOGO_W / logo.shape[1])
LOGO_CY = 900

def resize(a, w, h):
    return cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA if w < a.shape[1] else cv2.INTER_CUBIC)

# glow source (orange) from alpha
glow_base = cv2.GaussianBlur(resize(la, LOGO_W, lh), (0, 0), 28)

# ---------- fire element ----------
cap = cv2.VideoCapture(FIRE)
fire_frames = []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    fr = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
    fr = cv2.resize(fr, (W, H), interpolation=cv2.INTER_AREA)
    fire_frames.append(fr.astype(np.float32) / 255.0)
cap.release()
src_fps = 24 if len(fire_frames) < 130 else 30
print('fire frames', len(fire_frames), file=sys.stderr)

LOGO_BOTTOM = LOGO_CY + lh // 2
FIRE_BEHIND = float(sys.argv[5]) if len(sys.argv) > 5 else 0.55
FIRE_AMBIENT = float(sys.argv[6]) if len(sys.argv) > 6 else 0.5
FS = 0.55  # scale of the flame layer behind the logo
fw, fh = int(W * FS), int(H * FS)
fx0 = (W - fw) // 2
fy1 = LOGO_BOTTOM - 30            # flame base just inside the logo's lower edge
fy0 = fy1 - fh
yy_g = np.arange(H, dtype=np.float32)[:, None, None]
base_fade = np.clip((fy1 - yy_g) / 140.0, 0, 1)
xx_g = np.arange(W, dtype=np.float32)[None, :, None]
side_fade = np.clip(1 - np.abs(xx_g - W / 2) / (fw / 2), 0, 1) ** 0.6
embers_mask = np.clip((1080 - yy_g) / 220.0, 0, 1)  # keep only the embers (top part) of the element

def fire_at(t):
    if not fire_frames:
        return np.zeros((H, W, 3), np.float32)
    idx = int(t * src_fps) % len(fire_frames)
    f = np.clip((fire_frames[idx] - 0.06) / 0.94, 0, 1)
    small = cv2.resize(f, (fw, fh), interpolation=cv2.INTER_AREA)
    behind = np.zeros_like(f)
    sy0 = max(0, -fy0)
    behind[max(0, fy0):fy1, fx0:fx0 + fw] = small[sy0:]
    behind *= base_fade * side_fade
    return np.clip(behind * FIRE_BEHIND + f * embers_mask * FIRE_AMBIENT, 0, 1)

rng = np.random.default_rng(7)
shake = rng.normal(0, 1, (int(LOGO_DUR * FPS) + 2, 2))

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                       '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow',
                       '-crf', '14', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)

# tagline frames
n_tag = int(round(TAG_DUR * FPS))
for i in range(n_tag):
    t = i / FPS
    fade_in = ease_out(min(1, t / 0.45))
    fade_out = min(1, max(0, (TAG_DUR - t) / 0.18))
    a = fade_in * fade_out
    s = 1.045 - 0.045 * ease_out(min(1, t / TAG_DUR))
    tw, th = int(W * s), int(H * s)
    img = cv2.resize(tag_np, (tw, th), interpolation=cv2.INTER_CUBIC)
    x0, y0 = (tw - W) // 2, (th - H) // 2
    img = img[y0:y0 + H, x0:x0 + W]
    blur = (1 - fade_in) * 6
    if blur > 0.3:
        img = cv2.GaussianBlur(img, (0, 0), blur)
    frame = img[..., :3] * img[..., 3:4] * a
    ff.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())

# logo frames
n_logo = int(round(LOGO_DUR * FPS))
for i in range(n_logo):
    t = i / FPS
    # scale: slam from 1.4 -> 0.985 (5 frames) -> 1.0 (10 frames) then slow push to 1.05
    if i <= 5:
        s = 1.4 + (0.985 - 1.4) * ease_out(i / 5)
    elif i <= 11:
        s = 0.985 + 0.015 * ease_out((i - 5) / 6)
    else:
        s = 1.0 + 0.05 * ((t - 11 / FPS) / (LOGO_DUR - 11 / FPS))
    w2, h2 = int(LOGO_W * s), int(lh * s)
    rgb = resize(lrgb, w2, h2)
    a = resize(la, w2, h2)
    o = resize(occ, w2, h2)
    amp = 18 * math.exp(-i / 4.0) if i < 16 else 0
    dx, dy = int(shake[i, 0] * amp), int(shake[i, 1] * amp)
    cx, cy = W // 2 + dx, LOGO_CY + dy
    x0, y0 = cx - w2 // 2, cy - h2 // 2

    canvas_rgb = np.zeros((H, W, 3), np.float32)
    canvas_a = np.zeros((H, W), np.float32)
    canvas_o = np.zeros((H, W), np.float32)
    # paste with clipping
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    dx1, dy1 = min(W, x0 + w2), min(H, y0 + h2)
    sx1, sy1 = sx0 + (dx1 - dx0), sy0 + (dy1 - dy0)
    canvas_rgb[dy0:dy1, dx0:dx1] = rgb[sy0:sy1, sx0:sx1]
    canvas_a[dy0:dy1, dx0:dx1] = a[sy0:sy1, sx0:sx1]
    canvas_o[dy0:dy1, dx0:dx1] = o[sy0:sy1, sx0:sx1]

    # light sweep across the logo
    sweep_t = (t - 0.45) / 0.9
    sweep = np.zeros((H, W), np.float32)
    if 0 <= sweep_t <= 1:
        yy, xx = np.mgrid[0:H, 0:W]
        pos = -300 + sweep_t * (W + 600)
        d = (xx + (yy - LOGO_CY) * 0.45) - pos
        sweep = np.exp(-(d / 70.0) ** 2) * 0.55
    logo_px = canvas_rgb * (1 + sweep[..., None] * np.array([1.0, 0.9, 0.7]))

    # fire intensity: burst at slam, settle, gentle flicker
    burst = 1.0 + 0.6 * math.exp(-t / 0.35)
    flick = 0.85 + 0.15 * math.sin(t * 11) * math.sin(t * 7.3)
    fire = fire_at(t) * 0.9 * burst * flick

    # warm glow behind logo
    g = np.zeros((H, W), np.float32)
    gb = cv2.resize(glow_base, (w2, h2))
    g[dy0:dy1, dx0:dx1] = gb[sy0:sy1, sx0:sx1]
    glow = g[..., None] * np.array([1.0, 0.45, 0.1]) * (0.55 * burst * flick)

    bg = 1 - (1 - fire) * (1 - np.clip(glow, 0, 1))  # screen
    frame = logo_px * canvas_a[..., None] + bg * (1 - canvas_o[..., None])
    # embers in front of logo (subtle): screen a fraction of the fire over everything
    frame = 1 - (1 - frame) * (1 - fire * 0.25)
    # impact flash
    flash = 0.7 * math.exp(-i / 1.3)
    frame = frame + flash * np.array([1.0, 0.85, 0.6])
    # vignette
    if i == 0:
        yy, xx = np.mgrid[0:H, 0:W]
        vig = 1 - 0.45 * (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
        vig = np.clip(vig, 0.35, 1)[..., None].astype(np.float32)
    frame = frame * vig
    ff.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())

ff.stdin.close()
ff.wait()
print('done', OUT, file=sys.stderr)
