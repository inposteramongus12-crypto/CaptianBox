# PROGRESS

## Сделано
- Клон репозитория, картинки героя перенесены в `public/hero/`, переименованы (см. `hero-index.md`).
- Инфраструктура скопирована из шаблона (репозиторий Looxmax, клон в /tmp/template).
- `npm ci` выполнен, `chmod +x` на ffmpeg/ffprobe Remotion дан.
- Пробный кадр: `stand_front` на чёрном фоне 1920×1080 отрисован (файл `out/probe_stand_front.png`, не в git, `out/` в `.gitignore`).
- Составлен `missing-poses.md` с промтами для недостающих поз.

## Скопировано из шаблона
- `package.json`, `package-lock.json`, `.gitignore`, `CLOUD-NOTES.md`
- `tools/` целиком
- `.github/workflows/render.yml`
- `src/Root.tsx`
- `src/story/render.json` (в шаблоне он лежит здесь, а не в корне; так его ищет `tools/render.mjs`)
- `tsconfig.json` (нужен для `npm run check`; в список не входил, добавлен как инфраструктура)

## НЕ скопировано (намеренно)
- сценарий (`script.md`, `script_en.md`), озвучка (`lines*.json`, `voices.json`, `public/vo*`)
- сцены (`shots*.tsx`, `shortV.tsx`, `short*.ts/json`), `cast.ts`, `common.tsx`, `places*.tsx`, `config.ts`
- `timeline.json`, `sound.json`, `auto-cues.json`, `gaps.json`, `PROGRESS.md` шаблона, `out/`, `storyboard/`
- `src/Long.tsx`, `src/Short.tsx`, `src/Sheet.tsx`, `src/index.ts`, `src/engine`, `src/kit`, `src/reference`, `public/fonts`, `public/sfx`

## Важно
`src/Root.tsx` импортирует `./Long`, `./Short`, `./Sheet`, `./reference/PauseTime` — их в проекте пока нет, поэтому полный `remotion studio`/`npm run check` не заработает, пока не будут собраны эти файлы. Пробный кадр рендерился через временную мини-композицию (удалена).
Шрифты (`public/fonts`) не скопированы, Root.tsx их ждёт.

## Список недостающих поз (промты в `missing-poses.md`)
- run_side.jpg — Бег, вид сбоку
- run_front.jpg — Бег, анфас/3/4
- walk_side.jpg — Ходьба, сбоку
- walk_front.jpg — Ходьба, анфас
- squat_side.jpg — Приседание, сбоку
- squat_front.jpg — Приседание, анфас
- pushup_up.jpg — Отжимание, верх
- pushup_down.jpg — Отжимание, низ
- sit_chair.jpg — Сидит на стуле
- sit_floor.jpg — Сидит на полу
- hold_phone_front.jpg — Держит телефон, анфас
- hold_phone_scroll.jpg — Листает телефон
- emotion_surprised.jpg — Эмоция: удивление
- emotion_tired.jpg — Эмоция: усталость
- emotion_happy.jpg — Эмоция: радость
- nohelmet_front.jpg — Без шлема, анфас
- nohelmet_closeup.jpg — Без шлема, крупный план
- nohelmet_side.jpg — Без шлема, профиль
- dumbbell_curl.jpg — С гантелью, сгибание
- dumbbell_stand.jpg — С гантелями, стоит
- barbell_hold.jpg — Со штангой на плечах
- barbell_press.jpg — Жим штанги
- pullup_bar_hang.jpg — Висит на турнике
- pullup_top.jpg — Подтягивание, верх
- bed_lying_back.jpg — Лежит на кровати, на спине
- bed_lying_side.jpg — Лежит на кровати, на боку
- bed_sitting_up.jpg — Сидит на кровати
