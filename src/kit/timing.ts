/* Pure timing logic, no React and no file access: used by the player (webpack) and by
   plan-report.ts (tools/check-plans, node). Formats of lines.json / timeline.json are the template's. */
export const FPS = 30;
export const LEAD = 6; // a shot starts a hair before its line
export type Line = {id: string; sp: string; t?: string; part?: number};
export type TLLine = {id: string; sp: string; text: string; file: string; trimStart: number; from: number; dur: number; env: number[]};
export type Timeline = {fps: number; total: number; lines: TLLine[]; estimated?: boolean};

/* until the voice exists: ~15 characters per second, same pauses as tools/prep-timeline.mjs */
export const estimate = (lines: Line[]): Timeline => {
	let frame = Math.round(0.4 * FPS);
	const out: TLLine[] = [];
	for (const l of lines) {
		const dur = Math.max(45, Math.round(((l.t ?? '').length / 15) * FPS));
		out.push({id: l.id, sp: l.sp, text: l.t ?? '', file: '', trimStart: 0, from: frame, dur, env: []});
		frame += dur + Math.round((l.sp === 'N' ? 0.35 : 0.25) * FPS);
	}
	return {fps: FPS, total: frame + 2 * FPS, lines: out, estimated: true};
};
/* real timeline if it covers every line, otherwise the estimate */
export const pickTimeline = (lines: Line[], tl?: Timeline | null): Timeline =>
	tl && lines.every((l) => tl.lines.some((x) => x.id === l.id)) ? {...tl, estimated: false} : estimate(lines);

export type ShotDef = {line: string; type: string; [k: string]: any};
export type TimedShot = ShotDef & {start: number; end: number};
export const timeShots = (shots: ShotDef[], tl: Timeline): TimedShot[] => {
	const found = shots.filter((s) => tl.lines.some((l) => l.id.startsWith(s.line)));
	const st = found.map((s, i) => (i === 0 ? 0 : tl.lines.find((l) => l.id.startsWith(s.line))!.from - LEAD));
	return found.map((s, i) => ({...s, start: st[i], end: i + 1 < found.length ? st[i + 1] : tl.total}));
};
