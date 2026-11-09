import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BarChart, IconGrid, Scale, Split, Steps} from './charts';
import {ImageShot} from './media';
import {BigText, Board, Bubble, Callout, Counter, SlideIn, SourceCaption} from './text';
import {FPS, TimedShot} from './timing';
import {Plate, SAFE, clampX} from './theme';

const fr = (s?: number) => Math.round((s ?? 0) * FPS);

/* rough width of a plate with text: chars * size * 0.6 + padding */
const pw = (t: string, size: number, pad = 72) => t.length * size * 0.6 + pad;
/* top-row items as [left, right] x-ranges: what the badge row must not meet */
const topItems = (s: TimedShot, W: number): [number, number][] => {
	const d = s.data ?? {};
	const c = (w: number): [number, number] => [W / 2 - w / 2, W / 2 + w / 2];
	const out: [number, number][] = [];
	const topText = (t: any) => t && t.pos === 'top' && out.push(c(Math.max(...t.lines.map((l: string) => pw(l.replace(/\*/g, ''), t.size ?? 104)))));
	topText(s.text);
	topText(s.slide?.text);
	if ((s.type === 'bar' || s.type === 'scale' || s.type === 'steps') && d.title) out.push(c(pw(d.title, 64)));
	if (s.type === 'icons' && d.num) out.push(c(pw(d.num, 170, 108)));
	if (s.type === 'split' && W < 1500) {
		// vertical frame: only the upper panel's pill and a centre plate are in the top row
		if (d.a?.label) out.push(c(Math.min(pw(d.a.label, 56), W - 160)));
	} else if (s.type === 'split') {
		if (d.center) out.push(c(pw(d.center, 56)));
		for (const [h, cx] of [[d.a, W * 0.25], [d.b, W * 0.75]] as const) if (h?.label) out.push([cx - Math.min(pw(h.label, 56), W * 0.44) / 2, cx + Math.min(pw(h.label, 56), W * 0.44) / 2]);
	}
	if (s.counter?.pos === 'top') out.push(c(500));
	if (s.board) out.push([W - 64 - 560, W - 64]);
	return out;
};

/* rectangles a callout plate must keep off: badges, BigText, source caption, board */
const calloutAvoid = (s: TimedShot, W: number, H: number, badgeRect: number[] | null): number[][] => {
	const out: number[][] = [];
	if (badgeRect) out.push(badgeRect);
	const t = s.text;
	if (t) {
		const n = t.lines.length;
		out.push(t.pos === 'bottom' ? [80, H - (t.bottom ?? 190) - 170 * n, W - 80, H - (t.bottom ?? 190)] : t.pos === 'left' ? [80, 200, 80 + 840, H - 200] : t.pos === 'top' ? [80, 80, W - 80, 80 + 170 * n] : [80, H / 2 - 85 * n, W - 80, H / 2 + 85 * n]);
	}
	if (s.source) out.push([80, H - 64 - 90, W - 80, H - 64]);
	if (s.board) out.push([W - 64 - 560, 64, W - 64, 150]);
	return out;
};

const Later: React.FC<{img: string}> = ({img}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 8], [0, 1], clampX)}}>
			<ImageShot name={img} effect="push" pos="center" />
		</AbsoluteFill>
	);
};

/* One shot = a base (picture, chart…) + optional overlays, all described by one row of shots.json:
   type: image | icons | split | bar | scale | steps | text
   img, pos, effect, focus      picture (hero/<pose> or img/<name>) and its motion
   data                         what the chart / grid / steps need
   text {lines, accent, pos, size, at}      BigText
   slide {from, at, text}                    BigText that flies in from an edge
   callout {from, to, text, at, color}       line + pill on the picture (screen fractions)
   counter {from, to, at, dur, label, suffix, color, pos}
   source                                    SourceCaption at the bottom
   badges [..]                               small plates in one row: «схема, не измерения», «условно», …
                                             top-left; if a title / label at the top would meet them, bottom-left (above the source caption)
   board {n, total, label, at}               scoreboard «правила 3/4», top-right
   bubble {text, who, at, side, color}       speech bubble, no voice
   then {at, img}                            a second picture takes over at `at` (0..1 of the shot)
   silent, after, hold                       a shot with no voice: shown `hold` s after the line `after` (see withPauses in timing.ts)
   all `at` values are seconds from the start of the shot */
export const Shot: React.FC<{shot: TimedShot}> = ({shot: s}) => {
	const d = s.data ?? {};
	const {width: W, height: H_, durationInFrames} = useVideoConfig();
	const badges: string[] = s.badges ?? [];
	const rowW = badges.reduce((a, b) => a + pw(b, 44, 56) + 12, 0);
	const low = topItems(s, W).some(([l, r]) => l < SAFE + 4 + rowW + 60 && r > SAFE + 4 - 60); // the row would meet a top title: go to the bottom
	const badgeRect = badges.length ? (low ? [SAFE + 4, H_ - SAFE - 4 - (s.source ? 100 : 0) - 80, SAFE + 4 + rowW, H_ - SAFE - 4 - (s.source ? 100 : 0)] : [SAFE + 4, SAFE + 4, SAFE + 4 + rowW, SAFE + 4 + 80]) : null;
	let base: React.ReactNode = <AbsoluteFill style={{background: '#000'}} />;
	if (s.type === 'image') base = <ImageShot name={s.img} effect={s.effect} pos={s.pos} focus={s.focus} zoom={s.zoom} area={s.area} />;
	if (s.type === 'icons') base = <IconGrid img={s.img} {...d} />;
	if (s.type === 'split') base = <Split a={d.a} b={d.b} center={d.center} />;
	if (s.type === 'bar') base = <BarChart {...d} />;
	if (s.type === 'scale') base = <Scale {...d} />;
	if (s.type === 'steps') base = <Steps img={s.img} {...d} />;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{base}
			{s.text ? <BigText {...s.text} at={fr(s.text.at)} /> : null}
			{s.slide ? (
				<SlideIn from={s.slide.from} at={fr(s.slide.at)}>
					<BigText {...s.slide.text} at={fr(s.slide.at) + 6} />
				</SlideIn>
			) : null}
			{s.callout ? (
				<Callout
					{...s.callout}
					at={fr(s.callout.at)}
					anchor={s.callout.anchor && s.img ? {img: s.img, point: s.callout.anchor, effect: s.effect, pos: s.pos, focus: s.focus, zoom: s.zoom, area: s.area} : undefined}
					avoid={calloutAvoid(s, W, H_, badgeRect)}
				/>
			) : null}
			{s.counter ? <Counter {...s.counter} at={fr(s.counter.at)} dur={s.counter.dur ?? 30} /> : null}
			{s.source ? <SourceCaption text={s.source} at={fr(s.sourceAt ?? 0.3)} /> : null}
			{s.board ? <Board {...s.board} at={fr(s.board.at)} /> : null}
			{s.bubble ? <Bubble {...s.bubble} at={fr(s.bubble.at)} /> : null}
			{s.then ? (
				<Sequence from={Math.round(s.then.at * durationInFrames)}>
					<Later img={s.then.img} />
				</Sequence>
			) : null}
			{badges.length ? (
				<div style={{position: 'absolute', left: SAFE + 4, maxWidth: W - 2 * (SAFE + 4), ...(low ? {bottom: SAFE + 4 + (s.source ? 100 : 0)} : {top: SAFE + 4}), display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12}}>
					{badges.map((b: string) => (
						<Plate key={b} size={44} border="#ff9f1a" style={{padding: '8px 24px'}}>{b}</Plate>
					))}
				</div>
			) : null}
		</AbsoluteFill>
	);
};
