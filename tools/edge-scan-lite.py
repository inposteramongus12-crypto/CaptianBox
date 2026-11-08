# numpy + Pillow only (no scipy). Same idea as edge-scan.py: plates (navy #11142c) and cards (cream) must stay 60 px from the edge.
# Frames are rendered at half size, so the band is 30 px. Reports a side when a plate-coloured blob of >= 120 px reaches into the band.
import sys, glob, os
from PIL import Image
import numpy as np
M = 30
bad = 0
for fn in sorted(glob.glob(os.path.join(sys.argv[1], 'f*.png'))):
    im = np.asarray(Image.open(fn).convert('RGB')).astype(int)
    h, w, _ = im.shape
    def near(c, t=3): return (abs(im[..., 0] - c[0]) <= t) & (abs(im[..., 1] - c[1]) <= t) & (abs(im[..., 2] - c[2]) <= t)
    for name, mask in (('plate', near((17, 20, 44))), ('card', near((251, 248, 239)) | near((255, 246, 220)))):
        bands = {'left': mask[:, :M], 'right': mask[:, w - M:], 'top': mask[:M, :], 'bottom': mask[h - M:, :]}
        for side, b in bands.items():
            n = int(b.sum())
            if n < 120: continue
            ys, xs = np.nonzero(b)
            depth = {'left': M - xs.min(), 'right': xs.max() + 1, 'top': M - ys.min(), 'bottom': ys.max() + 1}[side]
            bad += 1
            print(os.path.basename(fn), name, side, f'{2*depth}px into the 60 px band ({n} px)')
print('edge issues:', bad)
