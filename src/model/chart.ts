import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Chart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;
  @Column({ type: "bigint" })
  timestamp: number;

  @Column({ type: "string" })
  date: string;

  @Column()
  high: string;

  @Column()
  low: string;

  @Column()
  open: string;

  @Column()
  close: string;
}
