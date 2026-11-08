// Lists pictures in public/hero and public/img with their size -> src/story/images.json
// ({"hero/stand_front": {"file": "hero/stand_front.jpg", "w": 848, "h": 1264}}). Run after adding pictures.
//   node tools/scan-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, ffbin, say} from './lib.mjs';

const out = {};
for (const dir of ['hero', 'img']) {
	const d = path.join(ROOT, 'public', dir);
	if (!fs.existsSync(d)) continue;
	for (const f of fs.readdirSync(d).sort()) {
		if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
		const [w, h] = execFileSync(ffbin('ffprobe'), ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(d, f)], {encoding: 'utf8'}).trim().split(',').map(Number);
		out[`${dir}/${f.replace(/\.[^.]+$/, '')}`] = {file: `${dir}/${f}`, w, h};
	}
}
fs.writeFileSync(path.join(ROOT, 'src', 'story', 'images.json'), JSON.stringify(out, null, 1) + '\n');
say(`images: ${Object.keys(out).length} -> src/story/images.json`);
