import { BaseService } from "data-source";
import { Link } from "models/link";
import { LinkRepository } from "repositories/link";
import { inject, injectable } from "tsyringe";
import { FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@injectable()
export class LinkService extends BaseService<Link, LinkRepository> {
  constructor(@inject(LinkRepository) linkRepository: LinkRepository) {
    super(linkRepository);
  }
  async update(
    where: FindOptionsWhere<Link> | FindOptionsWhere<Link>[],
    data: QueryDeepPartialEntity<Link>,
    returnEnttiy?: boolean
  ): Promise<UpdateResult<Link>> {
    const affected = await this.repository.update(where, data);
    let result: Link[] = [];
    if (returnEnttiy) {
      result = await this.repository.findAll({ where });
    }
    return {
      affected: affected,
      result,
    };
  }
  async delete(
    where: FindOptionsWhere<Link> | FindOptionsWhere<Link>[],
    soft?: boolean
  ): Promise<number> {
    return await this.repository.delete(where, soft);
  }
  async restore(
    where: FindOptionsWhere<Link> | FindOptionsWhere<Link>[],
    returnEnttiy?: boolean
  ): Promise<RestoreResult<Link>> {
    const affected = await this.repository.restore(where);
    let result: Link[] = [];
    if (returnEnttiy) {
      result = await this.repository.findAll({ where });
    }
    return {
      affected: affected,
      result,
    };
  }
}
