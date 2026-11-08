import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import IMAGES from '../story/images.json';
import {FONT, clampX, ease, useLayout} from './theme';

/* Pictures are addressed as 'hero/stand_front' or 'img/clock'. The list of existing files is
   src/story/images.json (node tools/scan-images.mjs). A name that is not there draws a grey placeholder. */
type Entry = {file: string; w: number; h: number};
export const imgInfo = (name?: string) => {
	if (!name) return null;
	const e = (IMAGES as Record<string, Entry>)[name];
	const label = name.split('/').pop() as string;
	return e ? {src: staticFile(e.file), ar: e.w / e.h, label, missing: false} : {src: null as string | null, ar: 848 / 1264, label, missing: true};
};

export const Pic: React.FC<{name: string; height: number; style?: React.CSSProperties}> = ({name, height, style}) => {
	const i = imgInfo(name);
	if (!i) return null;
	const w = height * i.ar;
	if (i.src) return <Img src={i.src} style={{height, width: w, display: 'block', ...style}} />;
	return (
		<div style={{height, width: w, background: '#6b6f78', border: '6px dashed #aeb2bb', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT, fontWeight: 800, textAlign: 'center', padding: 16, ...style}}>
			<div style={{fontSize: Math.max(34, Math.min(70, height / 9))}}>{i.label}</div>
			<div style={{fontSize: Math.max(30, Math.min(44, height / 14)), opacity: 0.8, marginTop: 8}}>заглушка</div>
		</div>
	);
};

export type Effect = 'push' | 'pull' | 'pan_left' | 'pan_right' | 'none';
const X = {left: 0.3, center: 0.5, right: 0.7};
/* hero picture, full height on black, with a slow push in / pull out / sideways drift.
   focus = point of the picture (0..1) the zoom grows from. */
export const ImageShot: React.FC<{name: string; effect?: Effect; pos?: 'left' | 'center' | 'right'; focus?: [number, number]; base?: number}> = ({name, effect = 'push', pos = 'center', focus = [0.5, 0.35], base = 1}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {W, H} = useLayout();
	const k = interpolate(f, [0, Math.max(1, durationInFrames - 1)], [0, 1], {...clampX, easing: ease});
	let z = 1;
	let dx = 0;
	if (effect === 'push') z = 1 + 0.18 * k;
	if (effect === 'pull') z = 1.18 - 0.18 * k;
	if (effect === 'pan_left') [z, dx] = [1.1, 50 - 100 * k];
	if (effect === 'pan_right') [z, dx] = [1.1, -50 + 100 * k];
	const h = H * base;
	const i = imgInfo(name);
	const w = h * (i?.ar ?? 1);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: W * X[pos] - w / 2, top: (H - h) / 2, width: w, height: h, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, transform: `translateX(${dx}px) scale(${z})`}}>
				<Pic name={name} height={h} />
			</div>
		</AbsoluteFill>
	);
};
