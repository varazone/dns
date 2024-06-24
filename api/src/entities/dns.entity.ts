import {
  Entity,
  Column,
  PrimaryColumn,
} from "typeorm";

@Entity('dns')
export class DnsEntity {
  @PrimaryColumn()
  id!: string;

  @Column("text", { nullable: false })
  address!: string;
}
