import { BaseService } from "data-source";
import { User } from "models/user";
import { UserRepository } from "repositories/user";
import { inject, injectable } from "tsyringe";
import { DeepPartial, FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { comparePasswords, hashPassword } from "utils/functions";

@injectable()
export class UserService extends BaseService<User, UserRepository> {
  constructor(@inject(UserRepository) userRepository: UserRepository) {
    super(userRepository);
  }
  async auth(user_name: string, password: string): Promise<User | null> {
    const find = await this.repository.findOne({ where: { user_name } });

    return find &&
      find.password_hash &&
      (await comparePasswords(password, find.password_hash))
      ? find
      : null;
  }

  async create(data: DeepPartial<User & { password?: string }>): Promise<User> {
    if (data?.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
    return super.create(data as DeepPartial<User>);
  }
  async update(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    data: QueryDeepPartialEntity<User> & { password?: string },
    returnEnttiy?: boolean
  ): Promise<UpdateResult<User>> {
    if (data?.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
    const affected = await this.repository.update(where, data);
    let result: User[] = [];
    if (returnEnttiy) {
      result = await this.repository.findAll({ where });
    }
    return {
      affected: affected,
      result,
    };
  }
  async delete(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    soft?: boolean
  ): Promise<number> {
    return await this.repository.delete(where, soft);
  }
  async restore(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    returnEnttiy?: boolean
  ): Promise<RestoreResult<User>> {
    const affected = await this.repository.restore(where);
    let result: User[] = [];
    if (returnEnttiy) {
      result = await this.repository.findAll({ where });
    }
    return {
      affected: affected,
      result,
    };
  }
}
