import { NextFunction, Request, Response, Router } from 'express';
import { ZodError } from 'zod';
import isUserAllowedToTransfer from '../middlewares/isUserAllowedToTransfer';
import isUserAuthenticated from '../middlewares/isUserAuthenticated';
import { transfer } from '../schemas/transactionsSchemas';
import TransactionService from '../services/TransactionsServices';
import UserService from '../services/UserServices';

const router = Router();

router.get(
  '/transfer',
  isUserAuthenticated,
  isUserAllowedToTransfer,
  async (req: Request, res: Response, next: NextFunction) => {
    let transferData;
    try {
      transferData = transfer().parse(req.query);
    } catch (error) {
      const zodError = error as ZodError;

      return res.status(400).json(
        zodError.errors.map((error) => {
          return { error: error.message };
        })
      );
    }

    const { from, to, ammount } = transferData;

    if (from === to) {
      return res
        .status(401)
        .json({ message: 'You are not allowed to transfer to your self' });
    }
    try {
      await TransactionService.transfer(from, to, ammount);

      return res.status(200).json({ message: 'Transfer completed!' });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
    }
  }
);

export default router;
