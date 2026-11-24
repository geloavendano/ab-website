"""Lighten a portrait's plain blue-grey backdrop toward near-white so it matches the other trustee photos.
Background = bluish (B clearly above R) and fairly bright, connected to the image border; edges feathered."""
import sys
from PIL import Image, ImageFilter, ImageDraw
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size
px = im.load()
mask = Image.new("L", (w, h), 0); m = mask.load()
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        if b - r > 14 and (r + g + b) / 3 > 115:
            m[x, y] = 255
# keep only regions touching the border (flood from edges on the candidate mask)
keep = Image.new("L", (w, h), 0); k = keep.load()
stack = [(x, 0) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
while stack:
    x, y = stack.pop()
    if 0 <= x < w and 0 <= y < h and m[x, y] and not k[x, y]:
        k[x, y] = 255
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
keep = keep.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(2.2))
white = Image.new("RGB", (w, h), (246, 247, 249))
Image.composite(white, im, keep).save(out, quality=90)
