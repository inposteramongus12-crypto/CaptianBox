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

## Этап 4: плеер кадров и компоненты (тест на 10 репликах)
Озвучка, ElevenLabs и рендер на Actions не запускались.

**Ядро** (`src/Long.tsx`, `src/kit/timing.ts`, `data.ts`, `shot.tsx`):
- `src/story/lines.json` — формат шаблона (`id`, `part`, `sp`, `t`), не менялся.
- `src/story/shots.json` — по реплике (префикс id): `type` (image | icons | split | bar | scale | steps | text), `img`, `pos`, `effect`, `focus`, `data`, оверлеи `text`, `slide`, `callout`, `counter`, `source`. Время `at` в секундах от начала кадра.
- Длительность: если есть `src/story/timeline.json` и в нём есть все реплики — берётся он (формат `prep-timeline` не менялся); иначе оценка ~15 знаков/с с теми же паузами. Проверено: с поддельным timeline длина роли 43 с → 72 с, после удаления вернулась оценка.
- `src/kit/plan-report.ts` переписан под плеер, поэтому `tools/check-plans.mjs` работает (10 планов, самый длинный 7,2 с).
- `tools/scan-images.mjs` → `src/story/images.json` (список картинок и размеры). Имя картинки, которого нет в списке, рисуется серой заглушкой с названием позы.

**Компоненты** (`src/kit/*.tsx`, без CAST и стикменов, плашки navy `#11142c`, отступ ≥ 60 px, шрифт плашек ≥ 44 px при 1080p):
ImageShot (push / pull / pan_left / pan_right), BigText (accent red/green/orange, разметка `*слово*`), BarChart, Scale, IconGrid, Steps, Split, SlideIn, Callout, Counter, SourceCaption.
Логика Callout, Counter (из NeonCounter), Split, Caption (BigText), Cite (SourceCaption), Pop/spring перенесена из `/tmp/template/src/kit` и очищена от персонажей; BarChart, Scale, IconGrid, Steps, ImageShot и SlideIn написаны заново (в шаблоне их нет).

**Тестовый сюжет:** выдуманное исследование про сборку шкафа (10 реплик, ~43 с), везде подпись «Тестовые данные… выдумано»; без советов по здоровью. Недостающая поза `walk_side` показана серой заглушкой (кадр 9).
Раскадровка каждые 2,5 с: `storyboard/test10_storyboard_Long.jpg` (17 кадров).

**Проверка краёв:** `tools/check-edges.mjs` — 0 нарушений (кадры каждые 30 и 60). В среде нет `scipy`, поэтому оригинальный `edge-scan.py` падает; добавлен запасной `tools/edge-scan-lite.py` (numpy + Pillow, то же правило 60 px, но проще поиск плашек), `check-edges.mjs` переключается на него сам. Проверено на подложенной плашке у края: обнаруживает.

**Не сделано / не работает:**
- Вертикальный Short: `Short.tsx` остаётся заглушкой. BarChart, Scale, IconGrid, BigText, Counter, Callout, SourceCaption подстраиваются под 9:16 через `useLayout`, но Split и Steps рассчитаны только на 16:9.
- `eleven-voice.mjs` и `voice-free.mjs`: нужен `src/story/voices.json` (не копировался) и ключи; не запускались.
- `prep-timeline.mjs`: нужны озвученные `public/vo/<id>.mp3`; пока их нет, работает оценка.
- `make-sound.mjs`: нужен `src/story/sound.json` (не копировался), `public/sfx` пуст; в `render.yml` подложка пустая.
- `render.yml`, `plan-chunks.mjs`, `render-part.mjs`: ждут `src/story/timeline.json` (без озвучки его нет), в Actions не запускались.
- `make-short-timeline.mjs`, `check-video.mjs`: нужны `short-pick.json` и готовое видео; не проверялись.
- `build-lines.mjs` читает `script.md` и ждёт поля `action`; формат lines.json совместим, но `script.md` нет.
- Сам `remotion studio` в браузере не открывался; проверка через `compositions`, `still` и раскадровку.

## Этап 4б: правки к тестовой раскадровке
Раскадровка затронутых кадров: `storyboard/test10_fix1_Long.jpg` (13 кадров).
1. **Герой и края.** `tools/scan-images.mjs` теперь пишет в `images.json` рамку непустого содержимого (`box`). `ImageShot` подбирает высоту картинки так, чтобы шлем и ботинки были не ближе 60 px к верхнему и нижнему краю на обоих концах зума. Измерено по полным кадрам: сверху 144–191 px, снизу не ближе 71 px.
2. **Шрифты крупнее на треть:** SourceCaption 36 → 48, Callout 46 → 61, подписи под столбцами 46 → 61, на весах подпись 44 → 58, значение 72 → 96. Столбцы подняты (`base = H − 330`), чтобы подписи не касались SourceCaption.
3. **Плашки.** Наложение в кадрах 5, 10–13 давала метка времени раскадровки поверх плашек: теперь она в отдельной полосе над кадром (`src/Sheet.tsx`). Плашка счётчика отодвинута до 120 px от края, увеличение при «щелчке» уменьшено с 20 до 10 %, чтобы не вылезало за 60 px.
4. **Наезд.** Смена масштаба за реплику 25 % (было 18 %); у боковых сдвигов масштаб тоже меняется (+15 %). Параметр `zoom` в `ImageShot`. В кадре с выноской наезд идёт из точки кончика пальца (`focus`), поэтому точка выноски не уезжает.
5. **Ступени и заглушка.** Ширина ступеней считается от ширины картинки: между последней ступенью и заглушкой зазор 80 px, наложения нет.
6. **IconGrid.** Фигурки 235 px вместо ~170; подсвеченные: полный цвет, зелёная рамка 6 px и свечение, остальные тёмные (22 % яркости, серые).
`check-edges.mjs` (кадры каждые 15) — 0 нарушений.

## Этап 1 (ролик): идея и сюжет
Тема «Почему огромные качки проигрывают худым боксёрам?». В `idea/stage1-options.md` три варианта подачи (A биомеханика, B третий раунд, C весы), честные названия, список исследований (подтверждено / не уверен) и позы (есть / не хватает: главное, второй персонаж «качок»). Ждём выбора варианта; сценарий не писался.

## Этап 2 (ролик): план по частям
Выбран вариант A, весы из C в повороте. Название: «Почему качок без опыта проигрывает худому боксёру». План в `idea/stage2-plan.md`: 9 частей, ~1 390 слов (~8 800 знаков), ~10:42, кульминация по минутам («схема, не измерения»), PMID/DOI для каждой цифры, 35 картинок (18 готовых, 6 героя, 11 качка с промтами), чек-лист. Правило про скорость заменено на Meijer 2015. Цифра Mosler «пятая часть массы» убрана: методы Mosler и Walilko расходятся. Ждём одобрения, текст не писался.

## Этап 3 (ролик): сценарий
`script.md`: 9 частей, N и HERO (качок облачками), 1 282 слова, 7 908 знаков закадра (лимит 8 000), 9:29 (15 зн/с) … 10:50 (13 зн/с). Подсчёт: `node tools/script-stats.mjs`. Правки порции 1 внесены (хлыст = не учился, мешок под плашкой «схема, не измерения», Satkunskiene PMID 39074243 и вывод по аннотации, мягкие описания), части 4–6 добраны до плана, часть 8 сокращена. Озвучка не запускалась.
