// server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { getActiveSubscription } from "../services/subscriptions";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session || !(req.session as any).userId) {
    return res.status(401).json({ error: "Необходима авторизация" });
  }
  (req as any).userId = (req.session as any).userId;
  next();
}

export async function requireSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).userId;
  const sub = await getActiveSubscription(userId);
  if (!sub) {
    return res.status(403).json({
      error: "Требуется доступ",
      code: "SUBSCRIPTION_REQUIRED",
    });
  }
  (req as any).subscription = sub;
  next();
}
