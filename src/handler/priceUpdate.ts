import { getUSDprice } from "../api/getPrice";

import { PriceController } from "../controller/db/price";
import { ChartController } from "../controller/db/chart";

import { getOwner } from "../archway/signer";
import { Price } from "../model/price";
import { BettingController } from "../controller/db/betting";
import { sendToAll } from "../ws/server";
import { Chart } from "../model/chart";

const priceController = new PriceController();
const chartController = new ChartController();
const bettingController = new BettingController();
let high = 0;
let low = 2;
let open = 0;

export const PriceUpdate = async (who: boolean) => {
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

    const chart = new Chart();
    chart.symbol = symbol;
    chart.timestamp = timestamp;

    chart.date = new Date(date);
    chart.open = open.toString();
    chart.high = high.toString();
    chart.low = low.toString();
    if (parseFloat(price) > high) {
      high = Number(price);
      chart.high = price;
    }

    if (parseFloat(price) < low) {
      low = Number(price);
      chart.low = price;
    }
    chart.close = price;
    sendToAll({
      method: "new_chart",
      data: {
        chart,
        price,
      },
    });
    console.log(winners);

    console.log("timestamp: ", timestamp);
    console.log("height: ", height);
    console.log("price: ", price);

    const sendData = {
      method: "new_chart",
      data: {
        chart,
        price,
      },
    };
    console.log(sendData);
    sendToAll(sendData);
    if (winners.length != 0) {
      sendToAll({
        method: "new_winners",
        data: {
          winners,
          height,
        },
      });
    }

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
      await chartController.save(chart);
      high = 0;
      low = 2;
      open = Number(chart.close);
    }
  } catch (err) {
    console.log(err);
  }
};
