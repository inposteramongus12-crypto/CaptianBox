import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COL, FONT, Plate, accent, clampX, ease, useLayout} from './theme';

/* "Разница *15 минут*": text between * is drawn in the accent colour; without markup the last line is the accent */
const parts = (s: string, ac: string, whole: boolean) => s.split('*').map((p, i) => <span key={i} style={{color: whole || i % 2 === 1 ? ac : '#fff'}}>{p}</span>);

export type BigTextProps = {lines: string[]; accent?: string; pos?: 'top' | 'center' | 'bottom' | 'left' | 'right'; size?: number; at?: number; bottom?: number}; // bottom: distance of a 'bottom' plate from the frame edge (default 190)
/* big title words: one navy plate per line, springs in, red / green / orange accent */
export const BigText: React.FC<BigTextProps> = ({lines, accent: a = 'orange', pos = 'center', size, at = 0, bottom}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad, big} = useLayout();
	const fs = size ?? big;
	const ac = accent(a);
	const marked = lines.some((l) => l.includes('*'));
	const box: React.CSSProperties =
		pos === 'top' ? {top: pad, left: pad, right: pad, textAlign: 'center'} :
		pos === 'bottom' ? {bottom: bottom ?? 190, left: pad, right: pad, textAlign: 'center'} :
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

/* number that rolls from a to b, then pops; on a navy plate.
   fmt 'mmss': the value is seconds, shown as 3:00 … 0:00. span: the roll lasts that share (0..1) of the shot instead of dur frames,
   so a middle frame of the shot shows an intermediate value. linear: constant speed instead of a fast start. */
export const Counter: React.FC<{from: number; to: number; at?: number; dur?: number; label?: string; suffix?: string; color?: string; pos?: 'center' | 'right' | 'left' | 'top'; fmt?: 'mmss'; span?: number; linear?: boolean}> = ({from, to, at = 0, dur = 30, label, suffix = '', color = 'orange', pos = 'right', fmt, span, linear}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {W, pad, v} = useLayout();
	if (f < at) return null;
	const d = span ? Math.max(1, Math.round(span * durationInFrames) - at) : dur;
	const val = interpolate(f, [at, at + d], [from, to], {...clampX, easing: linear ? undefined : Easing.out(Easing.cubic)});
	const lock = f - at - d;
	const pop = lock >= 0 && lock < 12 ? 1 + 0.1 * Math.exp(-lock / 4) : 1;
	const sec = Math.round(val);
	const shown = fmt === 'mmss' ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : `${sec}${suffix}`;
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
					<span style={{color: accent(color)}}>{shown}</span>
				</Plate>
			</div>
		</AbsoluteFill>
	);
};

/* speech bubble on the picture (no voice): who is a small caption above, the text in quotes, a tail towards the speaker.
   side = which side of the frame the bubble sits on; the tail points to the centre. */
export const Bubble: React.FC<{text: string; who?: string; at?: number; side?: 'left' | 'right'; color?: string}> = ({text, who, at = 0, side = 'left', color = 'red'}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad} = useLayout();
	if (f < at) return null;
	const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 140}});
	const c = accent(color);
	const left = side === 'left';
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', top: H * 0.2, [left ? 'left' : 'right']: pad, maxWidth: W * 0.3, opacity: Math.min(1, k * 1.5), transform: `scale(${0.8 + 0.2 * k})`, transformOrigin: left ? '80% 100%' : '20% 100%', textAlign: left ? 'left' : 'right'}}>
				{who ? <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: COL.dim, marginBottom: 6}}>{who}</div> : null}
				<Plate size={64} border={c} style={{borderRadius: 44, textAlign: 'left'}}>«{text}»</Plate>
				<div style={{width: 0, height: 0, borderLeft: '26px solid transparent', borderRight: '26px solid transparent', borderTop: `40px solid ${c}`, ...(left ? {marginLeft: 'auto', marginRight: 70} : {marginRight: 'auto', marginLeft: 70})}} />
			</div>
		</AbsoluteFill>
	);
};

/* scoreboard «правила 3/4»: n of total cells lit, top-right corner */
export const Board: React.FC<{n: number; total?: number; label?: string; at?: number}> = ({n, total = 4, label = 'правила', at = 0}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const o = interpolate(f, [at, at + 8], [0, 1], clampX);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', top: 64, right: 64, opacity: o}}>
				<Plate size={48} border={COL.green} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '10px 28px'}}>
					<span>{label}</span>
					<span style={{display: 'flex', gap: 8}}>
						{Array.from({length: total}, (_, i) => {
							const pop = i < n ? spring({frame: f - at - 6 - i * 8, fps, config: {damping: 10, stiffness: 160}}) : 0;
							return <span key={i} style={{width: 34, height: 34, borderRadius: 8, background: i < n && pop > 0.3 ? COL.green : '#2a2f4d', transform: `scale(${i < n ? 0.8 + 0.3 * pop : 1})`}} />;
						})}
					</span>
					<span style={{color: COL.green}}>{n}/{total}</span>
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
