import { setIntervalAsync } from "set-interval-async";
import { getUSDprice } from "../api/getPrice";

import { PriceController } from "../controller/db/price";
import { ChartController } from "../controller/db/chart";

import { getOwner } from "../archway/signer";
import { Price } from "../model/price";
import { BettingController } from "../controller/db/betting";
import { sendToAll } from "../ws/server";

export const PriceUpdate = async () => {
  const priceController = new PriceController();
  const chartController = new ChartController();
  const bettingController = new BettingController();
  const { owner, owner2 } = await getOwner();
  let who = true;
  const now = new Date();
  const nextMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1,
    0
  );
  const msUntilNextMinute = nextMinute.getTime() - now.getTime();
  setTimeout(() => {
    setIntervalAsync(async () => {
      try {
        const { price, symbol, date, timestamp, onTime } = await getUSDprice();
        let height: number, transactionHash: string;
        let winners: Array<any>;
        let roundPrice: number;
        switch (who) {
          case true:
            ({ height, transactionHash, winners, roundPrice } =
              await owner.setting(price));
            who = false;
            break;
          case false:
            ({ height, transactionHash, winners, roundPrice } =
              await owner2.setting(price));
            who = true;
            break;
          default:
            break;
        }
        console.log(height);
        console.log(winners);
        await bettingController.updateWinner(height, winners, roundPrice);
        bettingController.updateLose(height, roundPrice);

        const priceData = new Price();
        priceData.symbol = symbol;
        priceData.timestamp = timestamp;
        priceData.blockHeight = height.toString();
        priceData.transactionHash = transactionHash;
        priceData.price = price;
        priceData.onTime = onTime;
        await priceController.save(priceData);

        if (onTime) {
          const recentPrices = await priceController.getRecentPrices();
          const newChart = await chartController.makeChartByPrice(
            recentPrices,
            symbol,
            timestamp,
            date
          );
          const response = {
            method: "new_chart",
            data: newChart,
          };
          console.log("Send To All", response);
          sendToAll(response);
        }
      } catch (err) {
        console.log(err);
      }
    }, 5000);
  }, msUntilNextMinute);
};
let who = true;
export const PriceUpdate2 = async () => {
  const priceController = new PriceController();
  const chartController = new ChartController();
  const bettingController = new BettingController();

  try {
    const { owner, owner2 } = await getOwner();
    const { price, symbol, date, timestamp, onTime } = await getUSDprice();
    let height: number, transactionHash: string;
    let winners: Array<any>;
    let roundPrice: number;
    switch (who) {
      case true:
        ({ height, transactionHash, winners, roundPrice } = await owner.setting(
          price
        ));
        who = false;
        break;
      case false:
        ({ height, transactionHash, winners, roundPrice } =
          await owner2.setting(price));
        who = true;
        break;
      default:
        break;
    }

    await bettingController.updateWinner(height, winners, roundPrice);
    bettingController.updateLose(height, roundPrice);

    const priceData = new Price();
    priceData.symbol = symbol;
    priceData.timestamp = timestamp;
    priceData.blockHeight = height.toString();
    priceData.transactionHash = transactionHash;
    priceData.price = price;
    priceData.onTime = onTime;
    await priceController.save(priceData);

    if (onTime) {
      const recentPrices = await priceController.getRecentPrices();
      const newChart = await chartController.makeChartByPrice(
        recentPrices,
        symbol,
        timestamp,
        date
      );
      const response = {
        method: "new_chart",
        data: newChart,
      };
      console.log("Send To All", response);
      sendToAll(response);
    }
  } catch (err) {
    console.log(err);
  }
};
