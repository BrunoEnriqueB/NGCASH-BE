import { Accounts, Users } from '@prisma/client';
import prismaClient from '../config/db';
import bcrypt from 'bcrypt';
import UserAndBalance from '../domain/UserAndBalance';
import AccountsService from './AccountServices';

class UserService {
  public static async getUser(username: string): Promise<Users> {
    const user = await prismaClient.users.findFirst({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  public static async userExists(username: string): Promise<boolean> {
    return !!(await prismaClient.users.findFirst({ where: { username } }));
  }

  public static async getUserAndBalance(
    username: string
  ): Promise<UserAndBalance> {
    try {
      const user = await this.getUser(username);

      const account = await AccountsService.getAccountById(user.accountId);

      return {
        username: user.username,
        balance: account.balance,
      };
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }

  public static async createUser(
    username: string,
    password: string
  ): Promise<Users> {
    const newAccount = await prismaClient.accounts.create({
      data: { balance: 100 },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await prismaClient.users.create({
        data: {
          accountId: newAccount.id,
          username,
          password: hashedPassword,
        },
      });
      return newUser;
    } catch (error) {
      await prismaClient.accounts.delete({ where: { id: newAccount.id } });
      throw new Error('Some internal error occurred');
    }
  }

  public static async login(
    username: string,
    password: string
  ): Promise<Users> {
    const user = await this.getUser(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid username or password');
    }
    return user;
  }
}

export default UserService;
