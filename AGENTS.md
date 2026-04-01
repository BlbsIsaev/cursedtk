# AGENTS.md

## Коротко о проекте
Проект — простая платформа «рынок фермеров»: FastAPI‑бэкенд с JWT‑аутентификацией и фронтенд на чистом HTML/CSS/JS. Фронт обращается к API на `http://localhost:8000` и рендерит страницы без сборщика.

## Архитектура (высокий уровень)
- **Backend (FastAPI + SQLAlchemy)**: REST API для регистрации/логина, товаров, заказов и списка фермеров.
- **Frontend (static)**: `index.html` + `auth.js`/`app.js`/`products.js` + `styles.css`.
- **DB**: MySQL (строка подключения задана в `backend/app/config.py`).

## Структура репозитория
- `backend/app/main.py`: приложение FastAPI и все HTTP‑эндпоинты.
- `backend/app/models.py`: SQLAlchemy модели `User`, `Product`, `Order`, `OrderItem`.
- `backend/app/schemas.py`: Pydantic‑схемы для запросов/ответов.
- `backend/app/crud.py`: операции с БД и вычисление итогов заказов.
- `backend/app/auth.py`: хеширование паролей, JWT, получение текущего пользователя.
- `backend/app/database.py`: engine/Session и dependency `get_db`.
- `backend/app/config.py`: настройки (DB URL, JWT секрет, алгоритм, TTL).
- `frontend/index.html`: одно‑страничная разметка со скрываемыми секциями.
- `frontend/auth.js`: регистрация, логин, хранение токена, состояние пользователя; простая корзина в `localStorage`.
- `frontend/app.js`: загрузка товаров/фермеров/кабинета и добавление товара.
- `frontend/products.js`: фильтр категории.
- `frontend/styles.css`: стили.

## Основная логика (backend)
- **Инициализация**: `models.Base.metadata.create_all(bind=engine)` создаёт таблицы при старте.
- **Регистрация**: `POST /register` → проверка уникальности email/username → `crud.create_user` с хешированием пароля.
- **Логин**: `POST /token` → проверка пароля → выдача JWT (`sub = username`).
- **Текущий пользователь**: `GET /users/me` → `auth.get_current_user` валидирует JWT.
- **Товары**:
  - `GET /products` → список товаров.
  - `POST /products` → только для фермеров (проверка `is_farmer`).
  - `GET /farmers/{farmer_id}/products` → товары конкретного фермера.
- **Заказы**: `POST /orders` → создаёт заказ и позиции, считает `total_amount` по ценам товаров.
- **Фермеры**: `GET /farmers` → список пользователей с `is_farmer = true`.
- **Healthcheck**: `GET /health` → простой статус.

## Основная логика (frontend)
- **Навигация**: одна HTML‑страница; переключение секций через `showPage`.
- **Аутентификация**: форма логина → `POST /token`, сохранение `token` в `localStorage`, запрос `GET /users/me`.
- **Регистрация**: `POST /register`.
- **Товары и фермеры**: `GET /products`, `GET /farmers`.
- **Кабинет**: показывает данные пользователя и его товары (`GET /farmers/{id}/products`).
- **Добавление товара**: `POST /products` с `Authorization: Bearer <token>`.
- **Корзина**: хранится в `localStorage` (без серверной синхронизации).

## Ключевые связи данных
- `User (1) -> Product (N)` через `farmer_id`.
- `User (1) -> Order (N)` через `customer_id`.
- `Order (1) -> OrderItem (N)`.
- `Product (1) -> OrderItem (N)`.

## Конфигурация и зависимости
- `backend/requirements.txt` 
- Настройки берутся из `backend/app/config.py` и `.env` (если есть).


