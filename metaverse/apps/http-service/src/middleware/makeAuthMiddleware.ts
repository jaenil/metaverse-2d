import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is not set");

export function makeAuthMiddleware(requiredRole?: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) { res.status(403).json({ message: 'Unauthorized' }); return; }
        try {
            const { userId, role } = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
            if (requiredRole && role !== requiredRole) { res.status(403).json({ message: 'Forbidden' }); return; }
            req.userId = userId;
            next();
        } catch {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
    }
}

export const userMiddleware = makeAuthMiddleware();
export const adminMiddleware = makeAuthMiddleware("Admin");
