// Voiced stats of script.md by part: words, chars (running totals) and time estimate.
// Counts only "**N|HERO|TEMA|GRANDPA:** text" lines, same rules as count-script.mjs.
// Time: player estimate (src/kit/timing.ts): max(1.5 s, chars/15) + 0.35 s gap (0.25 s for HERO).
// Second column: slower pace ~13 chars/s (closer to calm ElevenLabs narration) for a sanity range.
//   node tools/script-stats.mjs [script.md]
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2] ?? 'script.md', 'utf8').split('\n');
const parts = [];
let cur = null;
for (const line of src) {
	const pm = line.match(/^## (\d+)\.\s*(.+)$/);
	if (pm) { cur = {n: +pm[1], name: pm[2], words: 0, chars: 0, t: 0, slow: 0, lines: 0}; parts.push(cur); continue; }
	const m = line.match(/^\*\*(N|HERO|TEMA|GRANDPA):\*\* (.+)$/);
	if (!m || !cur) continue;
	const t = m[2];
	const w = t.replace(/—/g, ' ').split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
	cur.words += w; cur.chars += t.length; cur.lines++;
	const gap = m[1] === 'N' ? 0.35 : 0.25;
	cur.t += Math.max(1.5, t.length / 15) + gap;
	cur.slow += Math.max(1.5, t.length / 13) + gap;
	if (w > (m[1] === 'N' ? 25 : 10)) console.log(`OVER ${m[1]} ${w}: ${t}`);
}
const mmss = (x) => { const s = Math.round(x); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
let W = 0, C = 0, T = 0, S = 0;
console.log('часть | реплик | слов | знаков | слов Σ | знаков Σ | время (15 зн/с) | начало–конец | при 13 зн/с');
for (const p of parts) {
	const a = T; W += p.words; C += p.chars; T += p.t; S += p.slow;
	console.log(`${p.n}. ${p.name} | ${p.lines} | ${p.words} | ${p.chars} | ${W} | ${C} | ${mmss(p.t)} | ${mmss(a)}–${mmss(T)} | до ${mmss(S)}`);
}
console.log(`ИТОГО: слов ${W}, знаков ${C}, время ${mmss(T)} (при 13 зн/с ${mmss(S)})`);
