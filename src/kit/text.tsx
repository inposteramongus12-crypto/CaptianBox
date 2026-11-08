import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COL, FONT, Plate, accent, clampX, ease, useLayout} from './theme';

/* "Разница *15 минут*": text between * is drawn in the accent colour; without markup the last line is the accent */
const parts = (s: string, ac: string, whole: boolean) => s.split('*').map((p, i) => <span key={i} style={{color: whole || i % 2 === 1 ? ac : '#fff'}}>{p}</span>);

export type BigTextProps = {lines: string[]; accent?: string; pos?: 'top' | 'center' | 'bottom' | 'left' | 'right'; size?: number; at?: number};
/* big title words: one navy plate per line, springs in, red / green / orange accent */
export const BigText: React.FC<BigTextProps> = ({lines, accent: a = 'orange', pos = 'center', size, at = 0}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad, big} = useLayout();
	const fs = size ?? big;
	const ac = accent(a);
	const marked = lines.some((l) => l.includes('*'));
	const box: React.CSSProperties =
		pos === 'top' ? {top: pad, left: pad, right: pad, textAlign: 'center'} :
		pos === 'bottom' ? {bottom: 190, left: pad, right: pad, textAlign: 'center'} :
		pos === 'left' ? {left: pad, width: W / 2 - pad * 1.5, top: '50%', transform: 'translateY(-50%)', textAlign: 'left'} :
		pos === 'right' ? {right: pad, width: W / 2 - pad * 1.5, top: '50%', transform: 'translateY(-50%)', textAlign: 'right'} :
		{left: pad, right: pad, top: '50%', transform: 'translateY(-50%)', textAlign: 'center'};
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', ...box}}>
				{lines.map((t, i) => {
					const k = spring({frame: f - at - i * 5, fps, config: {damping: 14, stiffness: 150}});
					return (
						<div key={i} style={{marginBottom: 14, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 40}px)`}}>
							<Plate size={fs}>{parts(t, ac, !marked && i === lines.length - 1)}</Plate>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/* panel that flies in from an edge */
export const SlideIn: React.FC<{from?: 'left' | 'right' | 'top' | 'bottom'; at?: number; children: React.ReactNode}> = ({from = 'left', at = 0, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H} = useLayout();
	const k = spring({frame: f - at, fps, config: {damping: 16, stiffness: 120}});
	const off = {left: [-W, 0], right: [W, 0], top: [0, -H], bottom: [0, H]}[from];
	return <AbsoluteFill style={{pointerEvents: 'none', transform: `translate(${off[0] * (1 - k)}px,${off[1] * (1 - k)}px)`}}>{children}</AbsoluteFill>;
};

/* number that rolls from a to b, then pops; on a navy plate */
export const Counter: React.FC<{from: number; to: number; at?: number; dur?: number; label?: string; suffix?: string; color?: string; pos?: 'center' | 'right' | 'left' | 'top'}> = ({from, to, at = 0, dur = 30, label, suffix = '', color = 'orange', pos = 'right'}) => {
	const f = useCurrentFrame();
	const {W, pad, v} = useLayout();
	if (f < at) return null;
	const val = interpolate(f, [at, at + dur], [from, to], {...clampX, easing: Easing.out(Easing.cubic)});
	const lock = f - at - dur;
	const pop = lock >= 0 && lock < 12 ? 1 + 0.1 * Math.exp(-lock / 4) : 1;
	const box: React.CSSProperties =
		pos === 'right' ? {right: pad + 40, top: '50%', transform: `translateY(-50%) scale(${pop})`} :
		pos === 'left' ? {left: pad + 40, top: '50%', transform: `translateY(-50%) scale(${pop})`} :
		pos === 'top' ? {left: 0, right: 0, top: pad, textAlign: 'center', transform: `scale(${pop})`} :
		{left: 0, right: 0, top: '50%', textAlign: 'center', transform: `translateY(-50%) scale(${pop})`};
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', ...box}}>
				<Plate border={accent(color)} size={v ? 140 : 170} style={{textAlign: 'center', padding: '10px 44px'}}>
					{label ? <div style={{fontSize: 46, color: COL.dim, fontWeight: 700}}>{label}</div> : null}
					<span style={{color: accent(color)}}>{Math.round(val)}{suffix}</span>
				</Plate>
			</div>
		</AbsoluteFill>
	);
};

/* source of the study, bottom of the frame (>= 60 px from the edge) */
export const SourceCaption: React.FC<{text: string; at?: number}> = ({text, at = 6}) => {
	const f = useCurrentFrame();
	const {pad} = useLayout();
	const o = interpolate(f, [at, at + 10], [0, 1], clampX);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: pad, right: pad, bottom: 64, textAlign: 'center', opacity: o}}>
				<Plate size={48} style={{fontWeight: 600, color: COL.dim, padding: '10px 32px'}}>{text}</Plate>
			</div>
		</AbsoluteFill>
	);
};

/* dot + ring on a detail of the picture, a line draws out to a label pill.
   from / to are screen points as fractions 0..1; the pill is kept 60 px from the edges. */
export const Callout: React.FC<{from: [number, number]; to: [number, number]; text: string; at?: number; color?: string; size?: number}> = ({from, to, text, at = 0, color = 'orange', size = 61}) => {
	const f = useCurrentFrame();
	const {W, H, pad} = useLayout();
	const c = accent(color);
	const t = f - at;
	if (t < 0) return null;
	const draw = interpolate(t, [0, 14], [0, 1], {...clampX, easing: ease});
	const pw = text.length * size * 0.56 + 72;
	const ph = size * 1.7;
	const fx = from[0] * W;
	const fy = from[1] * H;
	const tx = Math.min(W - pad - pw / 2, Math.max(pad + pw / 2, to[0] * W));
	const ty = Math.min(H - pad - ph / 2, Math.max(pad + ph / 2, to[1] * H));
	const len = Math.hypot(tx - fx, ty - fy);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<circle cx={fx} cy={fy} r={12 * draw} fill={c} />
				<circle cx={fx} cy={fy} r={12 + 34 * draw} fill="none" stroke={c} strokeWidth={4} opacity={1 - draw} />
				<line x1={fx} y1={fy} x2={tx} y2={ty} stroke={c} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
				<g opacity={interpolate(t, [10, 18], [0, 1], clampX)}>
					<rect x={tx - pw / 2} y={ty - ph / 2} width={pw} height={ph} rx={ph / 2} fill={COL.navy} stroke={c} strokeWidth={5} />
					<text x={tx} y={ty + size * 0.34} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={800} fill="#fff">{text}</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
