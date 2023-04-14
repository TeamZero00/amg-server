import axios from "axios";
import { investing } from "investing-com-api";
import { FixerConfig, PolyGonConfig } from "../config";
import { referenceClient, restClient } from "@polygon.io/client-js";
import { realTimeCurrencyConversion } from "@polygon.io/client-js/examples/rest/node_modules/@polygon.io/client-js/lib/rest/forex/realTimeCurrencyConversion";
const rest = restClient(PolyGonConfig.apiKey);

function checkOnTime(time: number): boolean {
  const seconds = new Date(time).getSeconds();
  return seconds === 0;
}

function makeDate() {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = ("0" + (dateObj.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 1을 더해줍니다. 두 자리로 만들기 위해 '0'을 추가하고 slice로 뒤에서 두 자리만 추출합니다.
  const day = ("0" + dateObj.getDate()).slice(-2); // 두 자리로 만들기 위해 '0'을 추가하고 slice로 뒤에서 두 자리만 추출합니다.

  const date = `${year}-${month}-${day}`;
  const timestamp = Math.floor(dateObj.getTime() / 5000) * 5000;
  return { date, timestamp };
}

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
    return {
      price: converted.toString(),
      timestamp,
      symbol: `${from}/${to}`,
      date,
      onTime: checkOnTime(timestamp),
    };
  } catch (err) {
    console.log(err);
  }
}
