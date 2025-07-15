import { BaseRepository } from "data-source";
import { User } from "models/user";
import { inject, injectable } from "tsyringe";
import { EntityManager } from "typeorm";

@injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@inject("dataSource") public readonly manager: EntityManager) {
    super(manager, User);
  }
}
