import { Accounts } from '@prisma/client';
import prismaClient from '../config/db';
import UserService from './UserServices';

class AccountsService {
  public static async getAccountById(accountId: number) {
    const account = await prismaClient.accounts.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  public static async getAccountByUsername(
    username: string
  ): Promise<Accounts> {
    try {
      const user = await UserService.getUser(username);

      const account = await prismaClient.accounts.findUnique({
        where: { id: user.id },
      });
      return account!;
    } catch (error) {
      throw error;
    }
  }

  public static async updateBalance(accountId: number, balance: number) {
    try {
      const account = await prismaClient.accounts.update({
        where: { id: accountId },
        data: { balance },
      });

      return account;
    } catch (error) {
      throw error;
    }
  }
}

export default AccountsService;
