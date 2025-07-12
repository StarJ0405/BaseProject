import Div from "@/components/div/Div";
import FlexChild from "@/components/flex/FlexChild";
import HorizontalFlex from "@/components/flex/HorizontalFlex";
import VerticalFlex from "@/components/flex/VerticalFlex";
import P from "@/components/P/P";
import Tooltip from "@/components/tooltip/Tooltip";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import styles from "./ContextMenuModal.module.css";
interface RowInterface {
  label?: string;
  key?: string;
  disabled?: boolean;
  onClick?: () => void;
  hotKey?: string;
  onHotKey?: () => void;
  rows?: RowInterface[];
}
const ContextMenuModal = NiceModal.create(
  ({
    x,
    y,
    width = "fit-content",
    minWidth = 350,
    maxWidth,
    height,
    backgroundColor,
    color,
    border,
    borderRadius,
    padding,
    rows = [],
    CustomContent, // ({ close }) => <></>
  }: {
    x: number;
    y: number;
    width?: CSSProperties["width"];
    minWidth?: CSSProperties["maxWidth"];
    maxWidth?: CSSProperties["minWidth"];
    height?: number | string;
    backgroundColor?: CSSProperties["backgroundColor"];
    color?: CSSProperties["color"];
    border?: CSSProperties["border"];
    borderRadius?: CSSProperties["borderRadius"];
    padding?: CSSProperties["padding"];
    rows: RowInterface[];
    CustomContent?: ({ close }: { close: () => void }) => React.ReactNode;
  }) => {
    const modal = useModal();
    const divRef = useRef<any>(null);
    const [isMounted, setMounted] = useState(false);
    const location = usePathname();
    const [X, setX] = useState<number>(0);
    const [Y, setY] = useState<number>(0);
    const keysRef = useRef<RowInterface[]>([]);
    const onEvent = (e: any) => {
      if (!divRef.current || !divRef.current.contains(e.target)) modal.remove();
    };
    const onScroll = (e: any) => {
      modal.remove();
    };
    useEffect(() => {
      window.addEventListener("click", onEvent);
      window.addEventListener("wheel", onScroll);
      return () => {
        window.removeEventListener("click", onEvent);
        window.removeEventListener("wheel", onScroll);
      };
    }, []);

    useHotkeys("*", (e) => {
      keysRef.current.forEach(({ key, onHotKey }) => {
        if (key === e.key && onHotKey) {
          onHotKey();

          e.preventDefault();
        }
      });
      modal.remove();
    });
    useEffect(() => {
      if (isMounted) {
        window.addEventListener("contextmenu", onEvent);
      }
      return () => window.removeEventListener("contextmenu", onEvent);
    }, [isMounted]);
    useEffect(() => {
      if (!CustomContent && (!rows || rows?.length === 0)) {
        modal.remove();
        return;
      }

      setMounted(true);
    }, []);

    useEffect(() => {
      if (rows && rows?.length > 0) {
        keysRef.current = [];
        const registHotKey = (row: RowInterface | RowInterface[]) => {
          if (Array.isArray(row)) {
            row.forEach((r) => registHotKey(r));
          } else {
            if (row?.rows && row?.rows?.length > 0)
              row.rows?.forEach((r: RowInterface) => registHotKey(r));
            if (row.hotKey && (row.onHotKey || row.onClick)) {
              keysRef.current = [
                ...keysRef.current,
                {
                  key: String(row.hotKey).toLowerCase(),
                  onHotKey: row.onHotKey || row.onClick,
                },
              ];
            }
          }
        };
        registHotKey(rows);
      }
    }, [rows]);

    useEffect(() => {
      if (divRef.current) {
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const divRect = divRef.current.getBoundingClientRect();

        let X = x - scrollX;
        if (X < 0) {
          // 0보다 작은 경우는 실제로 불가능
          X += divRect.width;
        } else if (X + divRect.width > windowWidth) {
          X -= divRect.width;
        }
        let Y = y - scrollY;
        if (Y < 0) {
          // 0보다 작은경우는 실제로 불가능
          Y += divRect.height;
        } else if (Y + divRect.height > windowHeight) {
          Y -= divRect.height;
        }
        setX(X);
        setY(Y);
      }
    }, [divRef.current, x, y]);
    useEffect(() => {
      if (isMounted) modal.remove();
    }, [location]);
    const Row = ({
      row,
      index,
      max,
    }: {
      row: any;
      index: number | string;
      max: number;
    }) => {
      if (Array.isArray(row)) {
        if (row?.length === 0) return <></>;
        return (
          <>
            {row.map((r, idx) => (
              <Row
                row={r}
                max={row?.length}
                index={`${index}_${idx}`}
                key={`row_${index}_${idx}`}
              />
            ))}
            {index !== max - 1 && (
              <Div
                marginTop={2}
                marginBottom={2}
                border={"1px solid #a0a0a0"}
              />
            )}
          </>
        );
      } else
        return row?.rows?.length > 0 ? (
          <Tooltip
            showClassName={styles.parent}
            zIndex={20001}
            position="right"
            delay={200}
            content={
              <Div
                width={width}
                minWidth={minWidth}
                maxWidth={maxWidth}
                height={height}
                backgroundColor={backgroundColor}
                color={color}
                border={border}
                borderRadius={borderRadius}
                padding={padding}
                className={styles.container}
              >
                {row.rows && (
                  <VerticalFlex
                    borderRadius={15}
                    paddingTop={10}
                    paddingBottom={10}
                  >
                    {row.rows?.map((r: any, idx: number) => (
                      <Row
                        row={r}
                        max={row.rows?.length}
                        index={`${index}_${idx}`}
                        key={`row_${index}_index`}
                      />
                    ))}
                  </VerticalFlex>
                )}
              </Div>
            }
            width={"100%"}
          >
            <FlexChild
              className={clsx(styles.row, { [styles.disabled]: row?.disabled })}
              onClick={() => {
                if (!row?.disabled) {
                  row?.onClick?.();
                  if (!row?.rows || row?.rows?.length === 0) modal.remove();
                }
              }}
              onContextMenu={(e: any) => {
                e.preventDefault();
                if (!row?.disabled) {
                  row?.onClick?.();
                  modal.remove();
                }
              }}
              paddingLeft={20}
              paddingRight={20}
            >
              <HorizontalFlex gap={5} paddingTop={5} paddingBottom={5}>
                <FlexChild width={15}>{row?.icon}</FlexChild>
                <HorizontalFlex>
                  <FlexChild width={"max-content"}>
                    <P fontSize={13.5}>{row?.label}</P>
                  </FlexChild>
                  <FlexChild width={"max-content"}>
                    <P fontSize={13.5}>{">"}</P>
                  </FlexChild>
                </HorizontalFlex>
              </HorizontalFlex>
            </FlexChild>
          </Tooltip>
        ) : (
          <FlexChild
            className={clsx(styles.row, { [styles.disabled]: row?.disabled })}
            onClick={() => {
              if (!row?.disabled) {
                row?.onClick?.();
                if (!row?.rows || row?.rows?.length === 0) modal.remove();
              }
            }}
            onContextMenu={(e: any) => {
              e.preventDefault();
              if (!row?.disabled) {
                row?.onClick?.();
                modal.remove();
              }
            }}
            paddingLeft={20}
            paddingRight={20}
          >
            <HorizontalFlex gap={5} paddingTop={5} paddingBottom={5}>
              <FlexChild width={15}>{row?.icon}</FlexChild>
              <HorizontalFlex>
                <FlexChild width={"max-content"}>
                  <P fontSize={13.5}>
                    {row?.label}
                    {row.hotKey ? `(${String(row.hotKey).toUpperCase()})` : ""}
                  </P>
                </FlexChild>
                <FlexChild width={"max-content"}>
                  <P fontSize={13.5}>{row?.key}</P>
                </FlexChild>
              </HorizontalFlex>
            </HorizontalFlex>
          </FlexChild>
        );
    };
    return (
      <Div
        Ref={divRef}
        position={"fixed"}
        top={Y}
        left={X}
        zIndex={20000}
        width={width}
        minWidth={minWidth}
        maxWidth={maxWidth}
        height={height}
        backgroundColor={backgroundColor}
        color={color}
        border={border}
        borderRadius={borderRadius}
        padding={padding}
        className={styles.container}
        onContextMenu={(e: any) => {
          e.preventDefault();
          modal.remove();
        }}
      >
        {typeof CustomContent === "function" ? (
          <CustomContent close={modal.remove} />
        ) : (
          CustomContent
        )}
        {rows && rows?.length > 0 && (
          <VerticalFlex borderRadius={15} paddingTop={10} paddingBottom={10}>
            {rows?.map((row, index) => (
              <Row
                row={row}
                index={index}
                max={rows?.length}
                key={`row_${index}`}
              />
            ))}
          </VerticalFlex>
        )}
      </Div>
    );
  }
);

export default ContextMenuModal;
