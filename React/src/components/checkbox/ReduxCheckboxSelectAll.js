import React, { memo, useCallback } from "react";
import { useCheckboxGroup } from "shared/hooks/useCheckboxGroup";
import { ReduxCheckbox } from "./ReduxCheckbox";
import P from "components/P/P";

export const ReduxCheckboxSelectAll = memo(
  ({ values, label, display, size, style, fontSize, onClick }) => {
    const { isAllChecked, setAll } = useCheckboxGroup();
    const checked = isAllChecked(values);

    const handleChange = useCallback(
      (checked) => {
        setAll(checked, values);
      },
      [setAll, values]
    );

    return (
      <label style={{ display: display ? display : "block", ...style }}>
        <ReduxCheckbox
          checked={checked}
          onChange={handleChange}
          size={size}
          value="all"
        />
        <P size={fontSize}>
          <span onClick={() => handleChange(!checked)} style={{ cursor : "pointer" }}>{label}</span>
        </P>
      </label>
    );
  }
);
