// Lists pictures in public/hero and public/img with their size -> src/story/images.json
// ({"hero/stand_front": {"file": "hero/stand_front.jpg", "w": 848, "h": 1264}}). Run after adding pictures.
//   node tools/scan-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// bounding box of the non-black content as fractions [x0, y0, x1, y1]: ImageShot uses it to keep the hero 60 px from the frame edge
const PY = `import sys\nfrom PIL import Image\nimport numpy as np\na = np.asarray(Image.open(sys.argv[1]).convert('RGB')).max(axis=2) > 28\nys, xs = np.nonzero(a)\nh, w = a.shape\nprint(round(xs.min()/w,4), round(ys.min()/h,4), round((xs.max()+1)/w,4), round((ys.max()+1)/h,4))`;
import {ROOT, ffbin, say} from './lib.mjs';

const out = {};
for (const dir of ['hero', 'img']) {
	const d = path.join(ROOT, 'public', dir);
	if (!fs.existsSync(d)) continue;
	for (const f of fs.readdirSync(d).sort()) {
		if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
		const [w, h] = execFileSync(ffbin('ffprobe'), ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(d, f)], {encoding: 'utf8'}).trim().split(',').map(Number);
		const box = execFileSync('python3', ['-I', '-c', PY, path.join(d, f)], {encoding: 'utf8'}).trim().split(' ').map(Number);
		out[`${dir}/${f.replace(/\.[^.]+$/, '')}`] = {file: `${dir}/${f}`, w, h, box};
	}
}
fs.writeFileSync(path.join(ROOT, 'src', 'story', 'images.json'), JSON.stringify(out, null, 1) + '\n');
say(`images: ${Object.keys(out).length} -> src/story/images.json`);
