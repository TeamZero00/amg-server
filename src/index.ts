import express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { AppDataSource } from "./data-source";

import { BettingController } from "./controller/db/betting";
import ArchwaySocket from "./ws/client";
import { AccountController } from "./controller/db/account";

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    const port = 4000;
    const accountController = new AccountController();
    const bettingController = new BettingController();

    app.use(bodyParser.json());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cors({ optionsSuccessStatus: 204, methods: "GET" }));
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(cookieParser());

    // app.use("/deposit/:address");
    app.use("/bet_history/:address", async (req: Request, res: Response) => {
      const address = req.params.address;
      if (address == "" || !address.startsWith("archway1")) {
        res.status(404).send("Invalid address");
      }
      const bettingList = await bettingController.UserBettingList(address);
      //만약 없다면 빈배열이 들어감
      res.status(200).send(bettingList);
    });
    app.use("/deposit", async (req: Request, res: Response) => {
      const { address, amount } = req.body;
      if (address == "" || !address.startsWith("archway1")) {
        res.status(404).send("Invalid address");
      }
      if (parseInt(amount) < 0) {
        res.status(404).send("Invalid amount");
      }
      const account = await accountController.updateBalance(
        address,
        parseInt(amount),
        "+"
      );
      res.status(200).send(account);
    });
    app.use("/withdraw", async (req: Request, res: Response) => {
      const { address, amount } = req.body;
      if (address == "" || !address.startsWith("archway1")) {
        res.status(404).send("Invalid address");
      }
      if (parseInt(amount) < 0) {
        res.status(404).send("Invalid amount");
      }
      const account = await accountController.updateBalance(
        address,
        parseInt(amount),
        "-"
      );
      res.status(200).send(account);
    });
    app.use("/bank", async (req: Request, res: Response) => {
      const address = req.params.address;
      const balance = (await accountController.getAccount(address)).balance;
      const nowGame = await bettingController.NowBettingGame();
      const nowGameTotal = nowGame.reduce((sum, cur) => {
        return sum + cur.amount;
      }, 0);
      res.status(200).send({
        balance,
        nowGameTotal,
      });
    });
    app.use("/score", async (req: Request, res: Response) => {
      const { address } = req.params;
      if (address == "" || !address.startsWith("archway1")) {
        res.status(404).send("Invalid address");
      }
      const account = await accountController.getAccount(address);
      const userPrize = account.prizeAmount;
      const rank = await accountController.getRank();
      res.status(200).send({
        userPrize,
        rank,
      });
    });
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
