import { In, LessThan, Not } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Betting, Status } from "../../model/betting";
import { Winner } from "../../archway/signer";
import { AccountController } from "./account";
import { Account } from "../../model/account";

export class BettingController {
  private bettingRepository = AppDataSource.getRepository(Betting);
  private accountController = new AccountController();
  async create(betting: Betting) {
    return await this.bettingRepository.save(betting);
  }

  async updateWinner(
    targetHeight: number,
    winners: Winner[],
    roundPrice: number
  ): Promise<void> {
    for (const winner of winners) {
      try {
        const betting = await this.bettingRepository.findOne({
          where: {
            account: { address: winner.address },
            targetHeight: targetHeight,
            status: Status.Pending,
          },
        });
        betting.status = Status.Win;
        betting.roundPrice = roundPrice;
        await this.bettingRepository.save(betting);
        await this.accountController.updateWinAmount(
          winner.address,
          Number(winner.amount)
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
  async updateLose(height: number, roundPrice: number): Promise<void> {
    try {
      await this.bettingRepository.update(
        {
          targetHeight: height,
          status: Status.Pending,
        },
        {
          status: Status.Lose,
          winAmount: 0,
          roundPrice,
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  async NowBettingGame(): Promise<Betting[]> {
    try {
      const nowBetting = await this.bettingRepository.find({
        where: { status: Status.Pending },
      });
      //만약 빈배열이라면 빈배열 리턴
      return nowBetting;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async recentBettingList() {
    try {
      const recentBettingList = await this.bettingRepository
        .createQueryBuilder("betting")
        .leftJoinAndSelect("betting.account", "account")
        .orderBy("betting.id", "DESC")
        .limit(100)
        .getMany();

      return recentBettingList.map((betting) => {
        const address = betting.account.address;
        delete betting.id;
        return {
          ...betting,
          account: address,
        };
      });
    } catch (err) {
      console.log("recent betting list GET error");
      console.log(err);
    }
  }

  async UserBettingList(address: string) {
    try {
      // const betting = await this.bettingRepository.find({
      //   where: {
      //     account: { address },
      //   },
      // });
      const BettingList = await this.bettingRepository
        .createQueryBuilder("betting")
        .leftJoinAndSelect("betting.account", address)
        .getMany();
      return BettingList.map((betting) => {
        return {
          ...betting,
          account: address,
        };
      });
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
}
