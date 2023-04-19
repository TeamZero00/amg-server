export type Pool = {
  denom: string;
  balance: string;
  lp_contract: string;
  game_contract: string;
};

export type SocketSendPrice = {
  before24HourPrice: string;
  nowPrice: string;
  highPrice: string;
  lowPrice: string;
};
