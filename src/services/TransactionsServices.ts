import prismaClient from '../config/db';
import UserAndBalance from '../domain/UserAndBalance';
import AccountsService from './AccountServices';
import UserService from './UserServices';

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
}

export default TransactionService;
