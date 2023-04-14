import express from "express";
import { Request, Response } from "express";

import { BettingController } from "../controller/db/betting";

const router = express.Router();

router.post("/bet_heistory/:address", async (req: Request, res: Response) => {
  const address = req.params.address;
  const bettingController = new BettingController();
  const bettingList = await bettingController.UserBettingList(address);
  if (bettingList === undefined) {
    res.status(404).send("Invalid Account");
  }
  res.status(200).send(bettingList);
});

export default router;
