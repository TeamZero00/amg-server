import { getClient } from "../archway/client";
import { sendToAll } from "../ws/server";
let poolBalance = 0;
export const sendPool = async () => {
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
