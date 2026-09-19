import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  // Необязательный override "от кого" — если не указан, берётся
  // SENDGRID_FROM_EMAIL (адрес по умолчанию, сейчас используется для
  // писем про платежи). Для писем пользователям сайта (сброс пароля
  // и т.п.) передаём отдельный адрес через этот параметр.
  from?: string;
}

// Read env vars at runtime, not at module load time
function getConfig() {
  return {
    apiKey: process.env.SENDGRID_API_KEY,
    // Адрес для писем про платежи (уведомления администратору).
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@kidread.com',
    // Отдельный адрес для писем пользователям сайта (сброс пароля и
    // т.п.) — чтобы не приходили с адреса, в котором явно "payments".
    // Если переменная не задана, используется fromEmail как раньше —
    // ничего не сломается, просто не будет разделения.
    fromEmailNoreply:
      process.env.SENDGRID_FROM_EMAIL_NOREPLY || process.env.SENDGRID_FROM_EMAIL || 'noreply@kidread.com',
    appUrl: process.env.APP_URL || 'http://localhost:5000',
  };
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const config = getConfig();

  if (!config.apiKey) {
    console.log('SendGrid API key not configured. Email would be sent to:', options.to);
    console.log('Subject:', options.subject);
    console.log('---');
    return false;
  }

  try {
    sgMail.setApiKey(config.apiKey);
    await sgMail.send({
      to: options.to,
      from: options.from || config.fromEmail,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error?.response?.body || error);
    return false;
  }
}

// Золотая тема (единая для всех писем проекта): светлый золотой фон,
// золотая рамка контейнера, золотые разделители над/под заголовком и
// подвалом. Кнопка тоже золотая, с тёмным текстом для контраста.
export async function sendPasswordResetEmail(email: string, resetToken: string, firstName: string): Promise<boolean> {
  const config = getConfig();
  const resetUrl = `${config.appUrl}/reset-password?token=${resetToken}`;

  const subject = 'KidRead - Скидання пароля';

  const text = `
Привіт, ${firstName}!

Ви отримали цей лист, тому що хтось запросив скидання пароля для вашого акаунту KidRead.

Щоб скинути пароль, перейдіть за посиланням:
${resetUrl}

Це посилання дійсне протягом 1 години.

Якщо ви не запитували скидання пароля, просто ігноруйте цей лист.

З повагою,
Команда KidRead
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #7a5c00;
      background: #FFF8E1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #FFF8E1;
      border: 3px solid #FFD700;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #FFD700;
    }
    .header h1 {
      color: #FFD700;
      margin: 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }
    p { color: #333; }
    .button {
      display: inline-block;
      background: #FFD700;
      color: #7a5c00;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .link-fallback {
      word-break: break-all;
      font-size: 14px;
      color: #B8860B;
    }
    .note {
      color: #B8860B;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #FFD700;
      font-size: 12px;
      color: #B8860B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 KidRead</h1>
    </div>

    <p>Привіт, <strong>${firstName}</strong>!</p>

    <p>Ви отримали цей лист, тому що хтось запросив скидання пароля для вашого акаунту KidRead.</p>

    <p>Щоб скинути пароль, натисніть на кнопку:</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Скинути пароль</a>
    </p>

    <p>Або скопіюйте це посилання у браузер:</p>
    <p class="link-fallback">${resetUrl}</p>

    <p class="note">Це посилання дійсне протягом 1 години.</p>

    <p>Якщо ви не запитували скидання пароля, просто ігноруйте цей лист.</p>

    <div class="footer">
      <p>З повагою,<br>Команда KidRead</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // ⚠️ Используем fromEmailNoreply, а не fromEmail — чтобы письмо о
  // сбросе пароля не приходило пользователю с адреса, в котором явно
  // "payments" (см. sendPaymentNotificationEmail ниже — та функция
  // по-прежнему использует обычный fromEmail).
  return sendEmail({ to: email, subject, text, html, from: config.fromEmailNoreply });
}

// Золотая тема — письмо администратору о новой регистрации (БЕЗ
// упоминания оплаты — на этом этапе способ оплаты ещё не выбран).
// Отдельная функция от sendPaymentNotificationEmail: их нельзя
// путать, иначе админ не поймёт, на что реагировать (регистрация
// сама по себе не требует никаких действий, в отличие от заявки на
// оплату).
export async function sendRegistrationNotificationEmail(
  userEmail: string
): Promise<boolean> {
  const config = getConfig();
  const adminEmail = process.env.ADMIN_EMAIL || config.fromEmail;

  const subject = 'Новая регистрация на сайте';

  const text = `
Новая регистрация на сайте!

Пользователь: ${userEmail}

Оплата ещё не выбрана — уведомление придёт отдельно, когда пользователь нажмёт "Оплачено".
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #7a5c00;
      background: #FFF8E1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #FFF8E1;
      border: 3px solid #FFD700;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #FFD700;
    }
    .header h1 {
      color: #FFD700;
      margin: 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }
    .details {
      background: #FFF3C4;
      border: 1px solid #FFD700;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .details p {
      margin: 6px 0;
    }
    .details .label {
      color: #B8860B;
      font-weight: bold;
    }
    .details .value {
      color: #333;
    }
    .note {
      color: #B8860B;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #FFD700;
      font-size: 12px;
      color: #B8860B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👤 Новая регистрация</h1>
    </div>

    <div class="details">
      <p><span class="label">Пользователь:</span> <span class="value">${userEmail}</span></p>
    </div>

    <p class="note">Оплата ещё не выбрана — уведомление придёт отдельно, когда пользователь нажмёт «Оплачено».</p>

    <div class="footer">
      <p>Автоматическое уведомление системы регистрации</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Как и у sendPaymentNotificationEmail — уходит только вам
  // (ADMIN_EMAIL), поэтому адрес отправителя менять не нужно.
  return sendEmail({ to: adminEmail, subject, text, html });
}

// Золотая тема — письмо пользователю о том, что регистрация принята.
// Отправляется сразу при регистрации, ещё до выбора способа оплаты.
export async function sendUserRegistrationConfirmationEmail(
  userEmail: string
): Promise<boolean> {
  const config = getConfig();

  const subject = 'Регистрация подтверждена';

  const text = `
Здравствуйте!

Ваша регистрация на сайте parents-and-children успешно зафиксирована.

Дальнейший шаг — оплата доступа. Как только оплата будет подтверждена,
вы получите отдельное письмо с активацией.
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #7a5c00;
      background: #FFF8E1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #FFF8E1;
      border: 3px solid #FFD700;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #FFD700;
    }
    .header h1 {
      color: #FFD700;
      margin: 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }
    p { color: #333; }
    .note {
      color: #B8860B;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #FFD700;
      font-size: 12px;
      color: #B8860B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Регистрация подтверждена</h1>
    </div>

    <p>Здравствуйте!</p>

    <p>Ваша регистрация на сайте <strong>parents-and-children</strong> успешно зафиксирована.</p>

    <p class="note">Дальнейший шаг — оплата доступа. Как только оплата будет подтверждена, вы получите отдельное письмо с активацией.</p>

    <div class="footer">
      <p>Автоматическое уведомление системы регистрации</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Пользовательское письмо — идёт с noreply-адреса, как сброс пароля
  // и остальные письма пользователям, а не с payments@.
  return sendEmail({ to: userEmail, subject, text, html, from: config.fromEmailNoreply });
}

// Реквизиты способов оплаты для писем администратору — те же данные,
// что заданы в PAYMENT_METHODS в PaymentsPage.tsx (карта/кошелёк
// статичны и одинаковы для всех пользователей, поэтому просто
// продублированы здесь). ⚠️ Если номер карты или адрес кошелька
// поменяется на сайте — не забыть поправить и здесь, единого
// источника данных между фронтендом и бэкендом сейчас нет.
type PaymentMethodDetails = {
  label: string;
  card?: string;
  cardFieldLabel?: string; // по умолчанию "Реквизит"
  holder?: string;
};

const PAYMENT_METHOD_DETAILS: Record<string, PaymentMethodDetails> = {
  privatbank_card: {
    label: "карта Приватбанка",
    card: "5168 7451 2747 0224",
    cardFieldLabel: "Номер карты",
    holder: "Урiзко Олександр Леонiдович",
  },
  usdt_trc20: {
    label: "USDT (сеть TRC20)",
    card: "TNVoTnr2VyX4mSDrRjgPqp2Tcw6QiQe3dZ",
    cardFieldLabel: "Адрес кошелька (TRC20)",
  },
};

// Неизвестный или отсутствующий ключ просто выводится как есть (без
// реквизита), чтобы не терять информацию, если появится новый метод,
// а справочник выше забудут обновить.
function getPaymentMethodDetails(method?: string | null): PaymentMethodDetails {
  if (!method) return { label: "не указан" };
  return PAYMENT_METHOD_DETAILS[method] || { label: method };
}

// Golden theme применена по максимуму: фон, рамки, подписи, подвал —
// но сами данные (email, сумма, способ оплаты, реквизит, ID) оставлены
// тёмными для читаемости на светлом золотом фоне.
//
// ⚠️ method обязателен: раньше эта функция вообще не знала способ
// оплаты и текст письма всегда жёстко указывал "карту Приватбанка",
// даже если пользователь на самом деле выбрал оплату криптовалютой —
// это вводило администратора в заблуждение при проверке поступления.
export async function sendPaymentNotificationEmail(
  userEmail: string,
  amount: number,
  paymentId: string,
  method?: string | null
): Promise<boolean> {
  const config = getConfig();
  const adminEmail = process.env.ADMIN_EMAIL || config.fromEmail;
  const details = getPaymentMethodDetails(method);
  const cardFieldLabel = details.cardFieldLabel ?? "Реквизит";

  const subject = `Новая заявка на оплату — ${amount} грн`;

  const text = `
Новая заявка на P2P-оплату!

Пользователь: ${userEmail}
Сумма: ${amount} грн
Способ оплаты: ${details.label}${
    details.card ? `\n${cardFieldLabel}: ${details.card}` : ""
  }${details.holder ? `\nПолучатель: ${details.holder}` : ""}
ID заявки: ${paymentId}

Проверьте поступление (${details.label}) и подтвердите/отклоните заявку в админ-панели.
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #7a5c00;
      background: #FFF8E1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #FFF8E1;
      border: 3px solid #FFD700;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #FFD700;
    }
    .header h1 {
      color: #FFD700;
      margin: 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }
    .details {
      background: #FFF3C4;
      border: 1px solid #FFD700;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .details p {
      margin: 6px 0;
    }
    .details .label {
      color: #B8860B;
      font-weight: bold;
    }
    .details .value {
      color: #333;
    }
    .note {
      color: #B8860B;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #FFD700;
      font-size: 12px;
      color: #B8860B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Новая заявка на оплату</h1>
    </div>

    <div class="details">
      <p><span class="label">Пользователь:</span> <span class="value">${userEmail}</span></p>
      <p><span class="label">Сумма:</span> <span class="value">${amount} грн</span></p>
      <p><span class="label">Способ оплаты:</span> <span class="value">${details.label}</span></p>
      ${
        details.card
          ? `<p><span class="label">${cardFieldLabel}:</span> <span class="value">${details.card}</span></p>`
          : ""
      }
      ${
        details.holder
          ? `<p><span class="label">Получатель:</span> <span class="value">${details.holder}</span></p>`
          : ""
      }
      <p><span class="label">ID заявки:</span> <span class="value">${paymentId}</span></p>
    </div>

    <p class="note">Проверьте поступление (${details.label}) и подтвердите/отклоните заявку в админ-панели.</p>

    <div class="footer">
      <p>Автоматическое уведомление системы платежей</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Здесь fromEmail оставлен как есть (payments@...) — письмо видите
  // только вы сами (адресат — ADMIN_EMAIL), так что нет смысла его менять.
  return sendEmail({ to: adminEmail, subject, text, html });
}

// Та же золотая тема — заголовок остаётся с ⚠️ для ясности сути
// письма, но цветовая палитра унифицирована с остальными двумя
// письмами (вместо прежнего красного оформления).
export async function sendPaymentRejectedEmail(userEmail: string): Promise<boolean> {
  const config = getConfig();

  const subject = "Доступ ко всем данным сайта — не активирован";

  const text = `
Здравствуйте!

Доступ ко всем данным сайта отменён в связи с отсутствием поступления
денежного перевода и активации функции доступа.

Если вы уже оплатили и считаете, что это ошибка — свяжитесь с
администратором сайта, указав дату и способ оплаты.
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #7a5c00;
      background: #FFF8E1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #FFF8E1;
      border: 3px solid #FFD700;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #FFD700;
    }
    .header h1 {
      color: #FFD700;
      margin: 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }
    p { color: #333; }
    .note {
      color: #B8860B;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #FFD700;
      font-size: 12px;
      color: #B8860B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Доступ не активирован</h1>
    </div>

    <p>Здравствуйте!</p>

    <p class="note">Доступ ко всем данным сайта отменён в связи с отсутствием
    поступления денежного перевода и активации функции доступа.</p>

    <p>Если вы уже оплатили и считаете, что это ошибка — свяжитесь с
    администратором сайта, указав дату и способ оплаты.</p>

    <div class="footer">
      <p>Автоматическое уведомление системы платежей</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Используем fromEmailNoreply — это письмо пользователю, а не
  // уведомление администратору, так что логично идёт с того же
  // адреса, что и сброс пароля, а не с payments@.
  return sendEmail({ to: userEmail, subject, text, html, from: config.fromEmailNoreply });
}

// Та же золотая тема — письмо пользователю о том, что заявка на
// оплату подтверждена администратором и доступ уже открыт. Текст —
// ровно как согласовано (без добавления суммы/ID, максимально
// коротко и празднично).
export async function sendPaymentApprovedEmail(userEmail: string): Promise<boolean> {
  const config = getConfig();

  const subject = "Заявка принята — доступ активирован!";

  const text = `
Поздравляем! Ваша заявка Принята!

Доступ ко всем данным сайта parents-and-children уже выполнен!
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #7a5c00;
      background: #FFF8E1;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #FFF8E1;
      border: 3px solid #FFD700;
      border-radius: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #FFD700;
    }
    .header h1 {
      color: #FFD700;
      margin: 0;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
    }
    p { color: #333; }
    .note {
      color: #B8860B;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #FFD700;
      font-size: 12px;
      color: #B8860B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Заявка принята!</h1>
    </div>

    <p class="note">Поздравляем! Ваша заявка Принята!</p>

    <p>Доступ ко всем данным сайта parents-and-children уже выполнен!</p>

    <div class="footer">
      <p>Автоматическое уведомление системы платежей</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Используем fromEmailNoreply — это письмо пользователю, а не
  // уведомление администратору.
  return sendEmail({ to: userEmail, subject, text, html, from: config.fromEmailNoreply });
}