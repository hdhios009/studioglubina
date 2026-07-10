# Studio Glubina — сайт

Статический сайт: чистые HTML, CSS и JavaScript, без сборки и зависимостей.

## Структура

```
index.html                   главная страница
privacy.html                 политика конфиденциальности
kotiksym-demo.html           демо кейса (встраивается в iframe на главной)
kotiksym-demo-standalone.html демо кейса как отдельная страница
css/style.css                все стили
js/main.js                   вся логика и анимации
images/                      логотип и фоновые изображения
favicon.png, apple-touch-icon.png  иконки сайта
robots.txt, sitemap.xml      SEO-файлы
```

## Запуск локально

Сайт не требует сборки. Достаточно открыть `index.html` в браузере, либо поднять
локальный сервер (рекомендуется, чтобы `fetch`/относительные пути работали как в проде):

```bash
# любой из вариантов
npx serve .
# или
python3 -m http.server 8080
```

Затем открыть `http://localhost:8080`.

## Деплой на GitHub Pages / любой статический хостинг

Файлы уже используют относительные пути — просто загрузите содержимое этой папки
в репозиторий и включите статический хостинг (GitHub Pages, Netlify, Vercel и т.д.)
без дополнительной конфигурации сборки.

Перед публикацией на своём домене обновите `robots.txt`, `sitemap.xml` и
мета-теги `og:url` / `canonical` в `<head>` `index.html`, если домен отличается
от `studioglubina.ru`.

## Форма обратной связи

Форма на странице использует [Formspree](https://formspree.io/) (`action` в `<form>`
в `index.html`). При смене адреса формы или почты — поменяйте `action` там же.
