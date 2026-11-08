import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SHOT_LIST, TL} from './kit/data';
import {Shot} from './kit/shot';

/* Frame player: one Sequence per shot of src/story/shots.json, timed by timeline.json
   (or estimated from the text length until the voice exists). */
export const LONG_FRAMES = TL.total;

export const Long: React.FC<{sound?: boolean}> = ({sound = true}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{SHOT_LIST.map((s, i) => (
				<Sequence key={i} from={s.start} durationInFrames={Math.max(1, s.end - s.start)} name={`shot ${i + 1} @${s.line}`}>
					<Shot shot={s} />
				</Sequence>
			))}
			{sound && !TL.estimated
				? TL.lines.map((l) => (
						<Sequence key={l.id} from={l.from} durationInFrames={l.dur}>
							<Audio src={staticFile(l.file)} startFrom={l.trimStart} />
						</Sequence>
					))
				: null}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};
