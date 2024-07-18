import {
  Entity,
  Column,
  PrimaryColumn,
} from "typeorm";

@Entity('program')
export class ProgramEntity {
  constructor(props?: Partial<ProgramEntity>) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id!: string;

  @Column("text", { nullable: false })
  name!: string;

  @Column("text", { array: true, nullable: false })
  admins!: string[];

  @Column("text", { nullable: false })
  address!: string;

  @Column("text", { name: 'created_by', nullable: false })
  createdBy!: string;

  @Column("text", { nullable: false })
  history!: string;

  @Column("timestamp with time zone", { name: 'created_at', nullable: false })
  createdAt!: Date;

  @Column("timestamp with time zone", { name: 'updated_at', nullable: false })
  updatedAt!: Date;
}
