import Button from "components/buttons/Button";
import style from "./ModalBase.module.css";

function ModalBaseMain(props) {
  return (
    <div
      className={style.main}
      style={{ padding: props.padding ? props.padding + "px" : null }}
    >
      {props.withCloseButton ? (
        <Button className={style.closeButton} onClick={props.modalClose}>
          &times;
        </Button>
      ) : null}

      {props.children}
    </div>
  );
}

export default ModalBaseMain;
