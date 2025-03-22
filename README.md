# Workspace Assistant

Интеллектуальный ассистент для Google Workspace, который помогает управлять электронной почтой с помощью AI.

## Возможности

- Просмотр и управление электронной почтой
- Умная сортировка и фильтрация писем
- Современный и удобный интерфейс
- Интеграция с Gmail API

## Технологии

- Next.js 14
- React
- TypeScript
- Material UI
- Google APIs

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/workspace-assistant.git
cd workspace-assistant
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте проект в Google Cloud Console:
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com)
   - Создайте новый проект
   - Включите Gmail API
   - Создайте учетные данные OAuth 2.0
   - Скачайте учетные данные

4. Создайте файл `.env.local` и добавьте ваши учетные данные:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

5. Запустите приложение:
```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

## Структура проекта

```
workspace-assistant/
├── app/
│   ├── components/     # React компоненты
│   ├── hooks/         # Пользовательские хуки
│   ├── services/      # Сервисы для работы с API
│   └── pages/         # Страницы приложения
├── public/            # Статические файлы
└── package.json       # Зависимости и скрипты
```

## Лицензия

MIT
