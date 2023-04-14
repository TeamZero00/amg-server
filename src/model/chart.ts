import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from "typeorm";

@Entity()
export class Chart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  symbol: string;
  @Column({ type: "bigint" })
  timestamp: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  date: Date;

  @Column()
  high: string;

  @Column()
  low: string;

  @Column()
  open: string;

  @Column()
  close: string;
}
