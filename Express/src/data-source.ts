import * as path from "path";
import { container } from "tsyringe";
import {
  BeforeInsert,
  Column,
  DataSource,
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  ObjectType,
  PrimaryColumn,
  Repository,
  BaseEntity as _BaseEntity,
  getMetadataArgsStorage,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { generateEntityId } from "utils/functions";
export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || "postgres", // 'as any'는 타입스크립트 오류 방지용
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "mydatabase",
  synchronize: process.env.SYNCHRONIZE === "true", // env 변수는 문자열이므로 'true' 비교
  logging: process.env.LOGGING === "true" ? ["query", "error"] : false, // 쿼리 로그 활성화
  entities: [path.join(__dirname, "models/**/*.{js,ts}")],
  migrations: [path.join(__dirname, "migration/**/*.{js,ts}")],
  subscribers: [path.join(__dirname, "subscriber/**/*.{js,ts}")],
});
export const dataSourceSymbol = Symbol("dataSource");
container.register("dataSource", {
  useFactory: () => AppDataSource.manager,
});
export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    getMetadataArgsStorage().tables.map((table) => table.target);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repo: Repository<T>;
  constructor(
    protected readonly manager: EntityManager,
    enttiy: ObjectType<T>
  ) {
    this.repo = this.manager.getRepository(enttiy);
  }

  public getManager(): EntityManager {
    return this.manager;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return await this.repo.save(this.repo.create(data));
  }
  async creates(data: DeepPartial<T>[]): Promise<T[]> {
    return await this.repo.save(this.repo.create(data));
  }
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repo.find(options);
  }
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repo.findOne(options);
  }
  async count(options?: FindManyOptions<T>) {
    return await this.repo.count(options);
  }

  async findPaging(
    pageData: PageData,
    options?: FindOneOptions<T>
  ): Promise<Pageable<T>> {
    const { pageSize, pageNumber = 0 } = pageData;
    const content = await this.repo.find({
      ...options,
      take: pageSize,
      skip: pageNumber * pageSize,
    });
    const NumberOfTotalElements = await this.repo.count(options);
    const NumberOfElements = content.length;
    const totalPages =
      pageSize > 0 ? Math.ceil(NumberOfTotalElements / pageSize) : 0;
    const last = pageNumber === totalPages - 1;

    return {
      content,
      pageSize,
      pageNumber,
      NumberOfTotalElements,
      NumberOfElements,
      totalPages,
      last,
    };
  }
  async findLimit(
    limitData: LimitData,
    options?: FindOneOptions<T>
  ): Promise<Limitable<T>> {
    const { limit, offset = 0 } = limitData;
    const content = await this.repo.find({
      ...options,
      take: limit,
      skip: offset,
    });
    const NumberOfTotalElements = await this.repo.count(options);
    const NumberOfElements = content.length;
    const last = offset + NumberOfElements === NumberOfTotalElements;
    return {
      content,
      limit,
      offset,
      NumberOfTotalElements,
      NumberOfElements,
      last,
    };
  }
  async update(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    data: QueryDeepPartialEntity<T>
  ): Promise<number> {
    const update = await this.repo.update(where, data);
    return update.affected || 0;
  }

  async delete(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    soft = true
  ): Promise<number> {
    let affected = 0;
    if (soft) {
      affected = (await this.repo.softDelete(where)).affected || 0;
    } else {
      affected = (await this.repo.delete(where)).affected || 0;
    }
    return affected;
  }
  async restore(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<number> {
    const restore = await this.repo.restore(where);
    return restore.affected || 0;
  }
}
export abstract class BaseEntity extends _BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({
    type: "timestamp with time zone",
    default: new Date(),
    nullable: false,
  })
  created_at!: Date;

  @Column({
    type: "timestamp with time zone",
    default: new Date(),
    nullable: false,
  })
  updated_at!: Date;

  @Column({ type: "timestamp with time zone", default: null, nullable: true })
  deleted_at!: Date;

  @BeforeInsert()
  protected BeforeInsert(): void {
    this.id = generateEntityId(this.id);
  }
}

export abstract class BaseService<
  T extends BaseEntity,
  R extends BaseRepository<T>
> {
  protected readonly repository: R;
  protected readonly manager;
  protected constructor(repository: R) {
    this.repository = repository;
    this.manager = repository.getManager();
  }
  async create(data: DeepPartial<T>): Promise<T> {
    return await this.repository.create(data);
  }
  async creates(data: DeepPartial<T>, amount: number): Promise<T[]> {
    if (amount <= 0) throw Error("amount must be more than 0");
    return await this.repository.creates(
      Array.from({ length: amount }).map(() => ({ ...data }))
    );
  }
  async getList(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.findAll(options);
  }

  async get(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }
  async getById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id: id } } as any);
  }
  async getPageable(pageData: PageData, options: FindOneOptions<T>) {
    return await this.repository.findPaging(pageData, options);
  }
  async getCount(options?: FindOneOptions<T>): Promise<number> {
    return await this.repository.count(options);
  }
  abstract update(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    data: QueryDeepPartialEntity<T>,
    returnEnttiy?: boolean
  ): Promise<UpdateResult<T>>;
  abstract delete(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    soft?: boolean
  ): Promise<number>;
  abstract restore(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    returnEnttiy?: boolean
  ): Promise<RestoreResult<T>>;
  async withTransaction<T>(
    action: (transactionalService: this) => Promise<T>
  ): Promise<T> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      const TransactionalRepositoryClass = this.repository.constructor as new (
        manager: EntityManager
      ) => R;
      const transactionalRepository = new TransactionalRepositoryClass(
        transactionalEntityManager
      );
      const TransactionalServiceClass = this.constructor as new (
        repo: R
      ) => this;
      const transactionalService = new TransactionalServiceClass(
        transactionalRepository
      );
      const result = await action(transactionalService);
      return result;
    });
  }
}
