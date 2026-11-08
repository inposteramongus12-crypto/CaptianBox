// script.md -> src/story/shots.json: one shot per voiced line, built from the [...] frame note under it.
// Same line numbering as tools/build-lines.mjs (001, 002, ...). Bubbles (*Облачко*) get no shot.
// Pictures missing from public/hero keep their names and draw grey placeholders.
// Charts whose data cannot be read from the note are set in OVERRIDES (matched by a piece of the note).
//   node tools/script-shots.mjs [script.md]
import fs from 'node:fs';

const src = fs.readFileSync(process.argv[2] ?? 'script.md', 'utf8').split('\n');
const POSE = /\b((?:kachok|hero)_[a-z0-9_]+|guard_front|guard_stance_3q|stand_front_2|stand_front|side_2|side|back|helmet_closeup_calm|helmet_closeup|arms_crossed|present_hand_right|present_hand_belly|point_right|thinking|shrug|hands_up_claws|hand_on_head|facepalm|thumbs_up|punch_jab|punch_cross|turnaround_sheet_jpg)\b/g;
const KINDS = ['ImageShot', 'Split', 'Scale', 'BarChart', 'IconGrid', 'Steps', 'Counter', 'BigText'];
const quotes = (s) => [...s.matchAll(/«([^»]*)»/g)].map((m) => m[1]);
const colorOf = (s, def) => (/красн/.test(s) ? 'red' : /зелён/.test(s) ? 'green' : /оранж/.test(s) ? 'orange' : def);
const poses = (s) => [...s.matchAll(POSE)].map((m) => 'hero/' + m[1]);

/* charts whose numbers / tilt are not in the note text: key = a unique piece of the note */
const OVERRIDES = {
	'Scale: слева kachok_on_scale': {type: 'scale', data: {left: {label: 'качок', value: 100, color: 'red'}, right: {label: 'боксёр', value: 70, color: 'green'}, unit: 'кг'}},
	'Scale «раунд 1»': {type: 'scale', data: {title: 'Раунд 1', left: {label: 'качок', value: 2, text: 'ведёт', color: 'red'}, right: {label: 'боксёр', value: 1, text: '', color: 'green'}}},
	'Scale как в хуке': {type: 'scale', data: {left: {label: 'качок', value: 1, text: '100 кг', color: 'red'}, right: {label: 'боксёр', value: 2, text: '70 кг', color: 'green'}}},
	'Scale: «лёгкие» | «тяжёлые»': {type: 'scale', data: {left: {label: 'лёгкие', value: 1, text: '', color: 'green'}, right: {label: 'тяжёлые', value: 2, text: '', color: 'red'}}},
	'Scale: hero_on_scale «70 кг»': {type: 'scale', data: {left: {label: 'боксёр', value: 70, color: 'green'}, right: {label: 'тот же навык', value: 100, color: 'red'}, unit: 'кг'}},
	'Scale с гирьками': {type: 'scale', data: {title: 'Что объясняет силу удара', left: {label: 'масса', value: 1, text: '', color: 'orange'}, right: {label: 'рост, размах рук, другое', value: 3, text: '', color: 'green'}}},
	'BarChart «толщина волокна»': {type: 'bar', data: {title: 'Толщина волокна', unit: '%', bars: [{label: 'обычные', value: 100, color: 'green'}, {label: 'бодибилдеры', value: 188, color: 'red'}]}},
	'BarChart «сила на единицу толщины»': {type: 'bar', data: {title: 'Сила на единицу толщины', unit: '%', bars: [{label: 'обычные', value: 100, color: 'green'}, {label: 'бодибилдеры', value: 59, color: 'orange'}]}},
	'BarChart: «новички ≈2 400 Н»': {type: 'bar', data: {title: 'Прямой удар задней рукой', unit: 'Н', bars: [{label: 'новички', value: 2400, color: 'gray'}, {label: 'элита', value: 4800, color: 'green'}]}},
	'BarChart без чисел': {type: 'bar', data: {title: 'Сколько тела доходит до кулака', noValues: true, bars: [{label: 'качок · 1', value: 9, color: 'red'}, {label: '2', value: 6, color: 'red'}, {label: '3', value: 3, color: 'red'}, {label: 'боксёр · 1', value: 9, color: 'green'}, {label: '2', value: 9, color: 'green'}, {label: '3', value: 8.5, color: 'green'}]}},
	'Steps: три ступени «Раунд 1 · 2 · 3»': {type: 'steps', data: {steps: ['Раунд 1', 'Раунд 2', 'Раунд 3'], color: 'red'}},
	'Steps как в хуке': {type: 'steps', data: {steps: ['Раунд 1', 'Раунд 2', 'Раунд 3'], color: 'red'}},
	'Steps: три ступени-раунда': {type: 'steps', data: {steps: ['Раунд 1', 'Раунд 2', 'Раунд 3'], color: 'orange'}},
	'Counter 3:00 → 0:00': {counter: {from: 3, to: 0, at: 0.3, dur: 60, suffix: ' мин', label: 'раунд', color: 'orange', pos: 'right'}},
	'Counter 1:00 → 0:00': {counter: {from: 60, to: 0, at: 0.3, dur: 60, suffix: ' с', label: 'последняя минута', color: 'green', pos: 'right'}},
};

const shots = [];
let n = 0;
for (let i = 0; i < src.length; i++) {
	const m = src[i].match(/^\*\*(N|HERO|TEMA|GRANDPA):\*\* (.+)$/);
	if (!m) continue;
	n++;
	const note = [];
	for (let j = i + 1; j < src.length && src[j].startsWith('['); j++) note.push(src[j].replace(/^\[|\]$/g, ''));
	const t = note.join(' ');
	const line = String(n).padStart(3, '0');
	const shot = {line, type: 'text', note: t};
	const ov = Object.entries(OVERRIDES).find(([k]) => t.includes(k))?.[1] ?? {};
	const imgs = poses(t);

	// base: the component named first in the note
	const first = KINDS.map((k) => [k, t.indexOf(k)]).filter(([, p]) => p >= 0).sort((a, b) => a[1] - b[1])[0]?.[0];
	if (first === 'ImageShot' && imgs[0]) {
		Object.assign(shot, {type: 'image', img: imgs[0], effect: (t.match(/\b(push|pull|pan_left|pan_right)\b/) ?? [, 'push'])[1], pos: 'center', focus: [0.5, /ступн|ступням/.test(t) ? 0.85 : /руке|плечу/.test(t) ? 0.35 : 0.3]});
	} else if (first === 'Split') {
		const body = t.slice(t.indexOf('Split') + 5).split(/[;.]\s/)[0];
		const [a, b] = body.split('|');
		const half = (s, def) => ({img: poses(s ?? '')[0] ?? 'hero/stand_front', label: quotes(s ?? '')[0] ?? '', color: colorOf(s ?? '', def)});
		Object.assign(shot, {type: 'split', data: {a: half(a, 'red'), b: half(b, 'green')}});
	} else if (first === 'IconGrid') {
		const q = quotes(t.slice(t.indexOf('IconGrid')));
		const r = (q[0] ?? '').match(/правила (\d)\/4/);
		const cnt = +(t.match(/IconGrid:?\s*(\d+)/) ?? [, 0])[1];
		if (r) Object.assign(shot, {type: 'icons', img: 'hero/guard_front', data: {total: 4, hi: +r[1], cols: 4, num: `${r[1]}/4`, label: 'правила', color: 'green'}});
		else Object.assign(shot, {type: 'icons', img: 'hero/guard_front', data: {total: cnt || 4, hi: cnt || 0, cols: cnt > 12 ? 16 : Math.max(cnt, 1), num: cnt > 3 ? String(cnt) : undefined, label: q[0], color: 'green'}});
	} else if (first === 'Steps') {
		const q = quotes(t.slice(t.indexOf('Steps'))).find((x) => x.includes('→'));
		Object.assign(shot, {type: 'steps', img: imgs[0], data: {steps: (q ?? '').split('→').map((x) => x.trim()).filter(Boolean), color: colorOf(t, 'green')}});
	} else if (first === 'BigText' || first === 'Counter') {
		shot.type = 'text';
	}
	if (ov.type) { shot.type = ov.type; shot.data = ov.data; delete shot.img; delete shot.effect; delete shot.pos; delete shot.focus; if (ov.type === 'steps' && imgs[0]) shot.img = imgs[0]; }

	// overlays
	const bt = t.match(/BigText[^«]*«([^»]*)»([^.]*)/);
	if (bt && shot.type !== 'scale' && shot.type !== 'bar') {
		const lines = bt[1].split(' · ').length > 1 ? bt[1].split(' · ') : [bt[1]];
		shot.text = {lines, accent: colorOf(bt[2], 'orange'), pos: shot.type === 'image' ? 'bottom' : shot.type === 'text' ? 'center' : 'top', at: 0.3};
		if (shot.type === 'image') shot.pos = 'center';
	}
	const cn = t.match(/Counter (\d+)→(\d+) «([^»]*)»/);
	if (cn) shot.counter = {from: +cn[1], to: +cn[2], at: 0.3, dur: 45, suffix: ' %', label: cn[3].replace(/^%\s*/, ''), color: colorOf(t.slice(t.indexOf('Counter')), 'orange'), pos: shot.type === 'text' ? 'center' : 'right'};
	if (ov.counter) shot.counter = ov.counter;
	const co = t.match(/Callout[^«]*«([^»]*)»/);
	if (co && shot.type === 'image') {
		const low = /ступн|бёдр/.test(t);
		shot.callout = {from: [0.5, low ? 0.85 : 0.45], to: [0.72, low ? 0.72 : 0.25], text: co[1], at: 0.4, color: colorOf(t.slice(t.indexOf('Callout')), 'orange')};
	}
	const sl = t.match(/SlideIn[^«]*«([^»]*)»/);
	if (sl) shot.slide = {from: 'bottom', at: 0.4, text: {lines: [sl[1]], accent: 'orange', pos: 'bottom'}};
	const sc = t.match(/SourceCaption «([^»]*)»/);
	if (sc) shot.source = sc[1];

	// plates: «схема, не измерения» / «условно» / «вес групп не сравнивали» / «бедро, 32 человека» / «вывод, не измерение» / «одно исследование» / «образ»
	const badges = [];
	if (/схема, не измерения/.test(t) || /Подпись «схема»/.test(t)) badges.push('схема, не измерения');
	if (/условно/.test(t)) badges.push('условно');
	for (const b of ['вес групп не сравнивали', 'вывод, не измерение', 'одно исследование', 'образ'])
		if (new RegExp(`(Подпись|Плашка|подпись) «${b}»`).test(t) && !(shot.source ?? '').includes(b)) badges.push(b);
	if (/Подпись «бедро, 32 человека»/.test(t) && !(shot.source ?? '').includes('бедро')) badges.push('бедро, 32 человека');
	if (badges.length) shot.badges = badges;
	shots.push(shot);
}
fs.writeFileSync('src/story/shots.json', JSON.stringify(shots, null, 1) + '\n');
const missing = [...new Set(shots.flatMap((s) => [s.img, s.data?.a?.img, s.data?.b?.img]).filter(Boolean))].filter((x) => !fs.existsSync(`public/${x}.jpg`) && !fs.existsSync(`public/${x}.png`));
console.log(`shots ${shots.length}; types`, shots.reduce((a, s) => ((a[s.type] = (a[s.type] ?? 0) + 1), a), {}));
console.log(`badges: схема ${shots.filter((s) => s.badges?.includes('схема, не измерения')).length}, условно ${shots.filter((s) => s.badges?.includes('условно')).length}`);
console.log(`placeholders (${missing.length}): ${missing.join(', ')}`);
