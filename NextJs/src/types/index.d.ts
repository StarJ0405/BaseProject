declare interface Pageable {
  content: any[];
  pageSize: number;
  pageNumber: number;
  NumerOfTotalElements: number;
  numerOfElements: number;
  last: boolean;
}

declare interface ComponentProps<T extends HTMLElement>
  extends React.CSSProperties,
    React.HTMLAttributes<T> {
  Ref?: Ref<T> | undefined;
}
