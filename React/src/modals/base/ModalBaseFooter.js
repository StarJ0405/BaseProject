import Button from "components/buttons/Button";
import style from "./ModalBase.module.css";
import VerticalFlex from "components/flex/VerticalFlex";

function ModalBaseFooter({ buttonText, modalClose }) {
  return (
    <div className={style.footer}>
      <VerticalFlex justifyContent="center" alignItems="flex-end" height="100%">
        <Button className={style.close} onClick={modalClose}>
          {buttonText}
        </Button>
      </VerticalFlex>
    </div>
  );
}

export default ModalBaseFooter;
