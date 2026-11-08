import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BarChart, IconGrid, Scale, Split, Steps} from './charts';
import {ImageShot} from './media';
import {BigText, Callout, Counter, SlideIn, SourceCaption} from './text';
import {FPS, TimedShot} from './timing';
import {Plate, SAFE} from './theme';

const fr = (s?: number) => Math.round((s ?? 0) * FPS);

/* One shot = a base (picture, chart…) + optional overlays, all described by one row of shots.json:
   type: image | icons | split | bar | scale | steps | text
   img, pos, effect, focus      picture (hero/<pose> or img/<name>) and its motion
   data                         what the chart / grid / steps need
   text {lines, accent, pos, size, at}      BigText
   slide {from, at, text}                    BigText that flies in from an edge
   callout {from, to, text, at, color}       line + pill on the picture (screen fractions)
   counter {from, to, at, dur, label, suffix, color, pos}
   source                                    SourceCaption at the bottom
   badges [..]                               small plates top-left: «схема, не измерения», «условно», …
   all `at` values are seconds from the start of the shot */
export const Shot: React.FC<{shot: TimedShot}> = ({shot: s}) => {
	const d = s.data ?? {};
	let base: React.ReactNode = <AbsoluteFill style={{background: '#000'}} />;
	if (s.type === 'image') base = <ImageShot name={s.img} effect={s.effect} pos={s.pos} focus={s.focus} />;
	if (s.type === 'icons') base = <IconGrid img={s.img} {...d} />;
	if (s.type === 'split') base = <Split a={d.a} b={d.b} />;
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
			{s.callout ? <Callout {...s.callout} at={fr(s.callout.at)} /> : null}
			{s.counter ? <Counter {...s.counter} at={fr(s.counter.at)} dur={s.counter.dur ?? 30} /> : null}
			{s.source ? <SourceCaption text={s.source} at={fr(s.sourceAt ?? 0.3)} /> : null}
			{s.badges?.length ? (
				<div style={{position: 'absolute', top: SAFE + 4, left: SAFE + 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10}}>
					{s.badges.map((b: string) => (
						<Plate key={b} size={44} border="#ff9f1a" style={{padding: '8px 24px'}}>{b}</Plate>
					))}
				</div>
			) : null}
		</AbsoluteFill>
	);
};
