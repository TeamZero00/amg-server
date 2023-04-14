import { NextFunction } from "express";
import { AppDataSource } from "../../data-source";
import { Chart } from "../../model/chart";
import { Price } from "../../model/price";
import { Oracle } from "../../model/oracle";

export class ChartController {
  private chartRepository = AppDataSource.getRepository(Chart);

  async recent(): Promise<Chart[]> {
    //3시간 동안의 차트
    const recentChart = await this.chartRepository
      .createQueryBuilder("chart")
      .orderBy("id", "DESC")
      .limit(180)
      .getMany();
    return recentChart;
  }

  async makeChartByPrice(
    prices: Price[],
    symbol: string,
    timestamp: number,
    date: string
  ) {
    const high = Math.max(...prices.map((p) => parseFloat(p.price))).toString();
    const low = Math.min(...prices.map((p) => parseFloat(p.price))).toString();
    const open = prices[prices.length - 1].price;
    const close = prices[0].price;
    const newChart = {
      symbol,
      timestamp,
      date,
      high,
      low,
      open,
      close,
    };
    await this.chartRepository.save(newChart);
    return newChart;
  }
}
