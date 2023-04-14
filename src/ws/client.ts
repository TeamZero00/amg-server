import { ReconnectingSocket } from "@cosmjs/socket";
import { PriceUpdate2 } from "../handler/priceUpdate";
import { BettingUpdate2 } from "../handler/bettingUpdate";
import { sendPrice } from "../handler/sendPrice";
import { sendPool } from "../handler/sendPool";

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
// console.log(ws);
console.log(ws);
export default async function ArchwaySocket() {
  try {
    console.log("Socket Start");
    ws.connect();
    ws.queueRequest(JSON.stringify(method));
    ws.events.subscribe({
      next: async (data) => {
        await PriceUpdate2();
        BettingUpdate2();
        sendPrice();
        sendPool();
      },
      error: (err) => {
        console.log("disconnect");
        throw new Error("Socket Disconnect");
        // console.log(err);
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
