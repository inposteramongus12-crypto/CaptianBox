import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from './kit/font';

/* Заглушка: пустой чёрный кадр. Сцены будут добавлены позже. */
export const LONG_FRAMES = 30 * 5;
export const Long: React.FC<{sound?: boolean}> = () => (
	<AbsoluteFill style={{background: '#000', color: '#fff', fontFamily: FONT, fontSize: 64, fontWeight: 800, alignItems: 'center', justifyContent: 'center'}}>
		заглушка
	</AbsoluteFill>
);
