import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SHORT_SHOT_LIST, TLS} from './kit/dataShort';
import {Shot} from './kit/shot';

/* Vertical Short 1080x1920: one Sequence per shot of src/story/short-shots.json, timed by short-timeline.json
   (recut: the voice clips are the long's, line ids 001_N … are the short's own numbering). */
export const SHORT_FRAMES = TLS.total;

export const Short: React.FC<{sound?: boolean}> = ({sound = true}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{SHORT_SHOT_LIST.map((s, i) => (
				<Sequence key={i} from={s.start} durationInFrames={Math.max(1, s.end - s.start)} name={`shot ${i + 1} @${s.line}`}>
					<Shot shot={s} />
				</Sequence>
			))}
			{sound
				? TLS.lines.map((l) => (
						<Sequence key={l.id} from={l.from} durationInFrames={l.dur}>
							<Audio src={staticFile(l.file)} startFrom={l.trimStart} />
						</Sequence>
					))
				: null}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};
