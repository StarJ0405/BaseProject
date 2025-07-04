import P from "components/P/P";
import Button from "components/buttons/Button";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import style from "./ModalBase.module.css";

function ModalBaseHeader({ title, modalClose, headerStyle, color, closeBtnWhite,}) {
  return (
    <div className={style.header} style={headerStyle}>
      <HorizontalFlex>
        <FlexChild width={50}></FlexChild>
        <FlexChild>
          <VerticalFlex>
            <P size={25} color={color} weight={700}>
              {title}
            </P>
          </VerticalFlex>
        </FlexChild>
        <FlexChild width={50}>
          <VerticalFlex>
            <Button className={style.headerCloseButton} onClick={modalClose}>
              {/* &times; */}
              {closeBtnWhite ? (
                <Icon name={"closeBtnWhite2x"} width={18} />
              ) : (
                <Icon name={"closeBtn2x"} width={44} />
              )}
            </Button>
          </VerticalFlex>
        </FlexChild>
      </HorizontalFlex>
    </div>
  );
}

export default ModalBaseHeader;
