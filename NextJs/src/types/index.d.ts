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

interface CustomerDataInterface {
  id: string;
  birthday?: string;
  adult?: boolean;
}

interface DirectionalStyleInterface {
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  border?: string | number;
  borderTop?: string | number;
  borderRight?: string | number;
  borderBottom?: string | number;
  borderLeft?: string | number;
}

type OSType = "ios" | "android" | "windows" | "macos" | "linux" | "unknown";

type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";
