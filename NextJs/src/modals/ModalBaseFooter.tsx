import Button from "@/components/buttons/Button";
import VerticalFlex from "@/components/flex/VerticalFlex";
import style from "./ModalBase.module.css";

function ModalBaseFooter({
  buttonText,
  modalClose,
}: {
  buttonText: string;
  modalClose: Function;
}) {
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
