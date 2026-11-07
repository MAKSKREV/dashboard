# Reels Dashboard

Монитор динамики видео, подписчиков и монетизации для всех проектов.

## Возможности

- 📊 **Графики в реальном времени**: просмотры, лайки, комментарии, подписчики
- 📈 **Статистика по проектам**: сравнение каналов, топ видео
- 📅 **История публикаций**: когда выложили, какой результат
- 💰 **Монетизация**: доход, CPM, ROI по видео
- 📱 **Мобильная версия**: полный функционал на телефоне

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:5173

## Запуск в Docker

```bash
docker-compose up
```

Доступен на:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Публикация на хостинг

### Railway.app (рекомендуется)
1. github.com/MAKSKREV/dashboard → Settings → Deployments
2. Выбрать Railway → Connect
3. Dashboard автоматически развернётся

### Render.com
```bash
# Создать новый Web Service на Render
# Выбрать GitHub repo dashboard
# Выставить: Start command = npm start
```

### Heroku
```bash
heroku create your-dashboard
git push heroku main
```

## Подключение к reels-studio

Dashboard читает данные из `../reels-studio/data/db.json` и собирает метрики с Instagram/TikTok API.

## Структура

```
src/
  components/      # React компоненты
    Dashboard.jsx  # Главная страница
    MetricCard.jsx # Карточка метрики
    ProjectStats.jsx # Статистика проекта
  api/
    server.js      # Express backend
```
