import { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import UserDataToken from '../domain/UserDataToken';

export default function isUserAllowedToTransfer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];

  const userData = jsonwebtoken.decode(token as string) as UserDataToken;
  if (!req.query.from || req.query.from !== userData.username) {
    return res.status(401).json({ message: 'Unathorized operation' });
  }
  next();
}
