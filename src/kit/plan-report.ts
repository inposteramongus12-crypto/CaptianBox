/* Used by tools/check-plans.mjs (bundled for node): length of every shot. Not part of the video. */
import fs from 'node:fs';
import path from 'node:path';
import {Line, ShotDef, Timeline, pickTimeline, timeShots, withPauses} from './timing';

const rd = (n: string) => {
	const p = path.join(process.cwd(), 'src', 'story', n);
	return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};
export const report = () => {
	const lines = rd('lines.json') as Line[];
	const defs = rd('shots.json') as ShotDef[];
	const tl = withPauses(defs, pickTimeline(lines, rd('timeline.json') as Timeline | null));
	const shots = timeShots(defs, tl);
	const plans = shots.map((s, i) => ({shot: i + 1, at: s.line, start: s.start, len: s.end - s.start, own: false}));
	return {plans, whips: [] as number[], counter: [] as any[], short: [] as any[], mode: 'long', estimated: !!tl.estimated};
};
