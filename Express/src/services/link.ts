import { BaseService } from "data-source";
import { result } from "lodash";
import { Link } from "models/link";
import { LinkRepository } from "repositories/link";
import { inject, injectable } from "tsyringe";
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptions,
  FindOptionsWhere,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

// @injectable()
// export class LinkService {
//   private readonly linkRepository: LinkRepository;
//   private readonly manager: EntityManager;
//   constructor(@inject(LinkRepository) linkRepository: LinkRepository) {
//     this.linkRepository = linkRepository;
//     this.manager = this.linkRepository.manager;
//   }

//   async create(data: DeepPartial<Link>): Promise<Link> {
//     return await this.linkRepository.create(data);
//   }
//   async creates(data: DeepPartial<Link>, amount: number): Promise<Link[]> {
//     if (amount <= 0) throw Error("amount must be more than 0");
//     return await this.linkRepository.creates(
//       Array.from({ length: amount }).map(() => ({ ...data }))
//     );
//   }
//   async getCount() {
//     return await this.linkRepository.count();
//   }

//   public async withTransaction<T>(
//     action: (transactionalService: this) => Promise<T>
//   ): Promise<T> {
//     return this.manager.transaction(async (transactionalEntityManager) => {
//       const transactionalUserRepository = new LinkRepository(
//         transactionalEntityManager
//       );

//       const transactionalService = new (this.constructor as new (
//         linkRepo: LinkRepository
//       ) => this)(transactionalUserRepository);

//       const result = await action(transactionalService);
//       return result;
//     });
//   }
// }

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
