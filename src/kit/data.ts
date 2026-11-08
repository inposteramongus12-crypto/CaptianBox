/* Story data for the player (webpack). timeline.json is optional: require.context finds it only if it exists. */
import LINES from '../story/lines.json';
import SHOTS from '../story/shots.json';
import {Line, ShotDef, Timeline, pickTimeline, timeShots} from './timing';

declare const require: any;
const ctx = require.context('../story', false, /^\.\/timeline\.json$/);
const REAL: Timeline | null = ctx.keys().length ? ctx('./timeline.json') : null;

export const TL = pickTimeline(LINES as Line[], REAL);
export const SHOT_LIST = timeShots(SHOTS as ShotDef[], TL);
