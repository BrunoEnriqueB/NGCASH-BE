import { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

export default function isUserAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing bearer token' });

  const jwtSecret = process.env.JWT_SECRET ?? '';
  try {
    if (!jsonwebtoken.verify(token, jwtSecret))
      return res.status(400).json({ message: 'User not authorized' });

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid bearer token' });
  }
}
