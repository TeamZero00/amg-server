import { In, LessThan, Not } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Betting, Status } from "../../model/betting";
import { Winner } from "../../archway/signer";
import { AccountController } from "./account";

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
  ) {
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
        betting.winAmount = Number(winner.amount);
        betting.roundPrice = roundPrice;
        this.bettingRepository.save(betting);
        await this.accountController.updateWinAmount(
          winner.address,
          Number(winner.amount)
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
  async updateLose(height: number, roundPrice: number) {
    try {
      await this.bettingRepository.update(
        {
          targetHeight: LessThan(height),
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

  async NowBettingGame() {
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

  async UserBettingList(address: string) {
    try {
      const betting = await this.bettingRepository.findOne({
        where: {
          account: { address },
        },
      });
      return betting;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
}
