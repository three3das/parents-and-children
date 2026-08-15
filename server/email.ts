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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #6366f1; margin: 0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
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
    <p style="word-break: break-all; font-size: 14px; color: #666;">${resetUrl}</p>

    <p><strong>Це посилання дійсне протягом 1 години.</strong></p>

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

export async function sendPaymentNotificationEmail(
  userEmail: string,
  amount: number,
  paymentId: string
): Promise<boolean> {
  const config = getConfig();
  const adminEmail = process.env.ADMIN_EMAIL || config.fromEmail;

  const subject = `Новая заявка на оплату — ${amount} грн`;

  const text = `
Новая заявка на P2P-оплату!

Пользователь: ${userEmail}
Сумма: ${amount} грн
ID заявки: ${paymentId}

Проверьте поступление на карту Приватбанка и подтвердите/отклоните заявку в админ-панели.
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { color: #FFD700; margin: 0; }
    .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .details p { margin: 4px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Новая заявка на оплату</h1>
    </div>

    <div class="details">
      <p><strong>Пользователь:</strong> ${userEmail}</p>
      <p><strong>Сумма:</strong> ${amount} грн</p>
      <p><strong>ID заявки:</strong> ${paymentId}</p>
    </div>

    <p>Проверьте поступление на карту Приватбанка и подтвердите/отклоните заявку в админ-панели.</p>

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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { color: #d14343; margin: 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Доступ не активирован</h1>
    </div>

    <p>Здравствуйте!</p>

    <p>Доступ ко всем данным сайта отменён в связи с отсутствием
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