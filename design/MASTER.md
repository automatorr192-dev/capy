# $CAPY — MASTER (направление и токены)

## Design Read
Consumer memecoin landing для крипто-нативной, но уставшей от web3-шаблона аудитории. Язык — **cozy-premium «тёплый онсен на тёмном»**: капибара в горячем источнике на закате, спокойствие и характер вместо хайпа. Уходим от дженерик-web3 (electric blue, Orbitron/Space Grotesk, эмодзи, неон). Нативный HTML/CSS/JS, один self-contained `index.html`, кастомный SVG-маскот.

## Дилы (taste-skill)
- **DESIGN_VARIANCE: 7** — premium/brand, характерно, но не хаос.
- **MOTION_INTENSITY: 6** — живая цена, count-up, отрисовка donut, scroll-reveal; спокойно, не кинематограф.
- **VISUAL_DENSITY: 4** — дышит, уютно.

## Палитра (тёплый онсен на тёмном) — theme lock: dark
- Фон: `#15100b` → `#1b140d` (радиальный тёплый закат за героем).
- Поверхности: `#231a12` / `#2c2117` / `#372a1d`. Линии: `#3a2c1e` / `#4a3826`.
- Текст: `#f8f0e3`, muted `#b6a48c`.
- Акцент-семья (тёплая, аналоговая): амбер `#ffab45` (primary), золото `#ffd36a` (highlight), корал `#ff8a5c` (secondary-warm).
- Функциональные: мята-«вода/пар» `#74e0c6` (только вода/пар/live-positive), слива `#8a6a9c` (очень редко).
- **Accent lock:** доминирует тёплая амбер-семья на всей странице; мята — только семантика воды/пара/роста; не сыпать случайные цветовые всплески.

## Типографика
- **Calistoga** — display (тёплый характерный заголовок).
- **DM Sans** — body.
- **JetBrains Mono** — данные: цена, контракт, статы, eyebrow'ы.
- Подключение: Google Fonts `<link>` c preconnect + `display=swap` (осознанное отклонение от «no `<link>`» taste-skill — это self-contained статик-файл под Pages, не Next).

## Форма (shape lock)
- Карты/панели `border-radius: 22px`, бейджи/чипы `12px`, кнопки/пилюли — full (pill). Правило соблюдается везде.

## Signature-момент
Хиро: **кастомный inline-SVG — капибара в онсене с юдзу на голове**, тёплый пар, плавающая live-price карточка на стекле. Это узнаваемость страницы.

## Анти-слоп чек (из taste-skill, что критично для этой страницы)
- **Ноль em-dash / en-dash** (`—`/`–`) в любом видимом тексте — только `-`. Аудит перед сдачей.
- Хиро: ≤4 текстовых элемента (eyebrow-бейдж + H1 + подзаголовок + 2 CTA); мету renounced/burned/holders **уносим в Stats** (не trust-микрострип в героe). Хедлайн ≤2 строк, подзаголовок ≤20 слов, `pt` ≤ 6rem.
- **Не «3 одинаковые карточки»**: Why $CAPY — асимметрично (крупная + две), не три равных.
- ≥4 разных layout-семейств на страницу; eyebrow максимум 1 на 3 секции.
- How to Buy — глаголы-лейблы (Get wallet / Fund / Swap / Chill), не «Step 1/2/3».
- Нет: scroll-cue, version-лейблов, locale/погода-стрипов, декоративных точек (кроме реального live-пульса), section-number eyebrow'ов, `border-t+border-b` на каждой строке.
- Мок-данные (цена, holders, контракт) честно помечены «demo». Токеномика 1B / 0% / 85·10·5 — как есть.
- Иконки — инлайн-SVG stroke 1.5 (нет npm в self-contained файле), эмодзи нет. Маскот — кастомный SVG (разрешён брифом).
- Motion: только transform/opacity, ease-out ~200-300ms, `prefers-reduced-motion` гасит live-tick/parallax/donut в статику.

## Кросс-чек ui-ux-pro-max
Вернул дженерик-web3 (Space Grotesk/Inter, slate+red) — отклонён как ровно тот шаблон, от которого уходим. Взят только его универсальный pre-delivery чеклист (SVG-иконки, cursor-pointer, hover 150-300ms, контраст ≥4.5:1, focus-visible, reduced-motion, брейкпоинты 375/768/1024/1440).

## Структура секций (layout-семьи разные)
1. Nav (sticky glass) · 2. Hero (split: слева текст, справа маскот+price) · 3. Stats (4, count-up, mono) · 4. Why $CAPY (асимметрия 1+2) · 5. Tokenomics (donut + essentials + contract copy) · 6. How to Buy (4 шага, глаголы) · 7. Roadmap (тёплый таймлайн) · 8. Community (соц) · 9. FAQ (accordion) · 10. Final CTA · 11. Footer (дисклеймер + «built by @automatorrr»).
