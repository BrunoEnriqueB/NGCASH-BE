import { Accounts } from '@prisma/client';
import prismaClient from '../config/db';
import TransfersFilters from '../domain/TransfersFilters';
import AccountsService from './AccountServices';
import UserService from './UserServices';

interface TransactionHistory {
  from: string;
  to: string;
  value: number;
  date: Date;
}

class TransactionService {
  public static async transfer(from: string, to: string, ammount: number) {
    let error: Error;
    try {
      if (
        !(await UserService.userExists(from)) ||
        !(await UserService.userExists(to))
      ) {
        throw new Error('Invalid operation, user not found');
      }
      const fromAccount = await AccountsService.getAccountByUsername(from);
      const toAccount = await AccountsService.getAccountByUsername(to);

      if (ammount > fromAccount.balance) {
        throw new Error(
          "You don't have balance enough to complete this transaction"
        );
      }

      await AccountsService.updateBalance(
        fromAccount.id,
        fromAccount.balance - ammount
      );
      await AccountsService.updateBalance(
        toAccount.id,
        toAccount.balance + ammount
      );

      const transaction = await prismaClient.transactions.create({
        data: {
          debitedAccount: fromAccount.id,
          creditedAccount: toAccount.id,
          value: ammount,
        },
      });
      return transaction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  public static async transfers(username: string, filters: TransfersFilters) {
    let account: Accounts;
    try {
      account = await AccountsService.getAccountByUsername(username);
    } catch (error) {
      throw error;
    }

    try {
      let transactions = await prismaClient.transactions.findMany({
        where:
          filters.filterType === 1
            ? {
                OR: [
                  { debitedAccount: account.id },
                  {
                    creditedAccount: account.id,
                  },
                ],
              }
            : filters.filterType === 2
            ? { debitedAccount: account.id }
            : { creditedAccount: account.id },

        include: {
          debitedAccountId: {
            include: {
              Users: true,
            },
          },
          creditedAccountId: {
            include: {
              Users: true,
            },
          },
        },
        orderBy: { createdAt: filters.filterOrder },
      });

      transactions = transactions.filter((transaction) => {
        if (!!filters.filterDate) {
          if (
            transaction.createdAt.toISOString().slice(0, 10) ===
            filters.filterDate.toISOString().slice(0, 10)
          ) {
            return transaction;
          }
        } else {
          return transaction;
        }
      });

      return transactions.map((transaction) => {
        return {
          debitedAccountUsername: transaction.debitedAccountId?.Users?.username,
          creditedAccountUsername:
            transaction.creditedAccountId?.Users?.username,
          value: transaction.value,
          date: transaction.createdAt,
        };
      });
    } catch (error) {
      throw new Error('internal server error');
    }
  }
}

export default TransactionService;
