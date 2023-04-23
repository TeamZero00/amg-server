import WebSocket from "ws";
import { ChartController } from "../controller/db/chart";
import { BettingController } from "../controller/db/betting";
import { getClient } from "../archway/client";
import { PriceController } from "../controller/db/price";
interface sendData {
  method: string;
  data: Object;
}
const wss = new WebSocket.Server({
  port: 8080,
  perMessageDeflate: false,
});

const chartController = new ChartController();
const bettingController = new BettingController();
const priceController = new PriceController();
wss.on("connection", async (ws) => {
  console.log("client connected");
  const client = await getClient();
  const pool = await client.getBankPool();
  const nowGame = await bettingController.NowBettingGame();
  const nowGameTotal = nowGame.reduce((sum, cur) => {
    return sum + cur.amount;
  }, 0);
  const sendData = {
    method: "init",
    data: {
      chart: await chartController.recentCharts(),
      game: await bettingController.recentBettingList(),
      pool: {
        balance: pool.balance,
        nowGame: nowGameTotal,
      },

      price: await priceController.get24HourPrice(),
    },
  };
  ws.send(JSON.stringify(sendData));
  ws.on("close", () => {
    console.log("client disconnected");
  });
});

export function sendToAll(data: sendData) {
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
export default wss;
