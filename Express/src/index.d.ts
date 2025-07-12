declare namespace Express {
  interface Request {
    parsedQuery?: any;
  }
}
declare interface Pageable<T> {
  content: T[];
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  last: boolean;
  NumberOfTotalElements: number;
  NumberOfElements: number;
}
declare interface PageData {
  pageSize: number;
  pageNumber?: number;
}

declare interface Limitable<T> {
  content: T[];
  limit: number;
  offset: number;
  last: boolean;
  NumberOfTotalElements: number;
  NumberOfElements: number;
}
declare interface LimitData {
  limit: number;
  offset?: number;
}

declare interface UpdateResult<T> {
  affected: number;
  result?: T[];
}
declare interface RestoreResult<T> {
  affected: number;
  result?: T[];
}
