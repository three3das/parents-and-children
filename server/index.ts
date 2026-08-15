import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import XLSX from "xlsx";
import paymentsRouter from "./routes/payments";

// Load environment variables from .env file
dotenv.config({ override: true });

const app = express();

// ─── ВАЖНО: webhook должен быть ДО express.json() ────────────────────────────
// NOWPayments отправляет сырой body — его нельзя парсить через JSON
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the root public directory
const publicPath = path.resolve(import.meta.dirname, "..", "public");
if (fs.existsSync(publicPath)) {
  app.use("/images", express.static(path.join(publicPath, "images")));
  app.use("/audio", express.static(path.join(publicPath, "audio")));
}

// Serve static files from the /static directory (audio files structured by topic,
// e.g. static/audio/ishvara/A.mp3)
const staticPath = path.resolve(import.meta.dirname, "..", "static");
if (fs.existsSync(staticPath)) {
  app.use("/static", express.static(staticPath));
}

// ─── API: путь к аудио читается динамически из .xlsx-файла ───────────────────
// Ячейка B2 в файле "sabda.xlsx" хранит веб-путь к аудио-файлу
// (например, /static/audio/ishvara/A.mp3).
app.get("/api/audio/ishvara", (req, res) => {
  try {
    const xlsxPath = path.join(
      staticPath,
      "audio",
      "ishvara",
      "sabda.xlsx"
    );

    if (!fs.existsSync(xlsxPath)) {
      return res.status(404).json({ error: "xlsx file not found" });
    }

    const workbook = XLSX.readFile(xlsxPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const cellValue = String(sheet["B2"]?.v ?? "").trim();

    if (!cellValue) {
      return res.status(404).json({ error: "path not found in cell B2" });
    }

    res.json({ path: cellValue });
  } catch (err) {
    console.error("Error reading xlsx:", err);
    res.status(500).json({ error: "failed to read xlsx file" });
  }
});

// ─── Подключить роутер платежей ───────────────────────────────────────────────
app.use("/api/payments", paymentsRouter);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ─── Запустить фоновые задачи (проверка истёкших подписок) ───────────────
  const { startCronJobs } = await import("./services/cron");
  startCronJobs();

  // ─── Запустить Telegram-бота (уведомления администратору о регистрации
  // и о нажатии "Оплачено", с кнопками Разрешить/Отменить) ──────────────────
  const { startTelegramBot } = await import("./telegram");
  startTelegramBot();

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();