import Div from "components/div/Div";
import P from "components/P/P";
import style from "./CustomAlarm.module.css";
import clsx from "clsx";
import { useEffect } from "react";

function CustomAlarm(props) {
  useEffect(() => {
    if (props.show) {
      const timer = setTimeout(() => props.setShow(false), 1650);
      return () => clearTimeout(timer);
    }
  }, [props.show]);

  return (
    <Div className={clsx(style.alarm, { [style.active]: props.show })}>
      <P color={"#ffffff"} weight={500} size={16} whiteSpace={"noWrap"}>
        {props.message}
      </P>
    </Div>
  );
}

export default CustomAlarm;
