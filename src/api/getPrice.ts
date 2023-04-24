import { PolyGonConfig } from "../config";
import { restClient } from "@polygon.io/client-js";

const rest = restClient(PolyGonConfig.apiKey);

// function checkOnTime(time: number): boolean {
//   const seconds = new Date(time).getSeconds();
//   return seconds === 0;
// }
function checkOnTime(time: number, compare: number): boolean {
  return time !== compare;
}
function makeDate() {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
  const day = ("0" + dateObj.getDate()).slice(-2);

  const date = `${year}-${month}-${day}`;
  // const timestamp = Math.floor(dateObj.getTime() / 5000) * 5000;
  const timestamp = Math.floor(dateObj.getTime() / 60000) * 60000;
  return { date, timestamp };
}

let compare = 0;
export async function getUSDprice() {
  console.log("get price!");
  const from = "EUR";
  const to = "USD";
  try {
    const { converted } = await rest.forex.conversion(from, to, {
      amount: 1,
      precision: 5,
    });

    const { timestamp, date } = makeDate();
    const onTime = checkOnTime(timestamp, compare);

    compare = timestamp;
    return {
      price: converted.toString(),
      timestamp,
      symbol: `${from}/${to}`,
      date,
      onTime,
    };
  } catch (err) {
    console.log(err);
  }
}
