import { getClient } from "../archway/client";
import { AccountController } from "../controller/db/account";
import { Account } from "../model/account";
import { BettingController } from "../controller/db/betting";
import { Betting } from "../model/betting";

export const BettingUpdate = async () => {
  const client = await getClient();
  const accountController = new AccountController();
  const bettingController = new BettingController();

  console.log("Betting Update");
  try {
    const height = await client.getHeight();

    const promises = [
      await client.getHeightBettingList(height + 30),
      await client.getHeightBettingList(height + 50),
    ];
    const bettingLists = (await Promise.all(promises)).flat();
    console.log(bettingLists);
    // const sendBettingList = [];
    for (const betting of bettingLists) {
      const {
        position,
        amount,
        address,
        base_price,
        start_height,
        target_height,
        win_amount,
      } = betting;

      let account = await accountController.findAccount(address);

      if (!account) {
        const acc = new Account();

        acc.address = betting.address;

        account = await accountController.create(acc);
      }

      const bet = new Betting();

      bet.account = account;
      bet.position = position;
      bet.amount = Number(amount);
      bet.basePrice = Number(base_price) / 100000;
      bet.startHeight = start_height;
      bet.targetHeight = target_height;
      bet.winAmount = Number(win_amount);
      await bettingController.create(bet);
    }
  } catch (err) {
    console.log("Betting Update Error");
    console.log(err);
  }
};
