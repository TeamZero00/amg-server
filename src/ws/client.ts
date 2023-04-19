import { ReconnectingSocket } from "@cosmjs/socket";
import { PriceUpdate } from "../handler/priceUpdate";
import { BettingUpdate } from "../handler/bettingUpdate";
import { BettingController } from "../controller/db/betting";
import { sendToAll } from "./server";
import { getClient } from "../archway/client";
import { PriceController } from "../controller/db/price";
import _ from "lodash";
const method = {
  jsonrpc: "2.0",
  method: "subscribe",
  id: 0,
  params: {
    query: "tm.event='NewBlock'",
  },
};

const ws = new ReconnectingSocket(
  "wss://rpc.constantine-2.archway.tech/websocket"
);
let who = true;
export default async function ArchwaySocket() {
  try {
    console.log("Socket Start");
    ws.connect();
    ws.queueRequest(JSON.stringify(method));
    ws.events.subscribe({
      next: async (data) => {
        await PriceUpdate(who);
        await BettingUpdate();
        await sendPrice();
        await sendPool();
        await sendBettingList();
        who = !who;
      },
      error: (err) => {
        console.log("disconnect");
        throw new Error(`Socket Disconnect\n ${err}`);
      },
      complete: () => {
        console.log("connected");
      },
    });
  } catch (err) {
    console.log("Archway Socket Error");
    console.log(err);
  }
}

let bettingList = [];
const sendBettingList = async () => {
  const bettingController = new BettingController();
  try {
    const newBettingLIst = await bettingController.recentBettingList();
    let isEqual = true;
    for (let i = 0; i < newBettingLIst.length; i++) {
      if (
        JSON.stringify(newBettingLIst[i]) !== JSON.stringify(bettingList[i])
      ) {
        isEqual = false;
        break;
      }
    }
    if (!isEqual) {
      bettingList = newBettingLIst;
      sendToAll({ method: "betting_update", data: newBettingLIst });
    }
  } catch (err) {
    console.log("sendBetting Error");
    console.log(err);
  }
};

let poolBalance = 0;
const sendPool = async () => {
  try {
    const client = await getClient();

    const pool = await client.getBankPool();

    if (Number(pool.balance) != poolBalance) {
      poolBalance = Number(pool.balance);
      const sendData = {
        method: "new_pool",
        data: pool.balance,
      };
      sendToAll(sendData);
    }
  } catch (err) {
    console.log(err);
  }
};

const sendPrice = async () => {
  try {
    const priceController = new PriceController();
    const prices = await priceController.get24HourPrice();

    sendToAll({ method: "price_update", data: prices });
  } catch (err) {
    console.log("sendPirce Error");
    console.log(err);
  }
};
