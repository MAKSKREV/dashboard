# Reels Dashboard

Монитор динамики видео, подписчиков и монетизации для всех проектов.

## Возможности

- 📊 **Графики в реальном времени**: просмотры, лайки, комментарии, подписчики
- 📈 **Статистика по проектам**: сравнение каналов, топ видео
- 📅 **История публикаций**: когда выложили, какой результат
- 💰 **Монетизация**: доход, CPM, ROI по видео
- 📱 **Мобильная версия**: полный функционал на телефоне

## 🚀 GitHub Pages (Frontned)

Dashboard автоматически деплоится на GitHub Pages при каждом push:

👉 **https://makskrev.github.io/dashboard/**

Workflow: `.github/workflows/pages.yml` собирает фронтенд и публикует на Pages.

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:5173

## Docker

```bash
docker-compose up
```

## Backend API

Backend работает отдельно (может быть на другом сервере):

```bash
npm install
npm start
```

API доступен на `:3001`

## Подключение к reels-studio

Dashboard читает данные из `../reels-studio/data/db.json` и собирает метрики с Instagram/TikTok API.

## Структура

```
src/
  components/      # React компоненты
    Dashboard.jsx  # Главная страница
    MetricCard.jsx # Карточка метрики
    ProjectStats.jsx # Статистика проекта
server.js          # Express backend
```
