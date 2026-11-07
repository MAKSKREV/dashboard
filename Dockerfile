FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY .npmrc ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем фронтенд
RUN npm run build

# Экспортируем порты
EXPOSE 3001 5173

# Запускаем оба сервера
CMD ["sh", "-c", "node server.js & npm run preview"]
