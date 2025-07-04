import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkedItems: [],
  singleSelectMode: false,
  lastContentKey: null, // 컨텐츠 변경 추적을 위한 새로운 상태
};

export const CheckboxReducer = createSlice({
  name: "checkbox",
  initialState,
  reducers: {
    check: (state, action) => {
      if (!state.checkedItems.includes(action.payload)) {
        state.checkedItems.push(action.payload);
      }
    },
    uncheck: (state, action) => {
      state.checkedItems = state.checkedItems.filter(
        (item) => item !== action.payload
      );
    },
    toggle: (state, action) => {
      const index = state.checkedItems.indexOf(action.payload);
      if (index === -1) {
        // 체크되지 않은 항목 선택 시
        if (state.singleSelectMode) {
          state.checkedItems = [action.payload];
        } else {
          state.checkedItems.push(action.payload);
        }
      } else {
        // 체크된 항목 선택 시
        // 단일 선택 모드이고 이미 체크된 항목이 하나뿐이라면 토글하지 않음
        if (!(state.singleSelectMode && state.checkedItems.length === 1)) {
          state.checkedItems.splice(index, 1);
        }
      }
    },
    setAll: (state, action) => {
      const { checked, values } = action.payload;
      if (checked) {
        const newItems = [...new Set([...state.checkedItems, ...values])];
        state.checkedItems = newItems;
      } else {
        state.checkedItems = state.checkedItems.filter(
          (item) => !values.includes(item)
        );
      }
    },
    setSingleSelectMode: (state, action) => {
      state.singleSelectMode = action.payload;
      if (action.payload && state.checkedItems.length > 1) {
        state.checkedItems = [state.checkedItems[0]];
      }
    },
    updateContentKey: (state, action) => {
      const { contentKey, shouldClear } = action.payload;
      if (shouldClear && state.lastContentKey !== contentKey) {
        state.checkedItems = [];
      }
      state.lastContentKey = contentKey;
    },
    reset: (state) => {
      state.checkedItems = [];
    },
  },
});

// Actions
export const {
  check,
  uncheck,
  toggle,
  setAll,
  setSingleSelectMode,
  updateContentKey, // 새로운 액션 추가
} = CheckboxReducer.actions;
// Selectors
export const selectCheckedItems = (state) => state.checkbox.checkedItems;

export const selectSingleSelectMode = (state) =>
  state.checkbox.singleSelectMode;

// export const selectIsChecked = (checkedItems, value) => checkedItems.includes(value);
// export const selectIsAllChecked = (checkedItems, values) =>
//     values.every(value => checkedItems.includes(value));
