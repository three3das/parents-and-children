// middleware/auth.js
// Простая проверка авторизации (адаптируйте под вашу систему)

const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

// Проверка активной подписки (middleware для защищённых роутов)
const { getActiveSubscription } = require('../services/subscriptions');

async function requireSubscription(req, res, next) {
  const sub = await getActiveSubscription(req.user.id);
  if (!sub) {
    return res.status(403).json({
      error: 'Требуется активная подписка',
      code:  'SUBSCRIPTION_REQUIRED',
    });
  }
  req.subscription = sub;
  next();
}

module.exports = { requireAuth, requireSubscription };
