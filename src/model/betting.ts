import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Account } from "./account";
export enum Status {
  Pending = "Pending",
  Lose = "Lose",
  Win = "Win",
}
@Entity()
export class Betting {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  position: string;

  @Column()
  amount: number;

  @Column({ default: 0 })
  winAmount: number;

  @Column("float")
  basePrice: number;

  @Column()
  startHiehgt: number;

  @Column()
  targetHeight: number;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.Pending,
  })
  status: Status;

  @Column("float", { default: 0 })
  roundPrice: number;
  @ManyToOne(() => Account, (account) => account.bettings, { eager: true })
  @JoinColumn({ name: "account" })
  account: Account;
}
