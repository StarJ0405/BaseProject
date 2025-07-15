import { BaseEntity } from "data-source";
import { BeforeInsert, Column, Entity } from "typeorm";
import { generateEntityId } from "utils/functions";

@Entity({ name: "link" })
export class Link extends BaseEntity {
  @Column({ type: "timestamp with time zone", nullable: true })
  start_date?: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  end_date?: Date;

  @Column({ type: "integer", default: 0 })
  chance?: number;

  @Column({ type: "jsonb", default: {} })
  data?: Record<string, unknown> | null;

  @Column({ type: "jsonb", default: {} })
  metadata?: Record<string, unknown> | null;

  @BeforeInsert()
  protected BeforeInsert(): void {
    this.id = generateEntityId(this.id, "li");
  }
}
