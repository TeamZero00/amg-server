import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Price } from "../../model/price";
import { SocketSendPrice } from "../../types/types";
interface savePrice {
  id?: number;
  symbol: string;
  timestamp: number;
  date: string;
  blockHeight: string;
  transactionHash: string;
  price: string;
  onTime: boolean;
}

let high = 0;
let low = 0;
export class PriceController {
  private priceRepository = AppDataSource.getRepository(Price);

  async all(): Promise<Price[]> {
    return await this.priceRepository.find();
  }

  async getRecentPrices(): Promise<Price[]> {
    const recentPrices = await this.priceRepository
      .createQueryBuilder("price")
      .orderBy("price.timestamp", "DESC")
      .limit(13)
      .getMany();
    return recentPrices;
  }
  async latestPrice(): Promise<Price> {
    const lastPrice = await this.priceRepository.findOne({
      where: { symbol: "EUR/USD" },
      order: { timestamp: "DESC" },
    });
    return lastPrice;
  }

  async get24HourPrice(): Promise<SocketSendPrice> {
    const now = new Date().getTime();
    const nowTimestamp = Math.floor(now / 5000) * 5000;
    const twentyFourHoursAgo = new Date(
      nowTimestamp - 24 * 60 * 60 * 1000
    ).getTime();
    if (high && low) {
      const highPrice = await this.priceRepository
        .createQueryBuilder("price")
        .where("price.timestamp BETWEEN :start AND :end", {
          start: twentyFourHoursAgo,
          end: nowTimestamp,
        })
        .orderBy("price.price", "DESC")
        .getOne();
      high = Number(highPrice.price);
      const lowPrice = await this.priceRepository
        .createQueryBuilder("price")
        .where("price.timestamp BETWEEN :start AND :end", {
          start: twentyFourHoursAgo,
          end: nowTimestamp,
        })
        .orderBy("price.price", "ASC")
        .getOne();
      low = Number(lowPrice.price);
    }

    const nowPrice = await this.latestPrice();

    if (Number(nowPrice.price) > high) {
      high = Number(nowPrice.price);
    }

    if (Number(nowPrice.price) < low) {
      low = Number(nowPrice.price);
    }

    const befor24HourPrice = await this.priceRepository.findOne({
      where: { timestamp: twentyFourHoursAgo },
    });
    if (!befor24HourPrice) {
      const firstPrice = await this.priceRepository.findOne({
        where: { id: 1 },
      });

      return {
        befor24HourPrice: firstPrice?.price,
        nowPrice: nowPrice?.price,
        highPrice: high.toString(),
        lowPrice: low.toString(),
      };
    }

    return {
      nowPrice: nowPrice.price,
      highPrice: high.toString(),
      lowPrice: low.toString(),
      befor24HourPrice: befor24HourPrice.price,
    };
  }

  async save(price: Price) {
    await this.priceRepository.save(price);
  }
}
