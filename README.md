# Test Site Restaurant — статичний сайт-прототип

Демонстраційний статичний сайт ресторану (медітерранська кухня, Х'юстон, TX). Відкривається локально, редагується вручну та розгортається на будь-якому статичному хостингу без прив'язки до особистого акаунта розробника.

> **Test Site Restaurant** — це тестовий сайт. Страви, ціни, фото й години роботи є заглушками для попереднього перегляду дизайну.

## Про проєкт

**Test Site Restaurant** — демонстраційний сайт ресторану середземноморської кухні, зібраний як статичний прототип без бекенду, збірки та залежностей. Мета — показати замовнику дизайн, структуру сторінок і поведінку інтерфейсу до запуску продакшн-версії.

Що є на сайті:

- **Головна** (`index.html`) — герой-блок, розповідь про ресторан, daily specials за днями тижня, catering, контакти й карта.
- **Меню** (`menu.html`) — пошук по стравах, фільтр за категоріями (Mezza, Sandwiches & Shawarma, Grill), картки з фото, цінами й описами, модальне вікно з деталями страви.
- **My Selection** — кошик для перегляду обраного: кількість, підсумок, копіювання списку, збереження в `localStorage`.
- **Теми** — світла, темна та системна, з перемикачем і збереженням вибору.
- **404** (`404.html`) — власна сторінка помилки.
- **Доступність** — семантична розмітка, `aria`-атрибути, керування з клавіатури, `prefers-reduced-motion`.

Технічно це HTML, CSS і vanilla JavaScript: без фреймворків, без npm-залежностей, без етапу збірки. Контент винесено в `config.js` (контакти, теми, соцмережі) і `menu-data.js` (страви та specials), тому тексти й ціни редагуються без правок розмітки.

## Статус: тестовий сайт

Це демонстраційна версія під назвою **Test Site Restaurant**. Назва використовується в `<title>`, шапці, футері, контактному блоці, Open Graph/Twitter метаданих, JSON-LD і `config.js`. Окремого банера вгорі сторінки немає — позначення тестового сайту живе в самій назві та футері.

Індексацію вимкнено: `<meta name="robots" content="noindex, nofollow">` на головній і сторінці меню та `Disallow: /` у `robots.txt`. Щоб увімкнути індексацію після запуску, приберіть ці meta-теги й замініть `robots.txt` на продакшн-версію (шаблон є в коментарі файлу).

## Останні правки (12.11.2026)

- Панель «My Selection» на сторінці меню: список страв тепер прокручується всередині панелі, а блок `Total` закріплений знизу й видимий завжди — навіть якщо обрано багато різних страв і сума перевищує $3 000.
- Сума форматується з розділювачем тисяч (`$5,615.70`) через `Intl.NumberFormat`, цифри табличні, без переносу рядка.
- Шрифт у меню зроблено виразнішим і ширшим: назви страв — Manrope 800, 1.32rem, додатний міжлітерний інтервал; описи — 1rem з інтервалом 0.012em; ціни — 800 з табличними цифрами.

## Git і деплой

Локальний репозиторій уже створений (гілка `main`, перший коміт `ad25a45`). Залишилось підключити віддалений репозиторій і хостинг — для цього потрібна авторизація акаунта.

### Опис репозиторію на GitHub

Короткий опис (поле **Description**, ліміт 350 символів) — готовий до вставки:

```text
Test Site Restaurant — demo static site for a Mediterranean restaurant: searchable menu with a My Selection panel, dark/light theme, local WebP imagery and SEO metadata. HTML, CSS and vanilla JS, no build step.
```

Теми (**Topics**):

```text
static-site, restaurant-website, html-css-javascript, vanilla-js, demo-site, menu, responsive-design, dark-mode, netlify, vercel, github-pages, seo
```

Застосувати через GitHub CLI:

```bash
gh repo edit SashaPro777/wasfi-test-site \
  --description "Test Site Restaurant — demo static site for a Mediterranean restaurant: searchable menu with a My Selection panel, dark/light theme, local WebP imagery and SEO metadata. HTML, CSS and vanilla JS, no build step." \
  --add-topic static-site,restaurant-website,html-css-javascript,vanilla-js,demo-site,menu,responsive-design,dark-mode,netlify,vercel,github-pages,seo
```

Або через REST API (потрібен токен зі scope `repo`):

```bash
curl -X PATCH https://api.github.com/repos/SashaPro777/wasfi-test-site \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{"description":"Test Site Restaurant — demo static site for a Mediterranean restaurant: searchable menu with a My Selection panel, dark/light theme, local WebP imagery and SEO metadata. HTML, CSS and vanilla JS, no build step.","homepage":"https://www.wasfis.com"}'
```

### GitHub

```bash
# 1. Створіть репозиторій на github.com (без README, без .gitignore)
# 2. Підключіть і запуште:
git remote add origin https://github.com/SashaPro777/<repo-name>.git
git push -u origin main
```

Або через GitHub CLI: `gh auth login`, далі `gh repo create <repo-name> --public --source=. --push`.

### Netlify

- Варіант А (drag-and-drop): перетягніть `deploy/wasfi-test-site.zip` або папку проєкту на https://app.netlify.com/drop.
- Варіант Б (з репозиторію): New site → Import from GitHub → build command порожня, publish directory `.`; `netlify.toml` підхопить заголовки, кеш і 404.
- Варіант В (CLI): `npm i -g netlify-cli`, `netlify login`, `netlify deploy --prod --dir .`.

### Vercel

- Імпорт репозиторію на https://vercel.com/new, framework preset — Other, build command порожня, output directory `.`; `vercel.json` застосується автоматично.
- Або CLI: `npm i -g vercel`, `vercel login`, `vercel --prod`.

### Apache / cPanel

Завантажте вміст `deploy/wasfi-test-site.zip` у `public_html` і розпакуйте. `.htaccess` уже всередині.

## Зміст проєкту
- `index.html` — головна сторінка з героєм, розділом про ресторан, specials, catering і контактами.
- `menu.html` — окрема сторінка меню з пошуком, категоріями, деталями страв і My Selection.
- `styles.css` — дизайн-токени, адаптивний макет, світла/темна тема, компоненти інтерфейсу.
- `script.js` — логіка теми, пошуку, спеціальних страв, My Selection, фокусу та доступності.
- `config.js` — загальні контактні дані й конфігурація ресторану.
- `menu-data.js` — дані меню та daily specials.
- `assets/img/` — локальні фото страв і фонів у форматі WebP + `og-image.jpg` для соцмереж.
- `favicon.svg` — іконка сайту.
- `404.html` — сторінка помилки 404.
- `robots.txt` і `sitemap.xml` — базові налаштування для індексації.
- `netlify.toml`, `vercel.json`, `.htaccess` — конфігурація хостингу (кожен файл читає лише відповідна платформа).

## Як запустити локально

У папці проєкту виконайте:

```bash
python -m http.server 8000
```

Потім відкрийте:

- http://localhost:8000/
- http://localhost:8000/menu.html

## Де змінювати меню та ціни

Редагуйте записи в `menu-data.js`.

Приклад:

```js
{
  id: "hummos",
  name: "Hummos",
  category: "Mezza",
  price: 7.95,
  description: "Smooth chickpea dip with tahini, olive oil, and warm pita.",
  available: true,
  photo: "https://images.unsplash.com/..."
}
```

Щоб тимчасово приховати страву без видалення, встановіть:

```js
available: false
```

Це важливо для наступного редагування: меню та ціни зберігаються в окремому даному файлі, а дизайн не залежить від конкретних позицій.

## Де змінювати контакти, адресу та заголовок

Відредагуйте `config.js`:

```js
window.WASFI_CONFIG = {
  restaurantName: "Wasfi's Grill & Hookah",
  address: "6110 Richmond Avenue, Houston, TX 77057",
  phone: "713-782-1789",
  email: "management@wasfis.com",
  hours: "Open daily, 11 AM–1 AM"
};
```

## Де змінювати тему

Кольори теми визначені у `styles.css` в блоках `:root` і `:root[data-theme="dark"]`.

Змінюйте:

- `--bg`
- `--text`
- `--accent`
- `--surface`
- `--line`

## Як міняти фото

Для кожної позиції в `menu-data.js` є поле `photo`.

Також можна змінити фонові зображення в `styles.css` для головної сторінки.

Для локального зберігання вже є папка `assets/img/` — підставляйте відносні шляхи, наприклад `assets/img/hummos.webp`. Формат WebP дає менший розмір файлу; якщо потрібен JPG, просто замініть розширення у `menu-data.js`.

## Як зробити резервну копію й відновити попередню версію

- зберігайте копію папки проєкту перед змінюванням ключових файлів;
- зберігайте версії в Git або zip-архіві;
- для повернення просто замініть файли з резервної копії й оновіть сторінку у браузері.

## Розгортання

Цей проєкт не потребує особистого облікового запису або бекенду. Його можна розгорнути на будь-якому статичному хостингу:

- **Netlify** — підключіть папку або репозиторій; `netlify.toml` уже містить заголовки безпеки, кешування, редірект `/index.html` → `/` і власну 404-сторінку.
- **Vercel** — імпортуйте папку як статичний проєкт; налаштування беруться з `vercel.json`.
- **Apache / cPanel** — завантажте файли в `public_html`; `.htaccess` додає 404, кеш, стиснення та заголовки безпеки.
- **GitHub Pages** — опублікуйте папку як є; файли `netlify.toml`, `vercel.json` і `.htaccess` просто ігноруються.

### Домен

У метаданих, `robots.txt` і `sitemap.xml` уже прописано `https://www.wasfis.com`. Якщо сайт буде на іншому домені, замініть це значення в:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD;
- `menu.html` — `canonical`, `og:url`, `og:image`, `twitter:image`;
- `robots.txt` — рядок `Sitemap:`;
- `sitemap.xml` — обидва `<loc>`.

### Що вже зроблено для хостингу

- локальні фото в `assets/img/` (WebP, без залежності від Unsplash);
- `favicon.svg`, `theme-color` для світлої й темної теми;
- Open Graph і Twitter Card з абсолютним `og-image.jpg` (1200×630);
- JSON-LD розмітки `Restaurant` на головній;
- `robots.txt` без індексації 404 та `sitemap.xml` з датами;
- заголовки безпеки (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`);
- довге кешування для `assets/`, тижневе для CSS/JS, без кешу для HTML;
- стиснення та редірект `/index.html` → `/`.

### Перед продакшном обов'язково перевірте

- актуальні ціни та наявність продуктів;
- години роботи;
- офіційний сайт і соціальні посилання (зараз Instagram і Facebook ведуть на головні сторінки мереж);
- домен, DNS і HTTPS (у `.htaccess` є закоментований редірект на HTTPS — увімкніть після випуску сертифіката);
- SEO метадані та індексацію;
- що фото страв відповідають реальним стравам ресторану.

## Важливий статус

Це фронтенд-прототип для підтвердження дизайну, структури та поведінки. До офіційного запуску необхідно повторно підтвердити меню, ціни, години роботи та контактні дані з рестораном.

У проєкті не використано фейкові checkout, реєстрацію, платіжні форми або впровадження аналітики без явної потреби.
