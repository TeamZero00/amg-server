import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Betting } from "./betting";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @OneToMany(() => Betting, (betting) => betting.account)
  bettings: Betting[];
  @Column({ default: 0 })
  prizeAmount: number;
}
