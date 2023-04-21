import { AppDataSource } from "../../data-source";
import { Chart } from "../../model/chart";
import { Price } from "../../model/price";

export class ChartController {
  private chartRepository = AppDataSource.getRepository(Chart);
  async recentChart(): Promise<Chart> {
    const recentChart = await this.chartRepository
      .createQueryBuilder("chart")
      .orderBy("id", "DESC")
      .getOne();
    return recentChart;
  }
  async recentCharts(): Promise<Chart[]> {
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
    const chart = new Chart();
    chart.open = open;
    chart.close = close;
    chart.high = high;
    chart.low = low;
    chart.date = date;
    chart.timestamp = timestamp;

    // await this.chartRepository.save(newChart);
    return chart;
  }
  async save(chart: Chart) {
    await this.chartRepository.save(chart);
  }
}
