import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Price } from "./price";

@Entity()
export class Oracle {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Price)
  @JoinColumn()
  price: Price;

  @Column()
  blockHeight: string;

  @Column()
  transactionHash: string;
}
