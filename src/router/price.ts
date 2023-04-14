import express from "express";
import { Request, Response } from "express";
import { ChartController } from "../controller/db/chart";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const chartController = new ChartController();
  const recentChart = await chartController.recent();
  res.send(recentChart);
});

// router.get("/all", async (req: Request, res: Response) => {
//   const chartController = new ChartController();
//   const allChart = await chartController.all();
//   res.send(allChart);
// });
export default router;
