import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from './kit/font';

/* Заглушка: пустой чёрный кадр. Сцены будут добавлены позже. */
export const SHORT_FRAMES = 30 * 5;
export const Short: React.FC<{sound?: boolean}> = () => (
	<AbsoluteFill style={{background: '#000', color: '#fff', fontFamily: FONT, fontSize: 72, fontWeight: 800, alignItems: 'center', justifyContent: 'center'}}>
		заглушка
	</AbsoluteFill>
);
