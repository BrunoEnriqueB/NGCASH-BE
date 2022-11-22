import { NextFunction, Request, Response, Router } from 'express';

import { ZodError } from 'zod';
import jsonwebtoken from 'jsonwebtoken';

import { userData } from '../schemas/userSchemas';
import UserService from '../services/UserServices';
import UserDataToken from '../domain/UserDataToken';
import isUserAuthenticated from '../middlewares/isUserAuthenticated';

const router = Router();

router.post(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    try {
      userData().parse({ username, password });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          error.errors.map((err) => {
            return { error: err.message };
          })
        );
      }
    }

    if (await UserService.userExists(username)) {
      return res
        .status(400)
        .json({ message: 'This username is already in use' });
    }

    try {
      const newUser = await UserService.createUser(username, password);
      res
        .status(200)
        .json({ message: `User ${newUser.username} created successfully` });
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    try {
      userData().parse({ username, password });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          error.errors.map((err) => {
            return { error: err.message };
          })
        );
      }
    }

    try {
      const user = await UserService.login(username, password);

      const jwtSecret = process.env.JWT_SECRET ?? '';
      const token = jsonwebtoken.sign(
        { username: user.username, accountId: user.accountId },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return res.status(200).json({ token });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
    }
  }
);

router.get(
  '/userdata',
  isUserAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] as string;

    try {
      const userData = jsonwebtoken.decode(token) as UserDataToken;
      const user = await UserService.getUser(userData.username);
      const UserAndBalance = await UserService.getUserAndBalance(user.username);

      res.status(200).json(UserAndBalance);
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
    }
  }
);

export default router;
