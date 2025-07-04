import { useEffect, useRef } from "react";
import { useCheckboxGroup } from "shared/hooks/useCheckboxGroup";

export const ReduxCheckboxGroup = ({
  onChange,
  children,
  contentKey = null,
  clearOnContentChange = false,
  singleSelect = false,
}) => {
  const checkboxGroup = useCheckboxGroup({
    singleSelect,
    contentKey,
    clearOnContentChange,
  });
  const prevCheckedItemsRef = useRef(null);

  useEffect(() => {
    if (prevCheckedItemsRef.current) {
      const prevItems = prevCheckedItemsRef.current;
      const hasChanged =
        checkboxGroup.checkedItems.size !== prevItems.size ||
        [...checkboxGroup.checkedItems].some((item) => !prevItems.has(item)) ||
        [...prevItems].some((item) => !checkboxGroup.checkedItems.has(item));

      if (hasChanged) {
        onChange?.(checkboxGroup.checkedItems || []);
      }
    } else {
      onChange?.(checkboxGroup.checkedItems || []);
    }

    prevCheckedItemsRef.current = new Set(checkboxGroup.checkedItems);
  }, [checkboxGroup.checkedItems, onChange]);

  return <div>{children}</div>;
};
