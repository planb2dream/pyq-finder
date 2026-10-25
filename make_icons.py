"""Generates Android launcher icons into ./android-res (run by the GitHub workflow)."""
from PIL import Image, ImageDraw
import os
def grad(size):
    im = Image.new('RGB', (size, size)); px = im.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = (int(79 + (219 - 79) * t), int(70 + (39 - 70) * t), int(229 + (119 - 229) * t))
    return im
def glyph(d, S, k=1.0):
    w = max(2, int(S * 0.05 * k)); c = S / 2
    r = S * 0.17 * k; cx, cy = c - S * 0.04 * k, c - S * 0.04 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline='white', width=w)
    d.line([cx + r * .72, cy + r * .72, c + S * .2 * k, c + S * .2 * k], fill='white', width=w)
    d.line([cx - r * .45, cy, cx + r * .45, cy], fill='white', width=w)
    d.line([cx, cy - r * .45, cx, cy + r * .45], fill='white', width=w)
def mk(S, kind):
    if kind == 'fg':
        im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); glyph(ImageDraw.Draw(im), S, 0.62); return im
    im = grad(S).convert('RGBA'); glyph(ImageDraw.Draw(im), S, 1.0)
    m = Image.new('L', (S, S), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * .22) if kind == 'leg' else S // 2, fill=255)
    im.putalpha(m); return im
dens = {'mdpi': (48, 108), 'hdpi': (72, 162), 'xhdpi': (96, 216), 'xxhdpi': (144, 324), 'xxxhdpi': (192, 432)}
for n, (l, f) in dens.items():
    d = f'android-res/mipmap-{n}'; os.makedirs(d, exist_ok=True)
    mk(l * 4, 'leg').resize((l, l), Image.LANCZOS).save(f'{d}/ic_launcher.png')
    mk(l * 4, 'rnd').resize((l, l), Image.LANCZOS).save(f'{d}/ic_launcher_round.png')
    mk(f * 2, 'fg').resize((f, f), Image.LANCZOS).save(f'{d}/ic_launcher_foreground.png')
os.makedirs('android-res/values', exist_ok=True)
open('android-res/values/ic_launcher_background.xml', 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#4F46E5</color>\n</resources>\n')
print('icons ready')
