import { setIntervalAsync } from "set-interval-async";
import { getClient } from "../archway/client";
import { AccountController } from "../controller/db/account";
import { Account } from "../model/account";
import { BettingController } from "../controller/db/betting";
import { Betting } from "../model/betting";
import { sendToAll } from "../ws/server";

export const BettingUpdate = async () => {
  const client = await getClient();
  const accountController = new AccountController();
  const bettingController = new BettingController();
  setIntervalAsync(async () => {
    console.log("Betting Update");
    const height = await client.getHeight();

    const promises = [
      await client.getHeightBettingList(height + 30),
      await client.getHeightBettingList(height + 50),
    ];
    const bettingLists = (await Promise.all(promises)).flat();
    bettingLists.forEach(async (betting) => {
      const {
        position,
        amount,
        address,
        base_price,
        start_height,
        target_height,
      } = betting;

      let account = await accountController.findAccount(address);
      if (!account) {
        const acc = new Account();
        acc.address = betting.address;

        //new account 저장

        account = await accountController.create(acc);
      }
      const bet = new Betting();
      bet.account = account;
      bet.position = position;
      bet.amount = Number(amount);

      bet.basePrice = Number(base_price) / 100000;
      bet.startHiehgt = start_height;
      bet.targetHeight = target_height;

      await bettingController.create(bet);
    });
  }, 5000);
};

export const BettingUpdate2 = async () => {
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
    const sendBettingList = [];
    for (const betting of bettingLists) {
      const {
        position,
        amount,
        address,
        base_price,
        start_height,
        target_height,
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
      bet.startHiehgt = start_height;
      bet.targetHeight = target_height;

      await bettingController.create(bet);

      sendBettingList.push({
        position,
        amount,
        status: "pending",
        base_price,
        address,
      });
    }
    if (sendBettingList.length != 0) {
      const sendData = {
        method: "new_betting",
        data: sendBettingList,
      };
      console.log("new betting", sendData);
      sendToAll(sendData);
    }
  } catch (err) {
    console.log("Betting Update Error");
    console.log(err);
  }
};
