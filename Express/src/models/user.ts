import { BaseEntity } from "data-source";
import { BeforeInsert, Column, Entity } from "typeorm";
import { generateEntityId } from "utils/functions";

export enum UserRole {
  ADMIN = "admin",
  VENDOR = "vendor",
  MEMBER = "member",
  DEVELOPER = "developer",
}

@Entity({ name: "user" })
export class User extends BaseEntity {
  @Column({ type: "character varying", unique: true })
  user_name?: string;

  @Column({ type: "character varying" })
  password_hash?: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.MEMBER })
  role?: UserRole;

  @Column({ type: "character varying", nullable: true })
  name?: string;

  @Column({ type: "character varying", nullable: true })
  phone_number?: string;

  @Column({ type: "character varying", nullable: true })
  email?: string;

  @Column({ type: "character varying", nullable: true })
  birth_day?: string;

  @Column({ type: "character varying", nullable: true })
  store_id?: string;

  @Column({ type: "character varying", nullable: true })
  ci?: string;

  @Column({ type: "character varying", nullable: true })
  di?: string;

  @Column({ type: "character varying", nullable: true })
  biometric_algorithm?: string;

  @Column({ type: "character varying", nullable: true })
  biometric_enabled?: string;

  @Column({ type: "character varying", nullable: true })
  biometric_public_key?: string;

  @Column({
    type: "timestamp with time zone",
    nullable: true,
  })
  biometric_registered_at?: Date;

  @Column({ type: "character varying", nullable: true })
  pin_hash?: string;

  @Column({ type: "jsonb", default: {} })
  metadata?: Record<string, unknown> | null;

  @BeforeInsert()
  protected BeforeInsert(): void {
    this.id = generateEntityId(this.id, "usr");
  }
}
