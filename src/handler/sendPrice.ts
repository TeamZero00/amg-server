import { PriceController } from "../controller/db/price";
import { sendToAll } from "../ws/server";

export const sendPrice = async () => {
  try {
    const priceController = new PriceController();
    const prices = await priceController.get24HourPrice();

    sendToAll({ method: "price_update", data: prices });
  } catch (err) {
    console.log("sendPirce Error");
    console.log(err);
  }
};
