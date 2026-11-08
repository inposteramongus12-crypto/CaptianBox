import React from 'react';
import {Easing, useVideoConfig} from 'remotion';
import {FONT} from './font';

export {FONT};
/* Palette: navy plates (#11142c) are what tools/check-edges.mjs looks for, keep that exact fill. */
export const COL = {navy: '#11142c', cream: '#fbf8ef', white: '#ffffff', red: '#ff4d4d', green: '#3ddc84', orange: '#ff9f1a', gray: '#8a8f9c', dim: '#aab3d6'};
export type AccentName = 'red' | 'green' | 'orange' | 'white';
/* accent name or a raw css colour */
export const accent = (a?: string): string => (a && (COL as Record<string, string>)[a]) || a || COL.white;
export const clampX = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.inOut(Easing.cubic);
/* plates and text never closer than 60 px to the frame edge; we keep 80 */
export const SAFE = 60;
export const PAD = 80;

/* frame size and type scale for the current composition (16:9 long or 9:16 short) */
export const useLayout = () => {
	const {width: W, height: H, fps} = useVideoConfig();
	const v = H > W;
	return {W, H, fps, v, pad: PAD, big: v ? 92 : 104, mid: v ? 56 : 60, small: v ? 44 : 46};
};

/* dark plate behind text: readable on any picture, on a phone too (font >= 44 px at 1080p) */
export const Plate: React.FC<{children: React.ReactNode; border?: string; size?: number; style?: React.CSSProperties}> = ({children, border, size = 46, style}) => (
	<div
		style={{
			display: 'inline-block',
			background: COL.navy,
			color: '#fff',
			fontFamily: FONT,
			fontWeight: 800,
			fontSize: size,
			lineHeight: 1.15,
			borderRadius: 28,
			padding: '14px 36px',
			border: border ? `4px solid ${border}` : undefined,
			...style,
		}}
	>
		{children}
	</div>
);
