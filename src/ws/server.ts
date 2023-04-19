import WebSocket from "ws";
import { ChartController } from "../controller/db/chart";
import { BettingController } from "../controller/db/betting";
import { getClient } from "../archway/client";
import { PriceController, PriceController } from "../controller/db/price";
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
  const sendData = {
    method: "init",
    data: {
      chart: await chartController.recent(),
      game: await bettingController.recentBettingList(),
      poolBalance: (await client.getBankPool()).balance,
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
