import { NextFunction, Request, Response, Router } from 'express';
import { ZodError } from 'zod';

import { transfer, transferQueryParams } from '../schemas/transactionsSchemas';
import TransactionService from '../services/TransactionsServices';
import isUserAuthenticated from '../middlewares/isUserAuthenticated';
import isUserAllowedToTransfer from '../middlewares/isUserAllowedToTransfer';

import getUserWithToken from '../utils/getUserWithToken';
import TransfersFilters from '../domain/TransfersFilters';

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

    if (ammount <= 0) {
      return res
        .status(401)
        .json({ message: 'Ammount must be grather than 0' });
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

router.get(
  '/transfers',
  isUserAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] as string;
    try {
      const filters = transferQueryParams().parse(
        req.query
      ) as TransfersFilters;

      if (filters.filterType < 1 || filters.filterType > 3) {
        return res.status(400).json({
          message: 'Invalid filterType parameter, it must be between 1 and 3',
        });
      }

      try {
        const user = getUserWithToken(token);
        const transactions = await TransactionService.transfers(
          user.username,
          filters
        );

        const sentTransaction = transactions.filter((transaction) => {
          return transaction.debitedAccountUsername === user.username;
        });
        const receivedTransaction = transactions.filter((transaction) => {
          return transaction.debitedAccountUsername !== user.username;
        });

        return res.status(200).json({ sentTransaction, receivedTransaction });
      } catch (error) {
        return res.status(401).json({ error });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          error.errors.map((err) => {
            return { error: err.message };
          })
        );
      }
    }
  }
);

export default router;
