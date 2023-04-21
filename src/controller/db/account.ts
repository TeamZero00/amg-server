import { AppDataSource } from "../../data-source";
import { Account } from "../../model/account";

export class AccountController {
  private accountRepository = AppDataSource.getRepository(Account);

  async create(account: Account) {
    return await this.accountRepository.save(account);
  }
  async getAccount(address: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { address },
    });
    return account;
  }

  async updateWinAmount(address: string, winAmount: number) {
    const account = await this.accountRepository.findOne({
      where: { address },
    });
    account.prizeAmount += winAmount;
    await this.accountRepository.save(account);
  }

  async updateBalance(address: string, amount: number, operator: string) {
    const account = await this.accountRepository.findOne({
      where: { address },
    });
    switch (operator) {
      case "+":
        account.balance += amount;
        break;
      case "-":
        account.balance -= amount;
        if (account.balance < 0) {
          account.balance = 0;
        }
        break;
      default:
        break;
    }

    return await this.accountRepository.save(account);
  }
}
