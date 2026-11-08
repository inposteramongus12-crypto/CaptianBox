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

## Этап 3: движок (из /tmp/template)
Разбор файлов шаблона (универсальное / конкретный ролик):
- `src/engine/camera.tsx` — универсальный: камера с параллаксом по слоям, зерно, виньетка, пыль, леттербокс.
- `src/engine/color.ts` — универсальный: mix/lighten/darken цветов.
- `src/engine/Stickman.tsx` — риг стикмена (универсальный механизм, но герой у нас картинка) — не копировал.
- `src/engine/props.tsx` — стол, стул, бутылка: реквизит сцен — не копировал.
- `src/kit/core.tsx` — таймлайн реплик, счётчик, актёры, углы камеры; завязан на `story/timeline.json`, `config`, `cast` — не копировал.
- `src/kit/coverage.ts` — авторазбивка плана на ракурсы; завязана на `story/shots` — не копировал.
- `src/kit/graphics.tsx` — моушн-графика (Callout, Split, Caption, NeonCounter, IdCard); часть на CAST/Stickman — не копировал.
- `src/kit/kit.tsx` — Stage/camOn/usePush/Pop (универсальные) вместе с толпой и Sleeper (сцены); завязан на story — не копировал.
- `src/kit/ui.tsx` — Accent, Cite, Board, Bubble (универсальные) вместе с PhoneChat/RuleCard/AgeBadge; завязан на core — не копировал.
- `src/kit/sets.tsx` — локации (спальня, кухня, школа и т.д.): сцены ролика — не копировал.
- `src/kit/plan-report.ts` — отчёт для `check-plans`, завязан на `story/*` — не копировал.
- `src/reference/*` — три ручные референс-сцены (Classroom, Highway, PauseTime): конкретные сцены — не копировал.
- `src/index.ts` — универсальный: registerRoot.
- `public/fonts` — Rubik и Caveat (OFL): универсальные.
- `src/Long.tsx`, `src/Short.tsx` — монтаж/склейка с whip-pan и кропом 9:16: логика универсальная, но жёстко завязана на `story/*` и озвучку — взял только заглушки.
- `src/Sheet.tsx` — универсальная раскадровка (contact sheet).

Скопировано: `src/index.ts`, `src/engine/camera.tsx`, `src/engine/color.ts`, `public/fonts/`, `src/Sheet.tsx` (import FONT переведён на новый `src/kit/font.ts` с константами FONT/HAND).
Созданы: `src/Long.tsx`, `src/Short.tsx` — заглушки (чёрный кадр с текстом «заглушка», 5 с); `src/kit/font.ts`.
Правка: из `src/Root.tsx` убрана композиция Reference (папка reference не копировалась).
`npm run check` — без ошибок; `remotion compositions` видит Long, Short, Sheet; пробный still Long отрисован.

## Компоненты монтажа (только список, ничего не реализовано)
Статус в шаблоне (там они в `src/kit`, в проект пока не перенесены):
- ImageShot (герой из `public/hero`, медленный наезд) — НЕТ. Есть только наезд камеры для SVG-мира (`usePush`, `camOn`); растровых картинок (`<Img>`) в шаблоне нет.
- BigText с цветным акцентом — ЕСТЬ частично: `Caption` (крупные строки, последняя цветная, spring-вход, обводка) и `Accent` (плашка снизу).
- BarChart — НЕТ.
- Scale (весы) — НЕТ.
- IconGrid (ряды фигурок) — НЕТ как компонент; есть `CrowdRow` (ряд стикменов) — другая сущность.
- Steps (ступени) — НЕТ как компонент; в `places3.tsx` есть сцена-ступени «приятель → друг → близкий», привязана к ролику.
- Counter — ЕСТЬ: `NeonCounter` и бейдж `AgeBadge` с прокруткой числа; общий счётчик по реплика-ключам в `core`.
- Split — ЕСТЬ: `Split` (две панели, горизонтальный и вертикальный режимы), но внутри рисует стикмена; нужен вариант с картинкой.
- Callout — ЕСТЬ: `Callout` (точка, кольцо, линия и плашка) в мировых и экранных координатах.
- SourceCaption — ЕСТЬ: `Cite` (подпись источника, мелкий текст в углу), годится для подписи исследования.
- SlideIn — НЕТ как отдельный компонент; въезд с края встроен в `Split`, `Accent` и `Pop`.
Нужно с нуля: ImageShot, BarChart, Scale, IconGrid, Steps, SlideIn. Нужно переписать под картинки/без CAST: Split, BigText.
