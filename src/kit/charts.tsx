import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COL, FONT, Plate, SAFE, accent, clampX, useLayout} from './theme';
import {Pic, imgBox, imgInfo} from './media';

const useSpring = (at = 0, damping = 15, stiffness = 120) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - at, fps, config: {damping, stiffness}});
};

/* ---------- BarChart: vertical bars grow from the baseline, value on a plate above ---------- */
export type Bar = {label: string; value: number; color?: string; at?: number; instant?: boolean};
export const BarChart: React.FC<{bars: Bar[]; unit?: string; title?: string; max?: number; noValues?: boolean; approx?: boolean}> = ({bars, unit = '', title, max, noValues, approx}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad, v} = useLayout();
	const mx = max ?? Math.max(...bars.map((b) => b.value)) * 1.15;
	const top = title ? 300 : 190;
	const base = H - 330;
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
						{noValues ? null : (
							<div style={{position: 'absolute', left: x - 40, width: bw + 80, top: base - h - 100, textAlign: 'center', opacity: Math.min(1, k * 2)}}>
								<Plate size={64} border={c}>{approx ? '≈' + String(Math.round(b.value * k)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : Math.round(b.value * k)}{unit ? ' ' + unit : ''}</Plate>
							</div>
						)}
						<div style={{position: 'absolute', left: x - 50, width: bw + 100, top: base + 26, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: bars.length > 4 ? 52 : 61, lineHeight: 1.1, color: '#fff', whiteSpace: 'nowrap'}}>{b.label}</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

/* ---------- Scale: beam tilts to the heavier side ---------- */
type Side = {label: string; value: number; color?: string; text?: string}; // text: shown instead of the number ('' = label only); value then only tilts the beam
export const Scale: React.FC<{left: Side; right: Side; unit?: string; title?: string}> = ({left, right, unit = '', title}) => {
	const k = useSpring(6, 9, 60);
	const {W, H, pad, v} = useLayout();
	const mx = Math.max(left.value, right.value, 1);
	const a = k * Math.max(-14, Math.min(14, ((right.value - left.value) / mx) * 40)); // deg, + = right side down
	const rad = (a * Math.PI) / 180;
	const cx = W / 2;
	const cy = v ? H * 0.4 : H * 0.3;
	const L = v ? W * 0.3 : Math.min(W * 0.24, 460);
	const ends = [
		{s: left, x: cx - L * Math.cos(rad), y: cy - L * Math.sin(rad)},
		{s: right, x: cx + L * Math.cos(rad), y: cy + L * Math.sin(rad)},
	];
	const drop = 220;
	const pw = v ? 440 : Math.min(540, W / 2 - pad);
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
				<div key={i} style={{position: 'absolute', left: Math.max(pad, Math.min(W - pad - pw, x - pw / 2)), width: pw, top: y + drop + 100, textAlign: 'center'}}>
					<Plate border={accent(s.color ?? (i ? 'green' : 'orange'))} style={{padding: '10px 24px'}}>
						<div style={{fontSize: v ? 70 : 58, color: COL.dim, fontWeight: 700}}>{s.label}</div>
						{s.text !== undefined ? (s.text ? <div style={{fontSize: v ? 104 : 80}}>{s.text}</div> : null) : <div style={{fontSize: v ? 132 : 96}}>{s.value}{unit ? <span style={{fontSize: v ? 76 : 56}}> {unit}</span> : null}</div>}
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
	const gap = 20;
	const top = v ? 360 : 290;
	const availH = H - top - 300; // room left for the caption plate and the 60 px edge
	const ih = Math.min((availH - (rows - 1) * gap) / rows, ((W - 2 * pad - (cols - 1) * gap) / cols) * (1264 / 848));
	const iw = ih * (848 / 1264);
	const gw = cols * iw + (cols - 1) * gap;
	const k = useSpring(0);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{num ? (
				<div style={{position: 'absolute', top: pad, left: 0, right: 0, textAlign: 'center', opacity: k}}>
					<Plate size={v ? 130 : 170} style={{color: c, padding: '6px 54px'}}>{num}</Plate>
				</div>
			) : null}
			<div style={{position: 'absolute', left: (W - gw) / 2, top, width: gw, display: 'flex', flexWrap: 'wrap', gap}}>
				{Array.from({length: total}, (_, i) => {
					const lit = i < hi;
					const pop = lit ? spring({frame: f - 14 - i * 5, fps: 30, config: {damping: 10, stiffness: 160}}) : 1;
					return (
						<div key={i} style={{position: 'relative', width: iw, height: ih, opacity: lit ? 1 : 0.22, filter: lit ? 'none' : 'grayscale(1) brightness(0.7)', transform: `scale(${lit ? 0.85 + 0.2 * pop : 1})`, zIndex: lit ? 2 : 1, boxShadow: lit ? `0 0 0 6px ${c}, 0 0 36px 8px ${c}` : 'none', borderRadius: 10}}>
							<Pic name={img} height={ih} />
						</div>
					);
				})}
			</div>
			{label ? (
				<div style={{position: 'absolute', left: pad, right: pad, bottom: pad + 40, textAlign: 'center'}}>
					<Plate size={v ? 52 : 60}>{label}</Plate>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

/* ---------- Steps: stairs rising to the right, each with its number and a word; optional picture beside ---------- */
export const Steps: React.FC<{steps: string[]; title?: string; color?: string; img?: string; mark?: {step: number; img: string}}> = ({steps, title, color = 'green', img, mark}) => {
	const f = useCurrentFrame();
	const {W, H, pad, v} = useLayout();
	const c = accent(color);
	const rise0 = Math.min(v ? 260 : 170, (H - 190 - SAFE - 240) / Math.max(1, steps.length - 1));
	const stairsTop = H - 190 - (240 + (steps.length - 1) * rise0);
	// wide frame: the picture stands beside the stairs; vertical frame: above them
	const imgH = v ? Math.max(0, Math.min(H * 0.36, stairsTop - pad - 150)) : H * 0.62;
	const imgW = img ? imgH * (imgInfo(img)?.ar ?? 0.67) : 0;
	// the stairs take whatever is left of the width, with an 80 px gap before the picture
	const areaW = W - 2 * pad - (img && !v ? imgW + 80 : 0);
	const sw = areaW / steps.length;
	const rise = Math.min(v ? 260 : 170, (H - 190 - SAFE - 240) / Math.max(1, steps.length - 1)); // the last step never reaches the 60 px edge
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{title ? (
				<div style={{position: 'absolute', top: pad, left: pad, width: areaW, textAlign: 'center'}}>
					<Plate size={v ? 56 : 64}>{title}</Plate>
				</div>
			) : null}
			{steps.map((s, i) => {
				const k = spring({frame: f - 8 - i * 12, fps: 30, config: {damping: 14, stiffness: 110}});
				const h = (240 + i * rise) * k;
				return (
					<div key={i} style={{position: 'absolute', left: pad + i * sw, bottom: 190, width: sw - 10, height: h, background: '#1c2142', borderTop: `10px solid ${c}`, borderRadius: '14px 14px 0 0', overflow: 'hidden', textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
						<div style={{fontSize: 110, fontWeight: 900, color: c, lineHeight: 1.1}}>{i + 1}</div>
						<div style={{fontSize: v ? 40 : 46, fontWeight: 800, lineHeight: 1.1, padding: '0 6px'}}>{s}</div>
					</div>
				);
			})}
			{mark ? (
				<div style={{position: 'absolute', left: pad + mark.step * sw + (sw - 10) / 2 - (300 * (imgInfo(mark.img)?.ar ?? 0.67)) / 2, bottom: 190 + 240 + 10, opacity: interpolate(f, [20, 32], [0, 1], clampX)}}>
					<Pic name={mark.img} height={300} />
				</div>
			) : null}
			{img ? (
				<div style={{position: 'absolute', left: v ? (W - imgW) / 2 : W - pad - imgW, ...(v ? {top: pad + 110} : {bottom: 190}), opacity: interpolate(f, [4, 16], [0, 1], clampX)}}>
					<Pic name={img} height={imgH} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};

/* ---------- Split: two panels with pictures slide in from opposite sides ---------- */
export type Half = {label: string; num?: string; sub?: string; foot?: string; img: string; color?: string}; // label '' = no pill; foot = a second plate under the picture
export const Split: React.FC<{a: Half; b: Half; center?: string; reserveBottom?: number}> = ({a, b, center, reserveBottom = 0}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {W, H, pad, v} = useLayout();
	const ka = spring({frame: f, fps, config: {damping: 15, stiffness: 150}});
	const kb = spring({frame: f - 5, fps, config: {damping: 15, stiffness: 150}});
	const ih = v ? (a.label || b.label ? 680 : 640) : H * 0.5;
	// vertical frame: two panels one above the other, a barely slanted divider across the middle (y 0.488 H at the left, 0.512 H at the right).
	// Pictures are sized by the FIGURE (the box from images.json), not by the file: >= 60 px from the frame edge, from the pills and from the divider.
	const lab = !!(a.label || b.label);
	const lh = 94; // height of a 50 px pill
	const aFigTop = a.label ? pad - 16 + lh + 60 : 60;
	const aFigBot = H * 0.5 - 11 - 60; // the divider is at most 11 px above the middle over the width of a figure
	const bLabTop = H * 0.512 + 60; // under the lowest point of the divider (right edge), + 60
	const bFigTop = b.label ? bLabTop + lh + 60 : H * 0.5 + 11 + 60;
	const bFigBot = H - 60 - reserveBottom; // reserveBottom: room for a badge row at the bottom (vertical frame)
	const centerGap = !lab ? 125 : 0; // room for a two-line BigText between pictures when there are no pills
	const zoneA: [number, number] = [aFigTop, aFigBot - centerGap];
	const zoneB: [number, number] = [bFigTop + centerGap, bFigBot];
	const fhA = zoneA[1] - zoneA[0];
	const fhB = zoneB[1] - zoneB[0];
	const fh = reserveBottom ? Math.max(fhA, fhB) : Math.min(fhA, fhB); // equal heights, unless a badge squeezes the lower picture
	const box0 = (img: string) => (imgBox(img) ?? [0, 0, 1, 1])[1];
	const fig = (h: Half, zone: [number, number]) => {
		const box = imgBox(h.img) ?? [0, 0, 1, 1];
		const fhz = Math.min(fh, zone[1] - zone[0]);
		const ph = fhz / (box[3] - box[1]);
		return {ph, fhz, top: zone[0] + (zone[1] - zone[0] - fhz) / 2 - box[1] * ph};
	};
	const half = (h: Half, first: boolean, k: number) => {
		const c = accent(h.color ?? (first ? 'green' : 'orange'));
		if (v) {
			const clip = first ? 'polygon(0 0, 100% 0, 100% 51.2%, 0 48.8%)' : 'polygon(0 48.8%, 100% 51.2%, 100% 100%, 0 100%)';
			const g = fig(h, first ? zoneA : zoneB);
			return (
				<AbsoluteFill style={{transform: `translateY(${(first ? -1 : 1) * (1 - k) * H * 0.55}px)`}}>
					<AbsoluteFill style={{background: first ? '#0b1020' : '#14090d', clipPath: clip}} />
					{/* the picture is cut to the figure's box and its black background drops out (lighten), so it never covers a pill or the divider */}
					<div style={{position: 'absolute', left: 0, width: W, top: g.top + box0(h.img) * g.ph, height: g.fhz, overflow: 'hidden'}}>
						<div style={{position: 'absolute', left: W / 2 - (g.ph * (imgInfo(h.img)?.ar ?? 0.67)) / 2, top: -box0(h.img) * g.ph, mixBlendMode: 'lighten'}}>
							<Pic name={h.img} height={g.ph} />
						</div>
					</div>
					{h.label ? (
						<div style={{position: 'absolute', left: pad, right: pad, top: first ? pad - 16 : bLabTop, textAlign: 'center'}}>
							<Plate size={50} border={c}>{h.label}</Plate>
						</div>
					) : null}
				</AbsoluteFill>
			);
		}
		const cx = first ? W * 0.25 : W * 0.75;
		const clip = first ? 'polygon(0 0, 52.6% 0, 47.4% 100%, 0 100%)' : 'polygon(52.6% 0, 100% 0, 100% 100%, 47.4% 100%)';
		return (
			<AbsoluteFill style={{transform: `translateX(${(first ? -1 : 1) * (1 - k) * W * 0.55}px)`}}>
				<AbsoluteFill style={{background: first ? '#0b1020' : '#14090d', clipPath: clip}} />
				{h.label ? (
					<div style={{position: 'absolute', left: cx - W * 0.22, width: W * 0.44, top: pad, textAlign: 'center'}}>
						<Plate size={56} border={c}>{h.label}</Plate>
					</div>
				) : null}
				{h.foot ? (
					<div style={{position: 'absolute', left: cx - W * 0.22, width: W * 0.44, top: 190 + ih + 24, textAlign: 'center'}}>
						<Plate size={56} border={c}>{h.foot}</Plate>
					</div>
				) : null}
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
				{v ? <line x1={0} y1={H * 0.488} x2={W} y2={H * 0.512} stroke="#fff" strokeWidth={8} opacity={Math.min(ka, kb)} /> : <line x1={W * 0.526} y1={0} x2={W * 0.474} y2={H} stroke="#fff" strokeWidth={8} opacity={Math.min(ka, kb)} />}
			</svg>
			{center ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: v ? H / 2 - 60 : pad, textAlign: 'center', opacity: Math.min(ka, kb)}}>
					<Plate size={56}>{center}</Plate>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
