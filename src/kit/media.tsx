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

export const imgBox = (name?: string): number[] | undefined => (name ? (IMAGES as Record<string, {box?: number[]}>)[name]?.box : undefined);

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
const EDGE = 60;

/* Biggest picture height h (and its top T) such that the hero's content box stays >= 60 px from the top and
   bottom of the frame at both ends of the zoom (z0 -> z1), with the zoom growing from focus point fy. */
const fit = (H: number, box: number[] | undefined, fy: number, z0: number, z1: number, area?: [number, number]) => {
	const ct = box ? box[1] : 0;
	const cb = box ? box[3] : 1;
	const a0 = area ? area[0] : 0;
	const a1 = area ? area[1] : H;
	const edge = area ? 24 : EDGE; // with an explicit area (vertical frames with text above / below) the picture only has to stay inside it
	for (let s = 1; s > 0.3; s -= 0.005) {
		const h = H * s;
		const T = a0 + (a1 - a0) / 2 - ((ct + cb) / 2) * h;
		const oy = T + fy * h;
		const ok = [z0, z1].every((z) => oy + (ct * h - fy * h) * z >= a0 + edge && oy + (cb * h - fy * h) * z <= a1 - edge);
		if (ok) return {h, T};
	}
	return {h: H * 0.3, T: a0 + (a1 - a0) * 0.35};
};

/* Where the hero picture sits on the frame, and where a point of the picture lands (Callout uses this to stick to the body). */
export type ImageGeom = {z0: number; z1: number; dx0: number; dx1: number; h: number; T: number; w: number; left: number; focus: [number, number]};
export const imageGeom = (name: string, effect: Effect, pos: 'left' | 'center' | 'right', focus: [number, number], zoom: number, W: number, H: number, area?: [number, number]): ImageGeom => {
	const i = imgInfo(name);
	const e = (IMAGES as Record<string, {box?: number[]}>)[name];
	let [z0, z1, dx0, dx1] = [1, 1, 0, 0];
	if (effect === 'push') [z0, z1] = [1, 1 + zoom];
	if (effect === 'pull') [z0, z1] = [1 + zoom, 1];
	if (effect === 'pan_left') [z0, z1, dx0, dx1] = [1, 1 + zoom * 0.6, 50, -50];
	if (effect === 'pan_right') [z0, z1, dx0, dx1] = [1, 1 + zoom * 0.6, -50, 50];
	const {h, T} = fit(H, e?.box, focus[1], Math.min(z0, z1), Math.max(z0, z1), area);
	const w = h * (i?.ar ?? 1);
	return {z0, z1, dx0, dx1, h, T, w, left: W * X[pos] - w / 2, focus};
};
/* screen point of picture point (px, py in 0..1) at progress k (0..1) of the shot */
export const geomPoint = (g: ImageGeom, px: number, py: number, k: number): [number, number] => {
	const z = g.z0 + (g.z1 - g.z0) * k;
	const dx = g.dx0 + (g.dx1 - g.dx0) * k;
	const ox = g.left + g.focus[0] * g.w;
	const oy = g.T + g.focus[1] * g.h;
	return [ox + (g.left + px * g.w - ox) * z + dx, oy + (g.T + py * g.h - oy) * z];
};

/* hero picture on black with a slow push in / pull out / sideways drift. The scale changes by `zoom`
   (default 25 %) over the shot. focus = point of the picture (0..1) the zoom grows from. The picture is sized so that
   the hero never gets closer than 60 px to the top or bottom edge, even at the biggest zoom. */
export const ImageShot: React.FC<{name: string; effect?: Effect; pos?: 'left' | 'center' | 'right'; focus?: [number, number]; zoom?: number; area?: [number, number]}> = ({name, effect = 'push', pos = 'center', focus = [0.5, 0.35], zoom = 0.25, area}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {W, H} = useLayout();
	const k = interpolate(f, [0, Math.max(1, durationInFrames - 1)], [0, 1], {...clampX, easing: ease});
	const g = imageGeom(name, effect, pos, focus, zoom, W, H, area && [area[0] * H, area[1] * H]);
	const z = g.z0 + (g.z1 - g.z0) * k;
	const dx = g.dx0 + (g.dx1 - g.dx0) * k;
	const {h, T, w} = g;
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: g.left, top: T, width: w, height: h, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, transform: `translateX(${dx}px) scale(${z})`}}>
				<Pic name={name} height={h} />
			</div>
		</AbsoluteFill>
	);
};
