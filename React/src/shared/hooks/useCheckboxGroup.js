import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    check,
    uncheck,
    toggle,
    setAll,
    selectCheckedItems,
    setSingleSelectMode,
    updateContentKey,
    selectIsChecked,
    selectIsAllChecked,
} from '../redux/checkbox/CheckboxReducer';

export const useCheckboxGroup = (options = {}) => {
    const {
        singleSelect = false,
        contentKey = null,        // 새로운 옵션
        clearOnContentChange = false  // 새로운 옵션
    } = options;
    const dispatch = useDispatch();
    const checkedItems = useSelector(selectCheckedItems);

        // 컨텐츠 키가 변경될 때마다 실행
        useEffect(() => {
            if (contentKey !== null) {
                dispatch(updateContentKey({
                    contentKey,
                    shouldClear: clearOnContentChange
                }));
            }
        }, [contentKey, clearOnContentChange, dispatch]);
    
        // singleSelect 모드 설정
        useEffect(() => {
            dispatch(setSingleSelectMode(singleSelect));
        }, [dispatch, singleSelect]);

    // singleSelect 옵션이 변경될 때 모드 설정
    // useEffect(() => {
    //     dispatch(setSingleSelectMode(singleSelect));
    // }, [dispatch, singleSelect]);

    // const checkedItemsSet = useMemo(() => new Set(checkedItems), [checkedItems]);

    // return {
    //     checkedItems: checkedItemsSet,
    //     check: useCallback((value) => {
    //         if (singleSelect) {
    //             dispatch(setSingleSelectMode(true));
    //             dispatch(setAll({ checked: false, values: checkedItems }));
    //         }
    //         dispatch(check(value));
    //     }, [dispatch, singleSelect, checkedItems]),
    //     uncheck: useCallback((value) => dispatch(uncheck(value)), [dispatch]),
    //     toggle: useCallback((value) => dispatch(toggle(value)), [dispatch]),
    //     setAll: useCallback(
    //         (checked, values) => {
    //             if (!singleSelect) {
    //                 dispatch(setAll({ checked, values }));
    //             }
    //         },
    //         [dispatch, singleSelect]
    //     ),
    //     isChecked: useCallback(
    //         (value) => checkedItemsSet.has(value),
    //         [checkedItemsSet]
    //     ),
    //     isAllChecked: useCallback(
    //         (values) => values.every(value => checkedItemsSet.has(value)),
    //         [checkedItemsSet]
    //     ),
    // };

    return {
        checkedItems: new Set(checkedItems),
        check: useCallback((value) => dispatch(check(value)), [dispatch]),
        uncheck: useCallback((value) => dispatch(uncheck(value)), [dispatch]),
        toggle: useCallback((value) => dispatch(toggle(value)), [dispatch]),
        isChecked: useCallback((value) => checkedItems.includes(value), [checkedItems]),
        isAllChecked: useCallback(
            (values) => values.every(value => checkedItems.includes(value)),
            [checkedItems]
        ),
        setAll: useCallback(
            (checked, values) => dispatch(setAll({ checked, values })),
            [dispatch]
        ),
        clearChecked: useCallback(() => {
            dispatch(setAll({ checked: false, values: checkedItems }));
        }, [dispatch, checkedItems])
    };
};