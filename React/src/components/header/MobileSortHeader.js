import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import P from "components/P/P";

import clsx from "clsx";
import { useCategory } from "providers/CategoryProvider";
import style from "./MobileSortHeader.module.css";

function MobileSortHeader({ setIsOverlayVisible }) {
  const { sortList, selectedSort, setSelectedSort } = useCategory();

  const handleSortClick = (sort) => {
    setSelectedSort(sort);
    setIsOverlayVisible(false); // 오버레이 닫기
  };

  return (
    <Div
      position={"fixed"}
      top={60}
      right={36}
      width={"fit-content"}
      zIndex={500}
    >
      <HorizontalFlex gap={5} width={"fit-content"}>
        {sortList?.map((sort, index) => (
          <FlexChild
            key={index}
            justifyContent={"center"}
            className={clsx(style.sortBtn, {
              [style.active]: sort?.name === selectedSort?.name,
            })}
            onClick={() => handleSortClick(sort)}
          >
            <P
              className={clsx(style.sortText, {
                [style.active]: sort?.name === selectedSort?.name,
              })}
            >
              {sort?.name}
            </P>
          </FlexChild>
        ))}
      </HorizontalFlex>
    </Div>
  );
}

export default MobileSortHeader;
