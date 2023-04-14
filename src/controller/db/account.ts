import { AppDataSource } from "../../data-source";
import { Account } from "../../model/account";

export class AccountController {
  private accountRepository = AppDataSource.getRepository(Account);

  async create(account: Account) {
    return await this.accountRepository.save(account);
  }
  async findAccount(address: string): Promise<Account> {
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
}
