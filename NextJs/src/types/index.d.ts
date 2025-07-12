declare interface Pageable {
  content: any[];
  pageSize: number;
  pageNumber: number;
  NumerOfTotalElements: number;
  numerOfElements: number;
  last: boolean;
}
