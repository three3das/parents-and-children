# 💳 Крипто-подписки для Knowledge Children
## Node.js + Express + PostgreSQL + NOWPayments (USDT TRC20)

---

## 📁 Структура файлов в проекте

```
Knowledge Children/
├── migrations/
│   └── 001_subscriptions.sql     ← SQL для создания таблиц
├── server/
│   ├── middleware/
│   │   └── auth.js               ← requireAuth + requireSubscription
│   ├── routes/
│   │   └── payments.js           ← Роуты /api/payments/*
│   └── services/
│       ├── nowpayments.js        ← API-клиент NOWPayments
│       ├── subscriptions.js      ← Логика подписок в БД
│       └── cron.js               ← Фоновые задачи
└── README.md                     ← этот файл
```

---

## 🚀 Шаг 1: Установка зависимостей

```bash
npm install node-cron pg jsonwebtoken
```

---

## 🔑 Шаг 2: Переменные окружения (.env)

```env
# NOWPayments — получить на https://nowpayments.io → API Keys
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# URL вашего сайта (без слеша в конце)
APP_URL=https://knowledge-children.onrender.com

# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT (уже должен быть)
JWT_SECRET=your_jwt_secret
```

---

## 🗄️ Шаг 3: Применить миграцию

```bash
psql $DATABASE_URL -f migrations/001_subscriptions.sql
```

---

## ⚙️ Шаг 4: Подключить в server/index.ts

```javascript
// server/index.ts

// ВАЖНО: этот middleware должен быть ДО express.json()
app.use(
  '/api/payments/webhook',
  require('express').raw({ type: 'application/json' })
);

// Остальные роуты используют JSON
app.use(express.json());

// Подключить роутер платежей
app.use('/api/payments', require('./routes/payments'));

// Запустить фоновые задачи
require('./services/cron').startCronJobs();
```

---

## 🌐 Шаг 5: Настроить IPN в NOWPayments

1. Войдите на https://nowpayments.io
2. Перейдите: **Store Settings → IPN (Instant Payment Notification)**
3. Укажите URL: `https://knowledge-children.onrender.com/api/payments/webhook`
4. Скопируйте **IPN Secret** → вставьте в `.env` как `NOWPAYMENTS_IPN_SECRET`

---

## 📡 API эндпоинты

### Создать инвойс для оплаты
```
POST /api/payments/create-invoice
Authorization: Bearer <token>
Content-Type: application/json

{ "plan": "lifetime" }

→ 200 OK
{
  "invoiceUrl": "https://nowpayments.io/payment/?iid=...",
  "orderId": "sub_42_monthly_1712345678",
  "amountUsd": 5,
  "expiresAt": "2026-04-04T12:00:00Z"
}
```

### Получить статус подписки
```
GET /api/payments/status
Authorization: Bearer <token>

→ 200 OK
{
  "active": true,
  "plan": "monthly",
  "expiresAt": "2026-05-03T10:00:00Z",
  "startedAt": "2026-04-03T10:00:00Z"
}
```

---

## 🖥️ Фронтенд (React)

```jsx
// Кнопка "Оформить подписку"
async function handleSubscribe() {
  const res = await fetch('/api/payments/create-invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ plan: lifetime }),
  });

  const { invoiceUrl } = await res.json();

  // Открываем страницу оплаты NOWPayments
  window.open(invoiceUrl, '_blank');
}
```

```jsx
// Проверка подписки при загрузке страницы
useEffect(() => {
  fetch('/api/payments/status', {
    headers: { 'Authorization': `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => setHasSubscription(data.active));
}, []);
```

---

## 🛡️ Защита контента подпиской

```javascript
// Любой защищённый роут
const { requireAuth, requireSubscription } = require('./middleware/auth');

app.get('/api/premium/content',
  requireAuth,
  requireSubscription,
  (req, res) => {
    res.json({ content: 'Только для подписчиков!' });
  }
);
```

---

## 💰 Цены (настроить в server/services/subscriptions.js)

| План    | Цена USD | Дней |
|---------|----------|------|
| lifetime | $1 | навсегда ♾️ |


---

## 💸 Почему USDT TRC20, а не ERC20

| | TRC20 ✅ | ERC20 ❌ |
|---|---|---|
| Комиссия пользователя | ~$0.50 | $5–30 |
| Итого из кармана при подписке $1 | ~$1.50 | $6–31 |
| Подходит для подписок $1 | ✅ Да | ❌ Нет |

---

## ⚠️ Налоги (Украина, ФОП)

- Каждый поступивший платёж = доход по курсу НБУ на дату получения
- Фиксируйте: дата, сумма USDT, курс, order_id
- При выводе через WhiteBIT/Kuna — также курс конвертации
- Таблица `crypto_payments` хранит всё необходимое для отчётности
- Рекомендуется выводить средства накопив от $50–100 (комиссия ~2%)
