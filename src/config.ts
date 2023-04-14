import dotenv from "dotenv";

dotenv.config();

export const web3Config = {
  gameContract: process.env.GAME_CONTRACT,
  bankContract: process.env.BANK_CONTRACT,
  lpContract: process.env.LP_CONTRACT,
  mnemonic: process.env.MNEMONIC,
  address: process.env.ADDRESS,
  mnemonic2: process.env.MNEMONIC2,
  address2: process.env.ADDRESS2,
};

export const DBConfig = {
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USER_NAME,
  password: process.env.PASSWROD,
  database: process.env.DATA_BASE,
};

export const FixerConfig = {
  apiKey: process.env.API_KEY,
};

export const PolyGonConfig = {
  apiKey: process.env.API_KEY,
};
