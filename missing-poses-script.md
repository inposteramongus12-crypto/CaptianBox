# missing-poses-script

Позы героя (hero_*) и качка (kachok_*) для ролика «Почему качок без опыта проигрывает худому боксёру». Источник описаний: `idea/stage2-plan.md` (разделы «Нужно дорисовать героя» и «Персонаж качок»). `missing-poses.md` (другие ролики) не менялся. Картинки не генерировались.

Файлы класть в `public/hero/` как `<имя>.jpg`, затем запускать `node tools/scan-images.mjs`, чтобы заглушки заменились. Размер: вертикаль 848×1264 как у основных файлов, один персонаж, чёрный фон.

## Префиксы
- **hero_\***: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background`
- **kachok_\***: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background`
- В ринге у качка шлем и перчатки добавляются в описание позы (так в плане): `wearing a red headguard and red boxing gloves,`. Это шесть поз: guard_clumsy, arm_punch, wide_swing, gasping_low_guard, hands_knees, hit_reeling. У остальных шлема нет.

## Таблица (17 поз)
| Имя | Английский промт | Описание | Кадров в сценарии |
|---|---|---|---|
| hero_cross_rotation_3q_back | да (описание в плане, полный промт собран ниже) | Кросс с разворотом бёдер, вид 3/4 сзади | 4 |
| hero_slip | да (описание в плане, полный промт собран ниже) | Уклон от удара | 2 |
| hero_heavy_bag | да (описание в плане, полный промт собран ниже) | Удар по мешку | 2 |
| hero_breathing_calm | да (описание в плане, полный промт собран ниже) | Дышит, но в стойке | 3 |
| hero_on_scale | да (описание в плане, полный промт собран ниже) | На весах | 0 (весы рисуются кодом) |
| hero_footwork_side | да (описание в плане, полный промт собран ниже) | Передвижение на носках | 3 |
| kachok_stand_front | да (описание в плане, полный промт собран ниже) | Стоит анфас | 6 |
| kachok_flex_biceps | да (описание в плане, полный промт собран ниже) | Показывает бицепс | 7 |
| kachok_barbell | да (описание в плане, полный промт собран ниже) | В зале со штангой | 5 |
| kachok_on_scale | да (описание в плане, полный промт собран ниже) | На весах | 0 (весы рисуются кодом) |
| kachok_guard_clumsy | да (описание в плане, полный промт собран ниже) | Неуклюжая стойка | 4 |
| kachok_arm_punch | да (описание в плане, полный промт собран ниже) | Удар одной рукой, ноги стоят | 4 |
| kachok_wide_swing | да (описание в плане, полный промт собран ниже) | Размашистый удар | 6 |
| kachok_gasping_low_guard | да (описание в плане, полный промт собран ниже) | Задыхается, руки опущены | 2 |
| kachok_hands_knees | да (описание в плане, полный промт собран ниже) | Руки на коленях | 3 |
| kachok_hit_reeling | да (описание в плане, полный промт собран ниже) | Пропустил удар | 1 |
| kachok_handshake | да (описание в плане, полный промт собран ниже) | Жмёт руку (финал) | 2 |

Во всех 17 строках плана уже есть английское описание; полного промта с префиксом в плане не было, он собран ниже. «Кадров» считает показы картинки в `src/story/shots.json` (включая облачка 018b, 108b); на весах `*_on_scale` кадра нет, весы рисует код, файлы нужны, только если решите ставить фигуры на чаши.

## hero_*
### hero_cross_rotation_3q_back.jpg — Кросс с разворотом бёдер, вид 3/4 сзади
- Кадры: 021 064 087 094
- Описание позы: `throwing a rear straight punch, hips and torso rotated, rear heel lifted and pivoting, view from three-quarter behind, full body`
- Промт: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background, throwing a rear straight punch, hips and torso rotated, rear heel lifted and pivoting, view from three-quarter behind, full body`

### hero_slip.jpg — Уклон от удара
- Кадры: 075 085
- Описание позы: `slipping a punch, head moved off line, knees bent, guard up, full body`
- Промт: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background, slipping a punch, head moved off line, knees bent, guard up, full body`

### hero_heavy_bag.jpg — Удар по мешку
- Кадры: 051 112
- Описание позы: `punching a red heavy bag, full body, side view`
- Промт: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background, punching a red heavy bag, full body, side view`

### hero_breathing_calm.jpg — Дышит, но в стойке
- Кадры: 062 067 079
- Описание позы: `between rounds, breathing calmly, guard relaxed, slight smile in body language, full body`
- Промт: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background, between rounds, breathing calmly, guard relaxed, slight smile in body language, full body`

### hero_on_scale.jpg — На весах
- Кадры: нет (весы рисуются кодом)
- Описание позы: `standing on a simple floor scale, arms relaxed, front view, full body`
- Промт: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background, standing on a simple floor scale, arms relaxed, front view, full body`

### hero_footwork_side.jpg — Передвижение на носках
- Кадры: 028 030 092
- Описание позы: `moving on the balls of the feet, light step, side view, full body`
- Промт: `the same white faceless boxer with a red headguard, black shorts with red trim, red boots, wrapped hands, same style as the reference, black background, moving on the balls of the feet, light step, side view, full body`

## kachok_*
### kachok_stand_front.jpg — Стоит анфас
- Кадры: 012 039 041 054 107 110
- Описание позы: `standing front view, arms slightly away from body because of muscle size, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, standing front view, arms slightly away from body because of muscle size, full body`

### kachok_flex_biceps.jpg — Показывает бицепс
- Кадры: 004 009 031 032 033 052 086
- Описание позы: `double biceps pose, front view, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, double biceps pose, front view, full body`

### kachok_barbell.jpg — В зале со штангой
- Кадры: 002 008 035 066 112
- Описание позы: `curling a heavy barbell, front view, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, curling a heavy barbell, front view, full body`

### kachok_on_scale.jpg — На весах
- Кадры: нет (весы рисуются кодом)
- Описание позы: `standing on a simple floor scale, front view, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, standing on a simple floor scale, front view, full body`

### kachok_guard_clumsy.jpg — Неуклюжая стойка
- Кадры: 018 018b 055 111
- Описание позы: `wearing a red headguard and red boxing gloves, awkward boxing stance, feet parallel, elbows wide, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing a red headguard and red boxing gloves, awkward boxing stance, feet parallel, elbows wide, full body`

### kachok_arm_punch.jpg — Удар одной рукой, ноги стоят
- Кадры: 019 020 024 083
- Описание позы: `wearing a red headguard and red boxing gloves, punching with the arm only, feet flat and still, torso not rotated, side view, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing a red headguard and red boxing gloves, punching with the arm only, feet flat and still, torso not rotated, side view, full body`

### kachok_wide_swing.jpg — Размашистый удар
- Кадры: 071 072 074 082 084 007
- Описание позы: `wearing a red headguard and red boxing gloves, wide looping swing punch, off balance, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing a red headguard and red boxing gloves, wide looping swing punch, off balance, full body`

### kachok_gasping_low_guard.jpg — Задыхается, руки опущены
- Кадры: 079 081
- Описание позы: `wearing a red headguard and red boxing gloves, exhausted, gasping, gloves dropped to waist, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing a red headguard and red boxing gloves, exhausted, gasping, gloves dropped to waist, full body`

### kachok_hands_knees.jpg — Руки на коленях
- Кадры: 064 089 091
- Описание позы: `wearing a red headguard and red boxing gloves, bent over with hands on knees, exhausted, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing a red headguard and red boxing gloves, bent over with hands on knees, exhausted, full body`

### kachok_hit_reeling.jpg — Пропустил удар
- Кадры: 096
- Описание позы: `wearing a red headguard and red boxing gloves, head snapped back after being hit, stepping back, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing a red headguard and red boxing gloves, head snapped back after being hit, stepping back, full body`

### kachok_handshake.jpg — Жмёт руку (финал)
- Кадры: 108 108b
- Описание позы: `wearing red boxing gloves, extending a glove for a friendly glove touch, front three-quarter view, full body`
- Промт: `a white faceless bodybuilder character in the same style as the reference boxer, 100 kg, very muscular and bulky, much wider than the boxer, NO headguard (bare smooth white faceless head), black shorts, black background, wearing red boxing gloves, extending a glove for a friendly glove touch, front three-quarter view, full body`
