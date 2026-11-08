import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COL, FONT, Plate, accent, clampX, useLayout} from './theme';
import {Pic} from './media';

const useSpring = (at = 0, damping = 15, stiffness = 120) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - at, fps, config: {damping, stiffness}});
};

/* ---------- BarChart: vertical bars grow from the baseline, value on a plate above ---------- */
export type Bar = {label: string; value: number; color?: string; at?: number; instant?: boolean};
export const BarChart: React.FC<{bars: Bar[]; unit?: string; title?: string; max?: number}> = ({bars, unit = '', title, max}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad, v} = useLayout();
	const mx = max ?? Math.max(...bars.map((b) => b.value)) * 1.15;
	const top = title ? 300 : 190;
	const base = H - 290;
	const area = base - top;
	const slot = (W - 2 * pad) / bars.length;
	const bw = Math.min(300, slot * 0.6);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{title ? (
				<div style={{position: 'absolute', top: pad, left: pad, right: pad, textAlign: 'center'}}>
					<Plate size={v ? 56 : 64}>{title}</Plate>
				</div>
			) : null}
			<div style={{position: 'absolute', left: pad, right: pad, top: base, height: 6, background: '#3a3f5c'}} />
			{bars.map((b, i) => {
				const k = b.instant ? 1 : spring({frame: f - Math.round((b.at ?? 0.2 + i * 0.5) * fps), fps, config: {damping: 16, stiffness: 90}});
				const h = (b.value / mx) * area * k;
				const x = pad + i * slot + (slot - bw) / 2;
				const c = accent(b.color ?? 'green');
				return (
					<React.Fragment key={i}>
						<div style={{position: 'absolute', left: x, top: base - h, width: bw, height: h, background: c, borderRadius: '18px 18px 0 0'}} />
						<div style={{position: 'absolute', left: x - 40, width: bw + 80, top: base - h - 100, textAlign: 'center', opacity: Math.min(1, k * 2)}}>
							<Plate size={64} border={c}>{Math.round(b.value * k)}{unit ? ' ' + unit : ''}</Plate>
						</div>
						<div style={{position: 'absolute', left: x - 50, width: bw + 100, top: base + 26, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1.1, color: '#fff'}}>{b.label}</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

/* ---------- Scale: beam tilts to the heavier side ---------- */
type Side = {label: string; value: number; color?: string};
export const Scale: React.FC<{left: Side; right: Side; unit?: string; title?: string}> = ({left, right, unit = '', title}) => {
	const k = useSpring(6, 9, 60);
	const {W, H, pad, v} = useLayout();
	const mx = Math.max(left.value, right.value, 1);
	const a = k * Math.max(-14, Math.min(14, ((right.value - left.value) / mx) * 40)); // deg, + = right side down
	const rad = (a * Math.PI) / 180;
	const cx = W / 2;
	const cy = H * 0.3;
	const L = Math.min(W * 0.24, 460);
	const ends = [
		{s: left, x: cx - L * Math.cos(rad), y: cy - L * Math.sin(rad)},
		{s: right, x: cx + L * Math.cos(rad), y: cy + L * Math.sin(rad)},
	];
	const drop = 220;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{title ? (
				<div style={{position: 'absolute', top: pad, left: pad, right: pad, textAlign: 'center'}}>
					<Plate size={v ? 56 : 64}>{title}</Plate>
				</div>
			) : null}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<rect x={cx - 14} y={cy} width={28} height={H - cy - 330} fill="#3a3f5c" />
				<rect x={cx - 160} y={H - 340} width={320} height={26} rx={10} fill="#3a3f5c" />
				<line x1={cx - L * Math.cos(rad)} y1={cy - L * Math.sin(rad)} x2={cx + L * Math.cos(rad)} y2={cy + L * Math.sin(rad)} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
				<circle cx={cx} cy={cy} r={24} fill={COL.orange} />
				{ends.map(({s, x, y}, i) => {
					const c = accent(s.color ?? (i ? 'green' : 'orange'));
					return (
						<g key={i}>
							<line x1={x} y1={y} x2={x - 120} y2={y + drop} stroke="#aab3d6" strokeWidth={4} />
							<line x1={x} y1={y} x2={x + 120} y2={y + drop} stroke="#aab3d6" strokeWidth={4} />
							<path d={`M ${x - 150} ${y + drop} L ${x + 150} ${y + drop} Q ${x + 120} ${y + drop + 70} ${x} ${y + drop + 70} Q ${x - 120} ${y + drop + 70} ${x - 150} ${y + drop} Z`} fill={c} />
						</g>
					);
				})}
			</svg>
			{ends.map(({s, x, y}, i) => (
				<div key={i} style={{position: 'absolute', left: x - 210, width: 420, top: y + drop + 100, textAlign: 'center'}}>
					<Plate border={accent(s.color ?? (i ? 'green' : 'orange'))} style={{padding: '10px 24px'}}>
						<div style={{fontSize: 44, color: COL.dim, fontWeight: 700}}>{s.label}</div>
						<div style={{fontSize: 72}}>{s.value}{unit ? ' ' + unit : ''}</div>
					</Plate>
				</div>
			))}
		</AbsoluteFill>
	);
};

/* ---------- IconGrid: rows of little figures cut from a hero picture; some lit, the rest dim ---------- */
export const IconGrid: React.FC<{img: string; total: number; hi: number; cols?: number; num?: string; label?: string; color?: string}> = ({img, total, hi, cols = 10, num, label, color = 'green'}) => {
	const f = useCurrentFrame();
	const {W, H, pad, v} = useLayout();
	const c = accent(color);
	const rows = Math.ceil(total / cols);
	const gap = 16;
	const ih = Math.min(170, (H * 0.36) / rows - gap);
	const iw = ih * (848 / 1264);
	const gw = cols * iw + (cols - 1) * gap;
	const scale = Math.min(1, (W - 2 * pad) / gw);
	const k = useSpring(0);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{num ? (
				<div style={{position: 'absolute', top: pad - 20, left: 0, right: 0, textAlign: 'center', opacity: k}}>
					<Plate size={v ? 150 : 190} style={{color: c, padding: '6px 54px'}}>{num}</Plate>
				</div>
			) : null}
			<div style={{position: 'absolute', left: (W - gw * scale) / 2, top: H * 0.34, width: gw, transform: `scale(${scale})`, transformOrigin: '0 0', display: 'flex', flexWrap: 'wrap', gap}}>
				{Array.from({length: total}, (_, i) => {
					const lit = i < hi;
					const pop = lit ? spring({frame: f - 14 - i * 5, fps: 30, config: {damping: 10, stiffness: 160}}) : 1;
					return (
						<div key={i} style={{width: iw, height: ih, opacity: lit ? 1 : 0.35, filter: lit ? 'none' : 'grayscale(1)', transform: `scale(${0.7 + 0.3 * pop})`, outline: lit ? `4px solid ${c}` : 'none', outlineOffset: 2}}>
							<Pic name={img} height={ih} />
						</div>
					);
				})}
			</div>
			{label ? (
				<div style={{position: 'absolute', left: pad, right: pad, bottom: 190, textAlign: 'center'}}>
					<Plate size={v ? 52 : 60}>{label}</Plate>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

/* ---------- Steps: stairs rising to the right, each with its number and a word; optional picture beside ---------- */
export const Steps: React.FC<{steps: string[]; title?: string; color?: string; img?: string; wide?: number}> = ({steps, title, color = 'green', img, wide = 0.62}) => {
	const f = useCurrentFrame();
	const {W, H, pad, v} = useLayout();
	const c = accent(color);
	const areaW = img ? W * wide - pad : W - 2 * pad;
	const sw = areaW / steps.length;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{title ? (
				<div style={{position: 'absolute', top: pad, left: pad, width: areaW, textAlign: 'center'}}>
					<Plate size={v ? 56 : 64}>{title}</Plate>
				</div>
			) : null}
			{steps.map((s, i) => {
				const k = spring({frame: f - 8 - i * 12, fps: 30, config: {damping: 14, stiffness: 110}});
				const h = (240 + i * 170) * k;
				return (
					<div key={i} style={{position: 'absolute', left: pad + i * sw, bottom: 190, width: sw - 10, height: h, background: '#1c2142', borderTop: `10px solid ${c}`, borderRadius: '14px 14px 0 0', overflow: 'hidden', textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
						<div style={{fontSize: 110, fontWeight: 900, color: c, lineHeight: 1.1}}>{i + 1}</div>
						<div style={{fontSize: 46, fontWeight: 800, lineHeight: 1.1, padding: '0 10px'}}>{s}</div>
					</div>
				);
			})}
			{img ? (
				<div style={{position: 'absolute', right: pad, bottom: 190, opacity: interpolate(f, [4, 16], [0, 1], clampX)}}>
					<Pic name={img} height={H * 0.62} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};

/* ---------- Split: two panels with pictures slide in from opposite sides ---------- */
export type Half = {label: string; num?: string; sub?: string; img: string; color?: string};
export const Split: React.FC<{a: Half; b: Half}> = ({a, b}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad} = useLayout();
	const ka = spring({frame: f, fps, config: {damping: 15, stiffness: 150}});
	const kb = spring({frame: f - 5, fps, config: {damping: 15, stiffness: 150}});
	const ih = H * 0.5;
	const half = (h: Half, first: boolean, k: number) => {
		const c = accent(h.color ?? (first ? 'green' : 'orange'));
		const cx = first ? W * 0.25 : W * 0.75;
		const clip = first ? 'polygon(0 0, 52.6% 0, 47.4% 100%, 0 100%)' : 'polygon(52.6% 0, 100% 0, 100% 100%, 47.4% 100%)';
		return (
			<AbsoluteFill style={{transform: `translateX(${(first ? -1 : 1) * (1 - k) * W * 0.55}px)`}}>
				<AbsoluteFill style={{background: first ? '#0b1020' : '#14090d', clipPath: clip}} />
				<div style={{position: 'absolute', left: cx - W * 0.22, width: W * 0.44, top: pad, textAlign: 'center'}}>
					<Plate size={56} border={c}>{h.label}</Plate>
				</div>
				<div style={{position: 'absolute', left: cx - (ih * 848) / 1264 / 2, top: 190}}>
					<Pic name={h.img} height={ih} />
				</div>
				{h.num ? (
					<div style={{position: 'absolute', left: cx - W * 0.22, width: W * 0.44, top: 190 + ih + 20, textAlign: 'center'}}>
						<Plate size={130} style={{color: c, padding: '4px 40px'}}>
							{h.num}
							{h.sub ? <div style={{fontSize: 40, color: '#fff', fontWeight: 700}}>{h.sub}</div> : null}
						</Plate>
					</div>
				) : null}
			</AbsoluteFill>
		);
	};
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{half(a, true, ka)}
			{half(b, false, kb)}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<line x1={W * 0.526} y1={0} x2={W * 0.474} y2={H} stroke="#fff" strokeWidth={8} opacity={Math.min(ka, kb)} />
			</svg>
		</AbsoluteFill>
	);
};
