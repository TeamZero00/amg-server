import express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import redis from "redis";
import PriceRouter from "./router/price";
import AccountRouter from "./router/account";

import { BettingController } from "./controller/db/betting";
import ArchwaySocket from "./ws/client";

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    const port = 4000;

    app.use(bodyParser.json());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cors({ optionsSuccessStatus: 204, methods: "GET" }));
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(cookieParser());
    app.use("/", (req: Request, res: Response) => {});

    app.use("/bet_history/:address", async (req: Request, res: Response) => {
      const address = req.params.address;
      if (address == "" || !address.startsWith("archway1")) {
        res.status(404).send("Invalid address");
      }
      const bettingController = new BettingController();
      const bettingList = await bettingController.UserBettingList(address);

      //만약 없다면 빈배열이 들어감
      res.status(200).send(bettingList);
    });

    app.use("/account", AccountRouter);
    app.listen(port);

    console.log(
      `Express server has started on port ${port}. Open http://localhost:${port}/users to see results`
    );
  })
  .catch((error) => {
    console.log("Postgres Initialize Error");
    console.log(error);
  });

ArchwaySocket();
