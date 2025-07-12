"use client";

import Button from "@/components/buttons/Button"; // 경로 수정
import NiceModal from "@ebay/nice-modal-react";
import clsx from "clsx";
// import { ReduxCheckboxGroup } from "@/components/checkbox/ReduxCheckboxGroup"; // 경로 수정
// import { ReduxCheckboxItem } from "@/components/checkbox/ReduxCheckboxItem"; // 경로 수정
// import { ReduxCheckboxSelectAll } from "@/components/checkbox/ReduxCheckboxSelectAll"; // 경로 수정
import Div from "@/components/div/Div"; // 경로 수정
import FlexChild from "@/components/flex/FlexChild"; // 경로 수정
import HorizontalFlex from "@/components/flex/HorizontalFlex"; // 경로 수정
import VerticalFlex from "@/components/flex/VerticalFlex"; // 경로 수정
import P from "@/components/P/P"; // 경로 수정
// import CustomSelect from "@/components/select/CustomSelect"; // 경로 수정
import _ from "lodash";
import {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import CheckboxAll from "../choice/checkbox/CheckboxAll";
import CheckboxChild from "../choice/checkbox/CheckboxChild";
import CheckboxGroup from "../choice/checkbox/CheckboxGroup";
import Select from "../select/Select";
import style from "./Table.module.css";

/**
 * @param {boolean} selectable 줄 선택 가능 여부
 * @param {boolean} pageable 페이징 여부
 * @param {boolean} showTotal 검색개수 보임여부
 * @param {boolean} hideTop 상단부 숨김 여부
 * @param {boolean} hideBottom 하단부 숨김 여부
 * @param {array} data 미리 입력할 데이터 목록 (search 미 입력시 불변형 테이블)
 * @param {object} condition 검색 조건
 * @param {function} search 검색 함수, 동기든 비동기 무관, {data, max} 반환
 * @param {array} columns [{
 * {string||object} label : 헤더에 사용될 이름
 * {string} code : 데이터의 변수 값
 * {object} styling : {
 * {object} style : column과 header에 적용되는 스타일
 * {string || clsx} className : column과 header에 적용되는 클래스
 *
 * {object} column : column에만 적용되는 스타일링, style과 className
 * {object} header : header에만 적용되는 스타일링, style과 className
 * }
 * {number} index : column 순서
 * {function} Cell : ({index,cell,row})=>{} 형태로 원하는 형식으루 구축가능, 미지정시 기본적인 값 반환
 * }]
 * @param {object} styling {
 * {object} style : row와 header row에 적용되는 스타일
 * {string || clsx} className : row와 header row에 적용되는 클래스
 *
 * {object} selected : row가 선택되면 적용되는 스타일
 * {object} row : row에 적용되는 스타일링, style과 className
 * {object} header : header row에 적용되는 스타일링, style과 className
 * {object} table : 테이블 구조 자체에 적용되는 스타일링, style과 className
 * {object} container : 전체를 감싸는 구조에 적용되는 스타일링, style과 className
 * {object} top : top에 적용되는 스타일링, style과 className
 * {object} bottom : bottom에 적용되는 스타일링, style과 className
 * {object} pagebutton : 페이징 버튼에 적용되는 스타일링, style과 className
 * }
 * @param {ReactDOM} top top 중앙에 넣는 컴포넌트
 * @param {ReactDOM} bottom bottom 아래에 넣는 컴포넌트
 * @param {ReactDOM} bottomLeft bottom 왼쪽에 넣는 컴포넌트
 * @param {ReactDOM} bottomRight bottom 오른쪽에 넣는 컴포넌트
 * @param {array} limits 페이징일 경우 한 페이지에 나타낼 최대 개수
 *
 * @param {number} width 표의 넓이
 * @param {number} contentHeight 상단/하단바와 표의 header를 제외한 표 내용물의 높이
 **/
interface ColumnInterface {
  label?: string;
  code?: string;
  styling?: {
    style?: React.CSSProperties;
    className?: string;
    column?: {
      style?: React.CSSProperties;
      className?: string;
    };
    header?: {
      style?: React.CSSProperties;
      className?: string;
    };
  };
  index?: number;
  Cell?: ({
    index,
    cell,
    row,
  }: {
    index?: number;
    cell?: any;
    row?: any;
  }) => string | object | null;
}
const Table = forwardRef(
  (
    {
      name = "테이블",
      selectable = false,
      pageable = false,
      showTotal = true,
      hideTop = false,
      hideBottom = false,
      overflowY = "auto",
      data: preData = [],
      condition: fixedCondition,
      search,
      ContextMenu,
      columns: preColumns = [],
      styling,
      top,
      bottomLeft,
      bottomRight,
      bottom,
      limits = 15,
      width,
      contentHeight,
      onRowClick,
      onClick,
    }: {
      name?: string;
      selectable?: boolean;
      pageable?: boolean;
      showTotal?: boolean;
      hideTop?: boolean;
      hideBottom?: boolean;
      overflowY?: CSSProperties["overflowY"];
      data?: any[];
      condition?: any;
      search?: (condition: any) => any;
      ContextMenu?: any;
      columns: ColumnInterface[];
      styling?: {
        style?: React.CSSProperties;
        className?: string;
        default?: {
          NoData?: React.CSSProperties;
        };
        selected?: {
          style?: React.CSSProperties;
          className?: string;
        };
        container?: {
          style?: React.CSSProperties;
          className?: string;
        };
        row?: {
          style?: React.CSSProperties;
          className?: string;
        };
        header?: {
          style?: React.CSSProperties;
          className?: string;
        };
        table?: {
          style?: React.CSSProperties;
          className?: string;
        };
        top?: {
          style?: React.CSSProperties;
          className?: string;
        };
        bottom?: {
          style?: React.CSSProperties;
          className?: string;
        };
        pagebutton?: {
          style?: React.CSSProperties;
          className?: string;
        };
      };
      top?: React.ReactNode;
      bottom?: React.ReactNode;
      bottomLeft?: React.ReactNode;
      bottomRight?: React.ReactNode;
      limits?: number[] | number;
      width?: number;
      contentHeight?: number;
      onRowClick?: (row: any) => void;
      onClick?: () => void;
    },
    ref
  ) => {
    limits = Array.isArray(limits) ? limits : [limits];
    const [data, setData] = useState(preData);
    const [selected, setSelected] = useState<string[]>([]); // 타입 명시
    const [columns, setColumns] = useState<any[]>([]); // 타입 명시
    const [condition, setCondition] = useState(
      _.merge({}, fixedCondition || {}) // fixedCondition이 undefined일 경우를 대비하여 빈 객체 병합
    );
    const [page, setPage] = useState(0);
    const [max, setMax] = useState(0);
    const [limit, setLimit] = useState(limits?.[0] || 20);
    const [research, setResearch] = useState(false);
    const divRef = useRef<HTMLDivElement>(null); // 타입 명시

    useImperativeHandle(ref, () => ({
      reset(research = false) {
        if (research) {
          setCondition(fixedCondition || {}); // fixedCondition이 undefined일 경우를 대비하여 빈 객체
        }
        setData(preData || []);
        setPage(0);
        setSelected([]); // reset 시 선택된 항목 초기화 추가
      },
      getCondtion() {
        return condition;
      },
      setCondition(value: any, merge = true) {
        if (merge) value = _.merge({}, fixedCondition || {}, value); // fixedCondition이 undefined일 경우를 대비하여 빈 객체 병합

        setCondition(value);
        setPage(0);
      },
      addCondition(value: any) {
        setCondition(_.merge({}, condition, value));
        setPage(0);
      },
      getPage() {
        return page;
      },
      setPage(value: number) {
        // 타입 명시
        setPage(Math.max(0, Math.min(this.getMaxPage(), Number(value))));
      },
      getMaxPage() {
        return getMaxPage();
      },
      getLimit() {
        return limit;
      },
      setLimit(value: number) {
        // 타입 명시
        setLimit(Math.max(1, Number(value)));
        setPage(0);
      },
      research() {
        setResearch(true);
        setPage(0);
      },
      getIndexes() {
        return selected || [];
      },
      getData() {
        return selectable
          ? data.filter(
              (_d: any, index: number) =>
                selected.includes(`${name}_${index + page * limit}`) // selected는 string[] 이므로 비교 방식 수정
            )
          : data;
      },
      setData(newData: any[]) {
        // 타입 명시
        setData(newData);
        setPage(0);
        setSelected([]); // 데이터 변경 시 선택된 항목 초기화 추가
      },
      async getAllData() {
        if (!selectable) return data;

        if (typeof search === "function") {
          // search 함수가 await 가능한 Promise를 반환하는지 확인
          const result = await Promise.resolve(
            search(_.merge({}, fixedCondition || {}))
          ); // fixedCondition도 병합

          // search 함수의 반환 타입이 { data: any[], max: number } 인지 확인하고 사용
          if (result && "data" in result) {
            return result.data;
          }
        }
        return data;
      },
    }));

    function getMaxPage() {
      return Math.ceil(max / limit);
    }

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const checkboxValues = useMemo(() => {
      if (!data || data.length === 0) return [];
      return data.map(
        (_d: any, index: number) => `${name}_${index + page * limit}`
      );
    }, [data, name, page, limit]); // 의존성 추가

    // contentKey에 research 상태 추가하여 강제 렌더링/리셋 유도 (옵션)
    const contentKey = useMemo(() => {
      return JSON.stringify({
        page,
        limit, // limit도 contentKey에 포함하여 limit 변경 시 checkbox group 리셋
        condition,
        // data는 너무 커질 수 있으므로, ID만 사용하거나 아예 포함하지 않는 것을 고려
        // data: data?.map((item) => item.id || item._id), // 불필요하게 큰 데이터는 제외하거나 해시 사용
        name,
        // research 상태를 추가하여 research() 호출 시 contentKey 변경 유도
        researchTrigger: research,
      });
    }, [page, limit, condition, name, research]);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (divRef.current) {
        divRef.current.scrollTop = 0;
      }
    }, [data]);

    useEffect(() => {
      setColumns(
        [...preColumns]
          .map((column, index) => ({
            ...column,
            index:
              column.index || column.index === 0
                ? Number(column.index)
                : 10000 + index,
          }))
          .sort((c1, c2) => c1.index - c2.index)
      );
    }, [preColumns]);

    // 검색 로직을 useEffect 밖으로 분리하여 재사용성 높임
    const performSearch = useCallback(async () => {
      if (!mounted || !search || typeof search !== "function") {
        setData(preData); // search 함수가 없으면 초기 데이터 사용
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setData([]); // 검색 시작 전에 데이터 초기화

      const searchCondition = _.merge(
        { offset: page * limit, limit: limit },
        condition
      );

      try {
        const result = await Promise.resolve(search(searchCondition)); // 동기/비동기 모두 처리

        if (
          result &&
          typeof result === "object" &&
          "data" in result &&
          "max" in result
        ) {
          setData(result.data);
          setMax(result.max);
        } else {
          console.warn("Search function did not return { data, max }.", result);
          setData([]);
          setMax(0);
        }
      } catch (error) {
        console.error("Error during table search:", error);
        setData([]);
        setMax(0);
      } finally {
        setIsLoading(false);
      }
    }, [mounted, search, page, limit, condition, preData]);

    useEffect(() => {
      // page, limit, condition 변경 시 검색 수행
      if (pageable && mounted) {
        // pageable이 true일 때만 검색
        performSearch();
      } else if (!pageable && mounted && search) {
        // pageable이 false지만 search 함수가 있으면 한 번 검색
        performSearch();
      } else if (!pageable && mounted && !search) {
        // pageable false, search 함수 없으면 preData 사용
        setData(preData);
      }
      return () => setData([]);
    }, [
      page,
      limit,
      condition,
      pageable,
      mounted,
      search,
      preData,
      performSearch,
    ]); // performSearch 추가

    useEffect(() => {
      // research 상태가 true가 되면 검색 수행
      if (mounted && research) {
        setResearch(false); // research 플래그 초기화
        performSearch();
      }
    }, [mounted, research, performSearch]); // performSearch 추가

    return (
      <Div
        key={name}
        onClick={onClick}
        onContextMenu={(e: any) => {
          if (ContextMenu) {
            e.preventDefault();
            e.stopPropagation();
            NiceModal.show(
              "contextMenu",
              ContextMenu({
                x: e.pageX,
                y: e.pageY,
              })
            );
          }
        }}
      >
        <VerticalFlex
          className={clsx(style.container, styling?.container?.className)}
          {..._.merge(styling?.container?.style, width && { width })}
        >
          {!hideTop && (
            <HorizontalFlex
              className={clsx(style.top, styling?.top?.className)}
              {...styling?.top?.style}
              alignItems="flex-end"
            >
              {showTotal && (
                <FlexChild width="max-content">
                  <P
                    width={"max-content"}
                    color={"#000000"}
                    weight={"600"}
                    size={18}
                  >
                    검색결과 : {max || 0}건
                  </P>
                </FlexChild>
              )}
              <FlexChild>{top}</FlexChild>
              <FlexChild width="max-content">
                {limits?.length > 1 && (
                  <FlexChild width="max-content">
                    <Select
                      width={"max-content"}
                      // backgroundColor={"#E5E6E8"}
                      value={limit}
                      options={limits.map((l: number) => ({
                        value: l,
                        display: `${l}개`,
                      }))} // CustomSelect가 {value, label} 객체 배열을 기대한다면
                      onChange={(value: any) => setLimit(value)} // 타입 명시
                    />
                  </FlexChild>
                )}
              </FlexChild>
            </HorizontalFlex>
          )}
          <Div
            className={clsx(style.table, styling?.table?.className)}
            {...styling?.table?.style}
          >
            {selectable ? (
              <CheckboxGroup
                name={name}
                onChange={(values) =>
                  setSelected(
                    // selected는 문자열 배열이어야 함 (checkbox value와 일치)
                    values?.filter((f: string) => f) || []
                  )
                }

                // selectedProps를 사용하지 않고 ReduxCheckboxGroup 내부에서 직접 관리하는 것으로 가정
                // values: selected // ReduxCheckboxGroup이 value prop을 받는다면
              >
                <VerticalFlex
                  height={contentHeight}
                  overflowY={overflowY}
                  Ref={divRef}
                >
                  <FlexChild position="sticky" top={0} zIndex={1}>
                    <HorizontalFlex
                      {..._.merge(
                        { fontSize: 16, fontWeight: 500 }, // 기본값
                        styling?.style,
                        styling?.header?.style
                      )}
                      borderTop={"0.5px solid #c0c0c0"}
                      borderBottom={"0.5px solid #c0c0c0"}
                      backgroundColor={"#3C4B64"}
                      color={"#ffffff"}
                      padding={"15px"}
                      gap={10}
                      className={clsx(
                        style.header,
                        styling?.className,
                        styling?.header?.className
                      )}
                    >
                      <FlexChild width={"max-content"} paddingRight={10}>
                        {!isLoading && checkboxValues.length > 0 ? (
                          <CheckboxAll />
                        ) : (
                          // 데이터가 없거나 로딩 중일 때 체크박스를 비활성화하거나 숨길 수 있음
                          <CheckboxChild id="none" disabled /> // 기본 체크박스 표시
                        )}
                      </FlexChild>
                      <TableHeader
                        columns={columns}
                        data={data}
                        setData={setData}
                      />
                      {/* <FlexChild /> */}
                    </HorizontalFlex>
                  </FlexChild>
                  <FlexChild zIndex={0}>
                    <VerticalFlex height={contentHeight}>
                      {isLoading ? ( // 로딩 중일 때 표시
                        <FlexChild
                          justifyContent={"center"}
                          margin={"100px auto 0"}
                        >
                          <P
                            size={28}
                            weight={800}
                            {...(styling?.default?.NoData || {})}
                          >
                            데이터 로딩 중...
                          </P>
                        </FlexChild>
                      ) : data?.length === 0 ? ( // 데이터가 없을 때 표시
                        <FlexChild
                          justifyContent={"center"}
                          margin={"100px auto 0"}
                        >
                          <P
                            size={28}
                            weight={800}
                            {...(styling?.default?.NoData || {})}
                          >
                            데이터가 없습니다.
                          </P>
                        </FlexChild>
                      ) : (
                        data?.map((row: any, row_offset_index: number) => {
                          // row_offset_index로 변경하여 혼동 방지
                          const actual_row_index =
                            page * limit + row_offset_index; // 실제 전체 인덱스
                          return (
                            <FlexChild key={`row_${actual_row_index}`}>
                              <HorizontalFlex
                                className={clsx(
                                  style.row,
                                  styling?.className,
                                  styling?.row?.className,
                                  {
                                    [style.selected]: selected.includes(
                                      `${name}_${actual_row_index}`
                                    ), // selected 값과 일치하도록 수정
                                  }
                                )}
                                {..._.merge(
                                  {},
                                  styling?.style,
                                  styling?.row?.style,
                                  selected.includes(
                                    `${name}_${actual_row_index}`
                                  ) // selected 값과 일치하도록 수정
                                    ? styling?.selected?.style
                                    : {}
                                )}
                                onClick={() => {
                                  onRowClick?.(row);
                                  // 선택 가능한 테이블일 경우, 행 클릭 시 해당 체크박스 토글
                                  if (selectable) {
                                    setSelected((prev) => {
                                      const value = `${name}_${actual_row_index}`;
                                      if (prev.includes(value)) {
                                        return prev.filter(
                                          (item) => item !== value
                                        );
                                      } else {
                                        return [...prev, value];
                                      }
                                    });
                                  }
                                }}
                                onContextMenu={(e: any) => {
                                  if (ContextMenu) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    NiceModal.show(
                                      "contextMenu",
                                      ContextMenu({
                                        x: e.pageX,
                                        y: e.pageY,
                                      })
                                    );
                                  }
                                }}
                              >
                                <FlexChild
                                  width={"max-content"}
                                  paddingRight={10}
                                >
                                  <CheckboxChild
                                    id={`${name}_${actual_row_index}`} // key는 unique해야 함
                                    value={`${name}_${actual_row_index}`}
                                    // isChecked는 ReduxCheckboxGroup에서 관리됨
                                  />
                                </FlexChild>
                                <TableColum
                                  row={row}
                                  row_index={actual_row_index} // 전체 인덱스 전달
                                  columns={columns}
                                  data={data}
                                  setData={setData}
                                  ContextMenu={ContextMenu}
                                />
                                {/* <FlexChild /> */}
                              </HorizontalFlex>
                            </FlexChild>
                          );
                        })
                      )}
                    </VerticalFlex>
                  </FlexChild>
                </VerticalFlex>
              </CheckboxGroup>
            ) : (
              <VerticalFlex
                height={contentHeight}
                overflowY={overflowY}
                Ref={divRef}
              >
                <FlexChild position="sticky" top={0} zIndex={1}>
                  <HorizontalFlex
                    {..._.merge(
                      { fontSize: 16, fontWeight: 500 }, // 기본값
                      styling?.style,
                      styling?.header?.style
                    )}
                    className={clsx(
                      style.header,
                      styling?.className,
                      styling?.header?.className
                    )}
                    justifyContent={"flex-start"}
                    borderTop={"0.5px solid #c0c0c0"} // 추가된 스타일
                    borderBottom={"0.5px solid #c0c0c0"} // 추가된 스타일
                    backgroundColor={"#3C4B64"} // 추가된 스타일
                    color={"#ffffff"} // 추가된 스타일
                    padding={"15px"} // 추가된 스타일
                    gap={10} // 추가된 스타일
                  >
                    <TableHeader
                      columns={columns}
                      data={data}
                      setData={setData}
                    />
                    {/* <FlexChild /> */}
                  </HorizontalFlex>
                </FlexChild>
                <FlexChild zIndex={0}>
                  <VerticalFlex height={contentHeight}>
                    {isLoading ? (
                      <FlexChild
                        justifyContent={"center"}
                        margin={"100px auto 0"}
                      >
                        <P
                          size={28}
                          weight={800}
                          {...(styling?.default?.NoData || {})}
                        >
                          데이터 로딩 중...
                        </P>
                      </FlexChild>
                    ) : data?.length === 0 ? (
                      <FlexChild
                        justifyContent={"center"}
                        margin={"100px auto 0"}
                      >
                        <P
                          size={28}
                          weight={800}
                          {...(styling?.default?.NoData || {})}
                        >
                          데이터가 없습니다.
                        </P>
                      </FlexChild>
                    ) : (
                      data?.map((row: any, row_offset_index: number) => {
                        // row_offset_index로 변경하여 혼동 방지
                        const actual_row_index =
                          page * limit + row_offset_index; // 실제 전체 인덱스
                        return (
                          <FlexChild key={`row_${actual_row_index}`}>
                            <HorizontalFlex
                              className={clsx(
                                style.row,
                                styling?.className,
                                styling?.row?.className
                              )}
                              {..._.merge(
                                {},
                                styling?.style,
                                styling?.row?.style
                              )}
                              justifyContent={"flex-start"}
                              onClick={() => onRowClick?.(row)}
                              onContextMenu={(e: any) => {
                                if (ContextMenu) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  NiceModal.show(
                                    "contextMenu",
                                    ContextMenu({
                                      x: e.pageX,
                                      y: e.pageY,
                                    })
                                  );
                                }
                              }}
                            >
                              <TableColum
                                row={row}
                                row_index={actual_row_index} // 전체 인덱스 전달
                                columns={columns}
                                data={data}
                                setData={setData}
                                ContextMenu={ContextMenu}
                              />
                              {/* <FlexChild /> */}
                            </HorizontalFlex>
                          </FlexChild>
                        );
                      })
                    )}
                  </VerticalFlex>
                </FlexChild>
              </VerticalFlex>
            )}
          </Div>
          {!hideBottom && (
            <HorizontalFlex
              className={clsx(style.bottom, styling?.bottom?.className)}
              {...styling?.bottom?.style}
            >
              <FlexChild>{bottomLeft}</FlexChild>
              <FlexChild>
                <VerticalFlex gap={20}>
                  <FlexChild>
                    {getMaxPage() > 1 && (
                      <PageButtons
                        page={page}
                        setPage={setPage}
                        maxPage={getMaxPage()}
                      />
                    )}
                  </FlexChild>
                  <FlexChild>{bottom}</FlexChild>
                </VerticalFlex>
              </FlexChild>

              <FlexChild>{bottomRight}</FlexChild>
            </HorizontalFlex>
          )}
        </VerticalFlex>
      </Div>
    );
  }
);

// PageButtons 컴포넌트
const PageButtons = ({
  page,
  setPage,
  maxPage,
}: {
  page: number;
  setPage: (page: number) => void;
  maxPage: number;
}) => {
  page = Number(page);
  maxPage = Number(maxPage);
  const start = page - (page % 10);
  return (
    <HorizontalFlex justifyContent="center" gap={10} marginTop={10}>
      <FlexChild width={"max-content"}>
        <Button
          disabled={page === 0}
          className={clsx(style.pageButton, style.arrow, style.arrowTwice)}
          onClick={() => setPage(0)}
        ></Button>
      </FlexChild>
      <FlexChild width={"max-content"}>
        <Button
          disabled={page === 0}
          className={clsx(style.pageButton, style.arrow)}
          onClick={() => setPage(Math.max(0, page - 1))}
        ></Button>
      </FlexChild>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map((index) => start + index)
        .filter((index) => index < maxPage)
        .map((index) => (
          <FlexChild key={`buttons_${index}`} width={"max-content"}>
            <Button
              className={clsx(style.pageButton, {
                [style.selected]: index === page,
              })}
              onClick={() => setPage(index)}
            >
              {index + 1}
            </Button>
          </FlexChild>
        ))}
      <FlexChild width={"max-content"}>
        <Button
          disabled={page === maxPage - 1}
          className={clsx(style.pageButton, style.arrow, style.arrowNext)}
          onClick={() => setPage(Math.min(maxPage - 1, page + 1))}
        ></Button>
      </FlexChild>
      <FlexChild width={"max-content"}>
        <Button
          disabled={page === maxPage - 1}
          className={clsx(style.pageButton, style.arrow, style.arrowTwiceNext)}
          onClick={() => setPage(maxPage - 1)}
        ></Button>
      </FlexChild>
    </HorizontalFlex>
  );
};

// TableHeader 컴포넌트
const TableHeader = ({
  columns,
  data,
  setData,
}: {
  columns: any[];
  data: any[];
  setData: (data: any[]) => void;
}) => {
  return columns?.map((column, index) => {
    let displayValue: React.ReactNode; // React.ReactNode 타입 명시
    const label = column.label || column.code || "데이터 없음";

    if (column?.Label && typeof column.Label === "function") {
      displayValue = column.Label({
        data,
        setData,
        index: index,
      });
    } else {
      displayValue = label;
    }

    if (typeof displayValue === "string" || typeof displayValue === "number") {
      displayValue = (
        <P
          fontSize={"inherit"}
          size={"inherit"}
          weight={"inherit"}
          textAlign={"inherit"}
        >
          {displayValue}
        </P>
      );
    }

    return (
      <FlexChild
        justifyContent={"center"}
        key={`header_${index}_${column?.label || column?.code}`}
        {..._.merge({}, column?.styling?.style, column?.styling?.header?.style)}
      >
        {displayValue || "데이터 없음"}
      </FlexChild>
    );
  });
};

// TableColum 컴포넌트 (TableColumn 오타 수정)
const TableColum = ({
  // TableColumn으로 이름 변경 권장
  row,
  columns,
  row_index,
  setData,
  data,
  ContextMenu,
}: {
  row: any;
  columns: any[];
  row_index: number;
  setData: (data: any[]) => void;
  data: any[];
  ContextMenu: any;
}) => {
  // 타입 명시
  return columns.map((column, index) => {
    let displayValue: React.ReactNode; // React.ReactNode 타입 명시
    const cell = row[column?.code];
    if (column?.Cell && typeof column.Cell === "function") {
      displayValue = column.Cell({
        row,
        cell,
        index: row_index,
        data,
        setData,
      });
    } else {
      displayValue = cell;
    }

    if (typeof displayValue === "string" || typeof displayValue === "number")
      displayValue = (
        <P fontSize={"inherit"} textAlign={"inherit"}>
          {displayValue}
        </P>
      );
    return (
      <FlexChild
        justifyContent={"center"}
        key={`cell_${row_index}_${index}`}
        height={"100%"}
        {..._.merge({}, column?.styling?.style, column?.styling?.column?.style)}
        onContextMenu={(e: any) => {
          if (column.ContextMenu) {
            // 컬럼별 ContextMenu가 있다면
            e.preventDefault();
            e.stopPropagation();
            const menu = ContextMenu({ x: e.pageX, y: e.pageY, row });

            // ContextMenu의 rows를 업데이트하는 로직
            // column.ContextMenu가 함수이고, 기존 menu.rows를 받아서 새 rows를 반환한다고 가정
            menu.rows = column.ContextMenu({
              pre: menu?.rows || [], // 기존 메뉴 항목을 `pre`로 전달
              row,
              cell,
            });

            NiceModal.show("contextMenu", menu);
          } else if (ContextMenu) {
            // 전체 테이블 ContextMenu가 있다면
            // 컬럼별 ContextMenu가 없고 테이블 전체 ContextMenu가 있을 때도 동작하도록 추가
            e.preventDefault();
            e.stopPropagation();
            NiceModal.show(
              "contextMenu",
              ContextMenu({
                x: e.pageX,
                y: e.pageY,
              })
            );
          }
        }}
        onClick={(e: any) => {
          if (column.onClick) {
            e.preventDefault();
            e.stopPropagation();
            column.onClick({ e, row, cell, index: row_index }); // row_index 전달
          }
        }}
      >
        {displayValue || "데이터 없음"}
      </FlexChild>
    );
  });
};

export default Table;
