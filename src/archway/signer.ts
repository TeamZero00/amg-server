import { SigningArchwayClient } from "@archwayhq/arch3.js";
import { coin, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { network } from "./network";
import axios from "axios";
import { web3Config } from "../config";
export interface Winner {
  address: string;
  amount: string;
}
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const gasPrice = GasPrice.fromString("0.01uconst");
export async function getSingingClinet(mnemonic: string) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: network.prefix,
  });
  // console.log(wallet);
  const singingClinet = await SigningArchwayClient.connectWithSigner(
    network.endpoint,
    wallet,
    {
      gasPrice,
      prefix: network.prefix,
    }
  );
  // console.log(singingClinet);
  return singingClinet;
}

export async function getOwner() {
  const signer = await getSingingClinet(web3Config.mnemonic);
  const owner = new Signer(signer, web3Config.address);
  const signer2 = await getSingingClinet(web3Config.mnemonic2);
  const owner2 = new Signer(signer2, web3Config.address2);
  return { owner, owner2 };
}
// export const signerClienr = await getSigner(config.mnemonic);
export class Signer {
  lpcontract: string;
  gameContract: string;
  bankContract: string;
  address: string;
  signer: SigningArchwayClient;

  constructor(signer: SigningArchwayClient, address: string) {
    this.lpcontract = web3Config.lpContract;
    this.gameContract = web3Config.gameContract;
    this.bankContract = web3Config.bankContract;
    this.address = address;
    this.signer = signer;
  }

  //=============game===================

  async setting(price: string) {
    console.log("setting start!");
    const list_msg = {
      get_recent_betting_list: {
        target_height: (await this.signer.getHeight()) + 1,
      },
    };
    const betting_list = await this.signer.queryContractSmart(
      this.gameContract,
      list_msg
    );
    const baseGasLimit = betting_list * 1500 + 200000;
    const baseGasAmount = 500;
    const gasLimit = betting_list.length * 15000 + baseGasLimit;
    const gasAmount = betting_list.length * 30 + baseGasAmount;
    const fee = {
      amount: [
        {
          denom: "uconst",
          amount: gasAmount.toString(),
        },
      ],
      gas: gasLimit.toString(),
    };
    const settingPrice = Math.trunc(Number(price) * 100000);

    const msg = {
      setting: {
        price: settingPrice.toString(),
      },
    };
    try {
      const { height, transactionHash, logs } = await this.signer.execute(
        this.address,
        this.gameContract,
        msg,
        fee
      );
      const events = logs[0].events;
      let roundPrice = Number(price);
      if (events[events.length - 1].attributes.length >= 3) {
        roundPrice =
          Number(events[events.length - 1].attributes[2].value) / 100000;
      }

      const winners: Winner[] = events[events.length - 1].attributes
        .slice(3)
        .map((winner) => {
          return {
            address: winner.key,
            amount: winner.value,
          };
        });
      return {
        height,
        transactionHash,
        winners,
        roundPrice,
      };
    } catch (err) {
      await sleep(5000);
      console.log("setting error");
      console.log(err);
    }
  }

  //===============bank=============
  async deposit(amount: number) {
    try {
      const msg = {
        deposit: {},
      };
      const { height, transactionHash, gasUsed, logs } =
        await this.signer.execute(
          this.address,
          this.bankContract,
          msg,
          "auto",
          undefined,
          [
            {
              denom: "uconst",
              amount: amount.toString(),
            },
          ]
        );
      return {
        height,
        transactionHash,
        gasUsed,
        logs,
      };
    } catch (err) {
      console.log("deposit error");
      console.error(err);
    }
  }
  async increaseAllowance(amount: string, expires: number) {
    try {
      const msg = {
        increase_allowance: {
          spender: this.bankContract,
          amount,
          expires: {
            at_height: expires,
          },
        },
      };
      const result = await this.signer.execute(
        this.address,
        this.lpcontract,
        msg,
        "auto"
      );

      console.log(result);
    } catch (err) {
      console.log("increase error");
      console.error(err);
    }
  }
  async decreaseAllowance(amount: string, expires: number) {
    try {
      const msg = {
        decrease_allowance: {
          spender: this.bankContract,
          amount,
          expires: {
            at_height: expires,
          },
        },
      };
      const result = await this.signer.execute(
        this.address,
        this.lpcontract,
        msg,
        "auto"
      );

      console.log(result);
    } catch (err) {
      console.log("decrease error");
      console.error(err);
    }
  }
  async withdraw() {
    try {
      const msg = {
        withdraw: {},
      };
      const result = await this.signer.execute(
        this.address,
        this.bankContract,
        msg,
        "auto"
      );

      console.log(result);
    } catch (err) {
      console.log("withdraw error");
      console.error(err);
    }
  }
}
