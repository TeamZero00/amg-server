import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;

  @Index()
  @Column({ type: "bigint" })
  timestamp: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  date: Date;

  @Column()
  blockHeight: string;

  @Column()
  transactionHash: string;

  @Column()
  price: string;

  @Column()
  onTime: boolean;
}
