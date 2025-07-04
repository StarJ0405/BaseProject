import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import P from "components/P/P";

import clsx from "clsx";
import { useCategory } from "providers/CategoryProvider";
import { useTranslation } from "react-i18next";
import style from "./SortHeader.module.css";

function SortHeader({ onSortClick }) {
  const { sortList, selectedSort, setSelectedSort } = useCategory();
  const { t } = useTranslation();

  const handleClick = (sort) => {
    setSelectedSort(sort);
    onSortClick?.(); // 부모에서 전달된 콜백 실행
  };

  return (
    <Div width={"fit-content"} zIndex={500}>
      <HorizontalFlex gap={7} width={"fit-content"}>
        {sortList?.map((sort) => (
          <FlexChild
            key={sort?.name}
            justifyContent={"center"}
            className={clsx(style.sortBtn, {
              [style.active]: sort?.name === selectedSort?.name,
            })}
            // onClick={() => setSelectedSort(sort)}
            onClick={() => handleClick(sort)}
          >
            <P
              className={clsx(style.sortText, {
                [style.active]: sort?.name === selectedSort?.name,
              })}
            >
              {/* {sort?.name} */}
              {t(sort?.name)}
            </P>
          </FlexChild>
        ))}
      </HorizontalFlex>
    </Div>
  );
}

export default SortHeader;
