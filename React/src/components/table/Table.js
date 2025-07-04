import NiceModal from "@ebay/nice-modal-react";
import clsx from "clsx";
import Button from "components/buttons/Button";
import { ReduxCheckboxGroup } from "components/checkbox/ReduxCheckboxGroup";
import { ReduxCheckboxItem } from "components/checkbox/ReduxCheckboxItem";
import { ReduxCheckboxSelectAll } from "components/checkbox/ReduxCheckboxSelectAll";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import CustomSelect from "components/select/CustomSelect";
import _ from "lodash";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
 *  {string||object} label : 헤더에 사용될 이름
 *  {string} code : 데이터의 변수 값
 *  {object} styling : {
 *    {object} style : column과 header에 적용되는 스타일
 *    {string || clsx} className : column과 header에 적용되는 클래스
 *
 *    {object} column : column에만 적용되는 스타일링, style과 className
 *    {object} header : header에만 적용되는 스타일링, style과 className
 *  }
 *  {number} index : column 순서
 *  {function} Cell : ({index,cell,row})=>{} 형태로 원하는 형식으루 구축가능, 미지정시 기본적인 값 반환
 * }]
 * @param {object} styling {
 *  {object} style : row와 header row에 적용되는 스타일
 *  {string || clsx} className : row와 header row에 적용되는 클래스
 *
 *  {object} selected : row가 선택되면 적용되는 스타일
 *  {object} row : row에 적용되는 스타일링, style과 className
 *  {object} header : header row에 적용되는 스타일링, style과 className
 *  {object} table : 테이블 구조 자체에 적용되는 스타일링, style과 className
 *  {object} container : 전체를 감싸는 구조에 적용되는 스타일링, style과 className
 *  {object} top : top에 적용되는 스타일링, style과 className
 *  {object} bottom : bottom에 적용되는 스타일링, style과 className
 *  {object} pagebutton : 페이징 버튼에 적용되는 스타일링, style과 className
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
    },
    ref
  ) => {
    limits = Array.isArray(limits) ? limits : [limits];
    const [data, setData] = useState(preData);
    const [selected, setSelected] = useState([]);
    const [columns, setColumns] = useState([]);
    const [condition, setCondition] = useState(_.merge({}, fixedCondition));
    const [page, setPage] = useState(0);
    const [max, setMax] = useState(0);
    const [limit, setLimit] = useState(limits?.[0] || 20);
    const [research, setResearch] = useState(false);
    const divRef = useRef();
    useImperativeHandle(ref, () => ({
      reset(research = false) {
        if (research) {
          setCondition(fixedCondition || []);
        }
        setData(preData || []);
        setPage(0);
      },
      getCondtion() {
        return condition;
      },
      setCondition(value, merge = true) {
        if (merge) value = _.merge({}, fixedCondition, value);

        setCondition(value);
        setPage(0);
      },
      addCondition(value) {
        setCondition(_.merge({}, condition, value));
        setPage(0);
      },
      getPage() {
        return page;
      },
      setPage(value) {
        setPage(Math.max(0, Math.min(this.getMaxPage(), Number(value))));
      },
      getMaxPage() {
        return getMaxPage();
      },
      getLimit() {
        return limit;
      },
      setLimit(value) {
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
          ? data.filter((d, index) => selected.includes(index + page * limit))
          : data;
      },
      setData(data) {
        setData(data);
        setPage(0);
      },
      async getAllData() {
        if (!selectable) return data;

        if (typeof search === "function")
          return (await search(_.merge({}, condition))).data;
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
      return data.map((_, index) => `${name}_${index + page * limit}`);
    }, [data]);
    const contentKey = useMemo(() => {
      return JSON.stringify({
        page,
        condition,
        data: data?.map((item) => item.id || item._id),
        name,
      });
    }, [page, condition, data]);
    useEffect(() => {
      setMounted(true);
    }, []);
    useEffect(() => {
      divRef.current.scrollTop = 0;
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
    useEffect(() => {
      if (mounted && search && typeof search === "function") {
        setIsLoading(true);
        setData([]);
        if (search?.constructor?.name === "AsyncFunction") {
          const asyncWrap = async () => {
            try {
              const { data, max } = await search(
                _.merge({ offset: page * limit, limit: limit }, condition)
              );
              setData(data);
              setMax(max);
            } finally {
              setIsLoading(false);
            }
          };
          asyncWrap();
        } else {
          try {
            const { data, max } = search(
              _.merge({ offset: page * limit, limit: limit }, condition)
            );
            setData(data);
            setMax(max);
          } finally {
            setIsLoading(false);
          }
        }
      } else setData(preData);

      return () => setData([]);
    }, [condition, limit, page, pageable]);
    useEffect(() => {
      if (mounted && research) {
        setResearch(false);
        setData([]);
        if (search?.constructor?.name === "AsyncFunction") {
          const asyncWrap = async () => {
            const { data, max } = await search(
              _.merge({ offset: page * limit, limit: limit }, condition)
            );
            setData(data);
            setMax(max);
          };
          asyncWrap();
        } else {
          const { data, max } = search(
            _.merge({ offset: page * limit, limit: limit }, condition)
          );
          setData(data);
          setMax(max);
        }
      }
    }, [mounted, research]);

    return (
      <Div
        key={name}
        onClick={onClick}
        onContextMenu={(e) => {
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
                    <CustomSelect
                      width={"max-content"}
                      backgroundColor={"#E5E6E8"}
                      defaultValue={limit}
                      options={limits}
                      onChange={(value) => setLimit(value)}
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
              <ReduxCheckboxGroup
                clearCheckboxesOnContentChange={true}
                singleSelect={false}
                onChange={(values) =>
                  setSelected(
                    [...values]
                      ?.filter((f) => f)
                      ?.map((value) => {
                        const splits = value.split("_");
                        return Number(splits[splits?.length - 1]);
                      })
                  )
                }
                contentKey={contentKey}
              >
                <VerticalFlex
                  height={contentHeight}
                  overflowY={overflowY}
                  Ref={divRef}
                >
                  <FlexChild position="sticky" top={0} zIndex={1}>
                    <HorizontalFlex
                      fontSize={"20px"}
                      fontWeight={"bold"}
                      {..._.merge(
                        { fontSize: 16, fontWeight: 500 },
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
                          <ReduxCheckboxSelectAll values={checkboxValues} />
                        ) : (
                          <ReduxCheckboxItem />
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
                      {data?.length === 0 && (
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
                      )}
                      {data?.map((row, row_index) => {
                        row_index = page * limit + row_index;
                        return (
                          <FlexChild key={`row_${row_index}`}>
                            <HorizontalFlex
                              className={clsx(
                                style.row,
                                styling?.className,
                                styling?.row?.className,
                                {
                                  [styling?.selected?.className]:
                                    selected.includes(String(row_index)),
                                }
                              )}
                              {..._.merge(
                                {},
                                styling?.style,
                                styling?.row?.style,
                                selected.includes(String(row_index))
                                  ? styling?.selected?.style
                                  : {}
                              )}
                              onClick={() => onRowClick?.(row)}
                              onContextMenu={(e) => {
                                if (ContextMenu) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  NiceModal.show(
                                    "contextMenu",
                                    ContextMenu({
                                      x: e.pageX,
                                      y: e.pageY,
                                      row,
                                    })
                                  );
                                }
                              }}
                            >
                              <FlexChild
                                width={"max-content"}
                                paddingRight={10}
                              >
                                <ReduxCheckboxItem
                                  key={`${name}_${row_index}`}
                                  value={`${name}_${row_index}`}
                                />
                              </FlexChild>
                              <TableColum
                                row={row}
                                row_index={row_index}
                                columns={columns}
                                data={data}
                                setData={setData}
                                ContextMenu={ContextMenu}
                              />
                              {/* <FlexChild /> */}
                            </HorizontalFlex>
                          </FlexChild>
                        );
                      })}
                    </VerticalFlex>
                  </FlexChild>
                </VerticalFlex>
              </ReduxCheckboxGroup>
            ) : (
              <VerticalFlex
                height={contentHeight}
                overflowY={overflowY}
                Ref={divRef}
              >
                <FlexChild position="sticky" top={0} zIndex={1}>
                  <HorizontalFlex
                    {..._.merge(
                      { size: 16, weight: 500 },
                      styling?.style,
                      styling?.header?.style
                    )}
                    className={clsx(
                      style.header,
                      styling?.className,
                      styling?.header?.className
                    )}
                    justifyContent={"flex-start"}
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
                    {data?.length === 0 && (
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
                    )}
                    {data?.map((row, row_index) => {
                      row_index = page * limit + row_index;
                      return (
                        <FlexChild key={`row_${row_index}`}>
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
                            onContextMenu={(e) => {
                              if (ContextMenu) {
                                e.preventDefault();
                                e.stopPropagation();
                                NiceModal.show(
                                  "contextMenu",
                                  ContextMenu({
                                    x: e.pageX,
                                    y: e.pageY,
                                    row,
                                  })
                                );
                              }
                            }}
                          >
                            <TableColum
                              row={row}
                              row_index={row_index}
                              columns={columns}
                              data={data}
                              setData={setData}
                              ContextMenu={ContextMenu}
                            />
                            {/* <FlexChild /> */}
                          </HorizontalFlex>
                        </FlexChild>
                      );
                    })}
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
const PageButtons = ({ page, setPage, maxPage }) => {
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

const TableHeader = ({ columns, data, setData }) => {
  return columns?.map((column, index) => {
    let displayValue;
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
const TableColum = ({
  row,
  columns,
  row_index,
  setData,
  data,
  ContextMenu,
}) => {
  return columns.map((column, index) => {
    let displayValue;
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
        onContextMenu={(e) => {
          if (column.ContextMenu) {
            e.preventDefault();
            e.stopPropagation();
            const menu = ContextMenu({ x: e.pageX, y: e.pageY, row });

            menu.rows = column.ContextMenu({
              pre: menu?.rows || [],
              row,
              cell,
            });

            NiceModal.show("contextMenu", menu);
          }
        }}
        onClick={(e) => {
          if (column.onClick) {
            e.preventDefault();
            e.stopPropagation();
            column.onClick({ e, row, cell, index });
          }
        }}
      >
        {displayValue || "데이터 없음"}
      </FlexChild>
    );
  });
};

export default Table;

/**
 *  Checkbox 예시
 *     label: <AllCheckbox name={"a"} id={getId("a")} />,
 *     code: "id",
 *     Cell: ({ cell }) => <CheckboxChild name="a" value={cell} />,
 */
