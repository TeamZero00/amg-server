import { setIntervalAsync } from "set-interval-async";
import { getUSDprice } from "../api/getPrice";

import { PriceController } from "../controller/db/price";
import { ChartController } from "../controller/db/chart";

import { getOwner } from "../archway/signer";
import { Price } from "../model/price";
import { BettingController } from "../controller/db/betting";
import { sendToAll } from "../ws/server";

export const PriceUpdate = async (who: boolean) => {
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
    console.log(winners);
    if (winners.length >= 1) {
      sendToAll({
        method: "new_winners",
        data: {
          winners,
          height,
        },
      });
    }

    console.log("timestamp", timestamp);
    console.log("height", height);
    console.log("price", roundPrice);
    const priceData = new Price();
    priceData.symbol = symbol;
    priceData.timestamp = timestamp;
    priceData.blockHeight = height.toString();
    priceData.transactionHash = transactionHash;
    priceData.price = price;
    priceData.onTime = onTime;
    await priceController.save(priceData);

    console.log("winners", winners);
    await bettingController.updateWinner(height, winners, roundPrice);
    await bettingController.updateLose(height, roundPrice);
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
