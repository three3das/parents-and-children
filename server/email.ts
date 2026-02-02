import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Read env vars at runtime, not at module load time
function getConfig() {
  return {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@kidread.com',
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
      from: config.fromEmail,
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

  return sendEmail({ to: email, subject, text, html });
}
