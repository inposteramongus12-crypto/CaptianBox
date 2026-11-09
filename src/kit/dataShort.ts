/* Story data of the vertical Short (recut from the long's voice clips): src/story/short-timeline.json (made by
   tools/make-short-timeline.mjs from short-pick.json) and src/story/short-shots.json. Shot `line` = short line number (001, 002 …). */
import TLJ from '../story/short-timeline.json';
import SHOTS from '../story/short-shots.json';
import {ShotDef, Timeline, timeShots} from './timing';

export const TLS = {...(TLJ as unknown as Timeline), estimated: false} as Timeline;
export const SHORT_SHOT_LIST = timeShots(SHOTS as ShotDef[], TLS);
