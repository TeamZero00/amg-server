import { web3Config } from "../config.js";
import { ArchwayClient } from "@archwayhq/arch3.js";
import { network } from "./network.js";
import { Pool } from "../types/types.js";

type Betting = {
  address: string;
  position: string;
  amount: string;
  base_price: string;
  start_height: number;
  target_height: number;
};
export async function getClient() {
  const queryer = await ArchwayClient.connect(network.endpoint);
  const client = new Client(queryer);
  return client;
}
export class Client {
  lpcontract: string;
  gameContract: string;
  client: ArchwayClient;
  bankContract: string;
  constructor(client: ArchwayClient) {
    this.lpcontract = web3Config.lpContract;
    this.gameContract = web3Config.gameContract;
    this.bankContract = web3Config.bankContract;
    this.client = client;
  }

  async getBalance(address: string) {
    const balance = await this.client.getBalance(address, "uconst");
    return {
      address,
      ...balance,
    };
  }
  async getHeight() {
    const height = await this.client.getHeight();

    return height;
  }
  //======lp==========
  async queryMinter() {
    try {
      const msg = {
        minter: {},
      };

      const result = await this.client.queryContractSmart(this.lpcontract, msg);
      return result;
    } catch (err) {
      console.log("queryMinter failed");
      console.log(err);
      return undefined;
    }
  }

  async getLpBalance(address: string) {
    try {
      const msg = {
        balance: { address },
      };
      const result = await this.client.queryContractSmart(this.lpcontract, msg);

      return result;
    } catch (err) {
      console.log("query lp balance failed");
      console.log(err);
      return undefined;
    }
  }

  async getLPAllowance(owner: string) {
    try {
      const msg = {
        allowance: { owner: owner, spender: this.bankContract },
      };
      const result = await this.client.queryContractSmart(this.lpcontract, msg);

      return result;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async getLPTotalSupply() {
    try {
      const msg = {
        total_supply: {},
      };
      const result = await this.client.queryContractSmart(this.lpcontract, msg);

      return result;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
  //============fx==================

  async getGameContractConfig() {
    const msg = {
      get_state: {},
    };
    try {
      const result = await this.client.queryContractSmart(
        this.gameContract,
        msg
      );

      return result;
    } catch (err) {
      console.log("error query config");
      console.log(err);
      return undefined;
    }
  }

  async getGameAccountBalance(address: string) {
    const msg = {
      get_account_balance: { address },
    };
    try {
      const result = await this.client.queryContractSmart(
        this.gameContract,
        msg
      );

      return result;
    } catch (err) {
      console.log("error query config");
      console.log(err);
      return undefined;
    }
  }

  async getHeightPrice(height: number) {
    const msg = {
      get_round_price: { height },
    };
    try {
      const result = await this.client.queryContractSmart(
        this.gameContract,
        msg
      );

      return result;
    } catch (err) {
      console.log("error query config");
      console.log(err);
      return undefined;
    }
  }

  async getHeightBettingList(target_height: number): Promise<Betting[]> {
    const msg = {
      get_height_betting_list: {
        target_height,
      },
    };
    try {
      const result = await this.client.queryContractSmart(
        this.gameContract,
        msg
      );

      return result;
    } catch (err) {
      console.log("error query betting list");
      console.log(err);
      return undefined;
    }
  }

  //bank
  async getBankPool(): Promise<Pool> {
    const msg = {
      get_pool: {},
    };
    try {
      const pool = await this.client.queryContractSmart(this.bankContract, msg);

      return pool;
    } catch (err) {
      console.log("error query config");
      console.log(err);
      return undefined;
    }
  }
}
