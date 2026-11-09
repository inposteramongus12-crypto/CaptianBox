"""public/hero/anchors.json: for each new pose, real points on the figure as fractions of the picture
(head, fist_front, hip, foot_front, foot_back, belly, shoulder) and a coarse silhouette grid
(rows of 0/1, 40 columns) that Callout uses to keep its plate off the hero.
Found from the figure mask (non-black pixels, holes closed). `facing` is the only hand-set hint:
R / L = the way the hero looks and punches (side and three-quarter poses), F = frontal.
   python3 tools/make-anchors.py
"""
import json, sys
import numpy as np
from PIL import Image

POSES = {  # name: facing
    'hero_cross_rotation_3q_back': 'R', 'hero_footwork_side': 'R', 'hero_breathing_calm': 'F', 'hero_slip': 'R', 'hero_heavy_bag': 'R',
    'kachok_wide_swing': 'R', 'kachok_arm_punch': 'R', 'kachok_hands_knees': 'R', 'kachok_gasping_low_guard': 'F', 'kachok_hit_reeling': 'L',
    'kachok_stand_front': 'F', 'kachok_flex_biceps': 'F', 'kachok_barbell': 'F', 'kachok_guard_clumsy': 'F', 'punch_cross': 'R', 'kachok_handshake': 'R',
}
GRID = 40
FIST_BAND = {'kachok_flex_biceps': (0.0, 0.2)}   # band of the figure height (fractions) where the front fist is looked for
MANUAL = {'kachok_barbell': {'fist_front': [0.765, 0.52]}}   # hand on the bar: the plates are wider than the hand, the mask rule would pick a plate

def dil(m, n=1):
    for _ in range(n):
        o = m.copy(); o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
        o[1:, 1:] |= m[:-1, :-1]; o[:-1, :-1] |= m[1:, 1:]; o[1:, :-1] |= m[:-1, 1:]; o[:-1, 1:] |= m[1:, :-1]
        m = o
    return m

def flood(cand):
    seed = np.zeros_like(cand); seed[0] = seed[-1] = True; seed[:, 0] = seed[:, -1] = True
    cur = seed & cand
    while True:
        n = cur
        for _ in range(8): n = dil(n) & cand
        if (n == cur).all(): return cur
        cur = n

def label(fg):
    H, W = fg.shape; lab = np.zeros((H, W), np.int32); n = 0
    for y0, x0 in zip(*np.nonzero(fg)):
        if lab[y0, x0]: continue
        n += 1; lab[y0, x0] = n; st = [(y0, x0)]
        while st:
            y, x = st.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and fg[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; st.append((yy, xx))
    return lab, n

def silhouette(a):
    g = a.sum(2) / 3
    m = g >= 14
    closed = dil(m, 5)
    outside = flood(~closed)
    s = ~outside                         # figure with holes (shorts, gaps) filled, grown by the 5 px closing
    # take the biggest part; erode the closing growth back
    for _ in range(5):
        s = ~dil(~s)
    return s & dil(m, 6)

def centroid(m):
    ys, xs = np.nonzero(m); return (xs.mean(), ys.mean()) if len(xs) else None

def anchors(name, facing):
    im = Image.open(f'public/hero/{name}.jpg').convert('RGB'); a = np.array(im).astype(int); H, W = a.shape[:2]
    S = silhouette(a)
    ys, xs = np.nonzero(S); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max(); fh = y1 - y0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    red = (r > 150) & (g < 90) & (b < 90); blue = (b > 140) & (r < 90)
    # head: helmet colour blob in the top quarter (hero red, kachok blue); bare head: the top cluster nearest the middle
    # head: the helmet (hero red, kachok blue): colour pixels in the top rows of that colour; bare head: the top cluster nearest the middle
    hm = None
    for col in (red, blue):
        c = col & S & (np.arange(H)[:, None] < y0 + fh * 0.30)
        if c.sum() > 200:
            cy = np.nonzero(c.any(1))[0].min(); hm = c & (np.arange(H)[:, None] < cy + fh * 0.09); break
    if hm is not None: head = centroid(hm)
    else:
        band = S & (np.arange(H)[:, None] < y0 + fh * 0.12)
        cols = np.nonzero(band.any(0))[0]
        cl = np.split(cols, np.nonzero(np.diff(cols) > 6)[0] + 1)
        cx = x0 + (x1 - x0) / 2
        best = min(cl, key=lambda c: abs(c.mean() - cx)); sub = band[:, best.min():best.max() + 1]
        yy, xx = np.nonzero(sub); head = (best.min() + xx.mean(), yy.mean() + (yy.max() - yy.min()) * 0.3)
    hy = head[1]
    # belt / hip: red pixels between 30 % and 72 % of the figure height (waistband and shorts trim), bottom-most dense row of the upper group
    mid = np.zeros_like(S); mid[int(y0 + fh * 0.30):int(y0 + fh * 0.72)] = True
    rm = red & mid & S
    if rm.sum() > 100:
        ryy, rxx = np.nonzero(rm); belt_y = np.percentile(ryy, 20); hip_x = np.median(rxx[ryy < belt_y + fh * 0.06])
    else:
        belt_y = y0 + fh * 0.5; hip_x = centroid(S & mid)[0]
    # no clear red belt (kachok: dark waistband, red only on the hem; old pictures): the top of the shorts = where the grey body turns dark
    if rm.sum() <= 100 or name.startswith('kachok') or name == 'punch_cross':
        mrow = S & mid; cxm = centroid(mrow)[0]; gg = a.sum(2) / 3
        band = slice(int(cxm - W * 0.08), int(cxm + W * 0.08)); found = None
        for y in range(int(y0 + fh * 0.30), int(y0 + fh * 0.72) - 3):
            if all(np.median(gg[y + d, band][S[y + d, band]]) < 48 if S[y + d, band].any() else False for d in range(4)):
                found = y; break
        if found is not None: belt_y = found + fh * 0.01; hip_x = cxm
    hip = (hip_x, belt_y + fh * 0.07)
    belly = (hip_x, belt_y - fh * 0.07)
    # feet: lowest 12 % of the figure, clusters by column
    fb = S & (np.arange(H)[:, None] > y1 - fh * 0.12)
    cols = np.nonzero(fb.any(0))[0]; cl = np.split(cols, np.nonzero(np.diff(cols) > 10)[0] + 1)
    feet = []
    for c in cl:
        sub = fb[:, c.min():c.max() + 1]; yy, xx = np.nonzero(sub); feet.append((c.min() + xx.mean(), yy.mean()))
    if len(feet) == 1: feet = [feet[0], feet[0]]
    feet.sort(key=lambda p: p[0])
    if facing == 'L': foot_front, foot_back = feet[0], feet[-1]
    else: foot_front, foot_back = feet[-1], feet[0]
    # front fist: kachok = the blue glove (helmet left out) that is furthest in the facing direction; others = the extreme point of
    # the upper body (the brown heavy bag is not part of the hero)
    fist = None
    if blue.sum() > 400 and hm is not None and (blue & hm).sum() > 0:
        bl = blue & S; lab, n = label(bl)
        comps = [(lab == i) for i in range(1, n + 1) if (lab == i).sum() > 150]
        comps = [c for c in comps if not (c & hm).any()]
        if comps:
            cs = [centroid(c) for c in comps]
            fist = min(cs, key=lambda p: p[0]) if facing == 'L' else max(cs, key=lambda p: p[0])
    if fist is None:
        tan = dil((r > 110) & (g > 80) & (b < 110) & (r - b > 40) & (g > 70), 14)   # the brown bag, with its outline
        lo, hi = FIST_BAND.get(name, (None, None))
        ub = np.zeros_like(S)
        if lo is None: ub[int(hy - fh * 0.02):int(y0 + fh * 0.62)] = True
        else: ub[int(y0 + fh * lo):int(y0 + fh * hi)] = True
        sub = S & ub & ~tan; yy, xx = np.nonzero(sub)
        if facing == 'L': ext = xx.min(); near = xx < ext + W * 0.05
        else: ext = xx.max(); near = xx > ext - W * 0.05
        fist = (xx[near].mean(), yy[near].mean())
    # shoulder: just under the head, towards the back arm side
    sh = (head[0] - (0.0 if facing == 'F' else (1 if facing == 'R' else -1) * fh * 0.02), hy + fh * 0.12)
    # hip at the outline: where the silhouette ends on the row of the hip, in the facing direction (front) and behind (back), 8 px inside
    rows = S[int(hip[1]) - 3:int(hip[1]) + 4].any(0); cols_h = np.nonzero(rows)[0]
    inset = W * 0.012
    right_edge, left_edge = (cols_h.max() - inset, cols_h.min() + inset)
    hip_front, hip_back = ((left_edge, hip[1]), (right_edge, hip[1])) if facing == 'L' else ((right_edge, hip[1]), (left_edge, hip[1]))
    pts = {'hip_front': hip_front, 'hip_back': hip_back, 'head': head, 'fist_front': fist, 'hip': hip, 'foot_front': foot_front, 'foot_back': foot_back, 'belly': belly, 'shoulder': sh}
    out = {k: [round(float(v[0]) / W, 4), round(float(v[1]) / H, 4)] for k, v in pts.items()}
    out.update(MANUAL.get(name, {}))
    gh = round(GRID * H / W)
    cell = S[:gh * (H // gh), :GRID * (W // GRID)].reshape(gh, H // gh, GRID, W // GRID).mean((1, 3)) if False else None
    ch, cw = H / gh, W / GRID
    rows = []
    for j in range(gh):
        rows.append(''.join('1' if S[int(j * ch):int((j + 1) * ch), int(i * cw):int((i + 1) * cw)].mean() > 0.12 else '0' for i in range(GRID)))
    out['mask'] = rows
    return out, S

if __name__ == '__main__':
    res = {}
    for n, f in POSES.items():
        res['hero/' + n], S = anchors(n, f)
        Image.fromarray((S * 255).astype(np.uint8)).save(f'/tmp/claude-0/-home-user/2f033bd3-6f7e-545b-bca2-c276b26e8525/scratchpad/work/sil_{n}.png')
    json.dump(res, open('public/hero/anchors.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(len(res), 'poses')
