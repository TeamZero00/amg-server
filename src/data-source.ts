import "reflect-metadata";
import { DataSource } from "typeorm";

import { DBConfig } from "./config";
import { Chart } from "./model/chart";
import { Price } from "./model/price";
import { Account } from "./model/account";
import { Betting } from "./model/betting";

// import { User } from "./model/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DBConfig.host,
  port: Number(DBConfig.port),
  username: DBConfig.username,
  password: DBConfig.password.toString(),
  database: DBConfig.database,
  synchronize: true,
  logging: false,
  entities: [Price, Chart, Account, Betting],
  migrations: [],
  subscribers: [],
});
