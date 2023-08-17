import React, { useMemo, useRef, useEffect } from 'react';
import { Modifier } from 'react-popper';
import {
    DataRowProps, isMobile, mobilePopperModifier, IDropdownToggler, Lens, PickerFooterProps, DataSourceState,
} from '@epam/uui-core';
import { PickerTogglerProps } from '../PickerToggler';
import { PickerBodyBaseProps } from '../PickerBodyBase';
import { applyValueToDataSourceState, dataSourceStateToValue } from '../bindingHelpers';
import { handleDataSourceKeyboard, DataSourceKeyboardParams } from '../KeyboardUtils';
import { i18n } from '../../i18n';
import { getMaxItems } from '../helpers';
import { usePicker } from './usePicker';
import { usePickerInputState } from './usePickerInputState';
import { UsePickerInputProps } from './types';

const initialRowsVisible = 20; /* estimated, with some reserve to allow start scrolling without fetching more data */

export function usePickerInput<TItem, TId, TProps>(props: UsePickerInputProps<TItem, TId, TProps>) {
    const popperModifiers: Modifier<any>[] = useMemo(() => [
        {
            name: 'offset',
            options: { offset: [0, 6] },
        }, mobilePopperModifier,
    ], []);

    const togglerRef = useRef<HTMLElement>();
    const pickerInputState = usePickerInputState({
        dataSourceState: { visibleCount: initialRowsVisible },
    });
    const {
        opened, setOpened, isSearchChanged, setIsSearchChanged,
        dataSourceState, setDataSourceState, showSelected, setShowSelected,
    } = pickerInputState;

    const picker = usePicker<TItem, TId, UsePickerInputProps<TItem, TId, TProps>>(props, pickerInputState);
    const {
        context,
        view,
        handleDataSourceValueChange,
        getEntityName,
        clearSelection,
        getDataSourceState,
        isSingleSelect,
        getListProps,
        getName,
        getSelectedRows,
        handleSelectionValueChange,
    } = picker;

    const lens = useMemo(
        () => Lens.onEditable<DataSourceState>({ value: dataSourceState, onValueChange: setDataSourceState }),
        [dataSourceState],
    );

    useEffect(() => {
        const prevValue = dataSourceStateToValue(props, dataSourceState, props.dataSource);
        if (prevValue !== props.value) {
            setDataSourceState(
                applyValueToDataSourceState(
                    props,
                    dataSourceState,
                    props.value,
                    props.dataSource,
                ),
            );
        }
    }, [props.value]);

    useEffect(() => {
        const prevValue = dataSourceStateToValue(props, dataSourceState, props.dataSource);
        if (props.value === prevValue && props.isDisabled && opened) {
            setOpened(false);
        }
    }, [props.isDisabled, opened, props.value]);

    const toggleDropdownOpening = (newOpened: boolean) => {
        if (isMobile()) {
            document.body.style.overflow = opened ? 'hidden' : '';
        }

        setDataSourceState({
            ...dataSourceState,
            topIndex: 0,
            visibleCount: initialRowsVisible,
            focusedIndex: 0,
            search: '',
        });

        setIsSearchChanged(false);
        setOpened(newOpened);
        setShowSelected(false);
    };

    const toggleBodyOpening = (newOpened: boolean) => {
        if (opened === newOpened
            || (props.minCharsToSearch && (dataSourceState.search?.length ?? 0) < props.minCharsToSearch)
        ) {
            return;
        }
        if (props.editMode === 'modal') {
            props.toggleModalOpening?.(newOpened);
        } else {
            toggleDropdownOpening(newOpened);
        }
    };

    const onSelect = (row: DataRowProps<TItem, TId>) => {
        toggleDropdownOpening(false);
        handleDataSourceValueChange({ ...dataSourceState, search: '', selectedId: row.id });
        togglerRef.current?.focus();
    };

    const getSearchPosition = () => {
        if (isMobile() && props.searchPosition !== 'none') return 'body';
        if (props.editMode === 'modal' && props.searchPosition !== 'none') return 'body';
        if (!props.searchPosition) {
            return props.selectionMode === 'multi' ? 'body' : 'input';
        } else {
            return props.searchPosition;
        }
    };

    const getPlaceholder = () => props.placeholder ?? i18n.pickerInput.defaultPlaceholder(getEntityName());

    const handleClearSelection = () => {
        toggleDropdownOpening(false);
        clearSelection();
    };

    const defaultShouldShowBody = () => {
        const searchPosition = props.searchPosition || 'input';
        const isOpened = opened && !props.isDisabled;

        if (props.minCharsToSearch && props.editMode !== 'modal' && searchPosition === 'input') {
            const isEnoughSearchLength = dataSourceState.search
                ? dataSourceState.search.length >= props.minCharsToSearch
                : false;
            return isEnoughSearchLength && isOpened;
        }
        return isOpened;
    };

    const shouldShowBody = () => (props.shouldShowBody ?? defaultShouldShowBody)();

    const handlePickerInputKeyboard = (rows: DataSourceKeyboardParams['rows'], e: React.KeyboardEvent<HTMLElement>) => {
        if (props.isDisabled || props.isReadonly) return;

        if (e.key === 'Enter' && !opened) {
            return toggleBodyOpening(true);
        }

        if (e.key === 'Escape' && opened) {
            e.preventDefault();
            toggleDropdownOpening(false);
            togglerRef.current?.focus();
        }

        handleDataSourceKeyboard(
            {
                value: getDataSourceState(),
                onValueChange: handleDataSourceValueChange,
                listView: view,
                editMode: props.editMode,
                rows,
            },
            e,
        );
    };

    const getPickerBodyProps = (rows: DataRowProps<TItem, TId>[]): Omit<PickerBodyBaseProps, 'rows'> => {
        return {
            value: getDataSourceState(),
            onValueChange: handleDataSourceValueChange,
            search: lens.prop('search').toProps(),
            showSearch: getSearchPosition() === 'body',
            rawProps: {
                'aria-multiselectable': props.selectionMode === 'multi' ? true : null,
                'aria-orientation': 'vertical',
                ...props.rawProps?.body,
            },
            renderNotFound:
                props.renderNotFound
                && (() =>
                    props.renderNotFound({
                        search: dataSourceState.search,
                        onClose: () => toggleBodyOpening(false),
                    })),
            onKeyDown: (e) => handlePickerInputKeyboard(rows, e),
            fixedBodyPosition: props.fixedBodyPosition,
        };
    };

    const handleTogglerSearchChange = (value: string) => {
        let isOpen = !opened && value.length > 0 ? true : opened;
        if (props.minCharsToSearch) {
            isOpen = value.length >= props.minCharsToSearch;
        }

        setDataSourceState((dsState) => ({
            ...dsState,
            focusedIndex: -1,
            search: value,
        }));

        setOpened(isOpen);
        setIsSearchChanged(true);
    };

    const closePickerBody = () => {
        setDataSourceState((dsState) => ({
            ...dsState,
            search: '',
        }));
        setOpened(false);
        setIsSearchChanged(false);
    };

    const getRows = () => {
        if (!shouldShowBody()) return [];

        let preparedRows: DataRowProps<TItem, TId>[];

        if (!showSelected) {
            preparedRows = view.getVisibleRows();
        } else {
            const { topIndex, visibleCount } = dataSourceState;
            preparedRows = view.getSelectedRows({ topIndex, visibleCount });
        }

        return preparedRows.map((rowProps) => {
            const newRowProps = { ...rowProps };
            if (rowProps.isSelectable && isSingleSelect() && props.editMode !== 'modal') {
                newRowProps.onSelect = onSelect;
            }

            return newRowProps;
        });
    };

    const handleCloseBody = () => {
        toggleBodyOpening(false);
    };

    const getFooterProps = (): PickerFooterProps<TItem, TId> & { onClose: () => void } => {
        const footerProps = picker.getFooterProps();
        return {
            ...footerProps,
            onClose: handleCloseBody,
            selectionMode: props.selectionMode,
            disableClear: props.disableClear,
        };
    };

    const returnFocusToInput = (): void => {
        togglerRef.current.focus();
    };

    const getSearchValue = (): string | null => {
        // only for selectionMode = 'single': we're getting current value and put it into search, and when search changed we turn value to dataSourceState.search
        if (props.selectionMode === 'single' && !isSearchChanged && (props.value !== undefined && props.value !== null)) {
            if (props.valueType === 'id') {
                return getName(props?.dataSource.getById(props.value as TId));
            }
            if (props.valueType === 'entity') {
                return getName(props.value as TItem);
            }
        }
        return dataSourceState.search;
    };

    const getTogglerProps = (rows: DataRowProps<TItem, TId>[]): PickerTogglerProps<TItem, TId> => {
        const selectedRowsCount = view.getSelectedRowsCount();
        const allowedMaxItems = getMaxItems(props.maxItems);
        const itemsToTake = selectedRowsCount > allowedMaxItems ? allowedMaxItems : selectedRowsCount;
        const selectedRows = getSelectedRows(itemsToTake);
        const {
            isDisabled,
            autoFocus,
            isInvalid,
            isReadonly,
            isSingleLine,
            maxItems,
            minCharsToSearch,
            inputCx,
            validationMessage,
            validationProps,
            disableClear: propDisableClear,
            icon,
            iconPosition,
            onIconClick,
        } = props;
        const searchPosition = getSearchPosition();
        const forcedDisabledClear = Boolean(searchPosition === 'body' && !selectedRowsCount);
        const disableClear = forcedDisabledClear || propDisableClear;
        let searchValue: string | undefined = getSearchValue();
        if (isSingleSelect() && selectedRows[0]?.isLoading) {
            searchValue = undefined;
        }

        return {
            isSingleLine,
            maxItems,
            minCharsToSearch,
            isInvalid,
            validationProps,
            validationMessage,
            isReadonly,
            isDisabled,
            autoFocus,
            icon,
            iconPosition,
            onIconClick,
            onFocus: props.onFocus,
            onClear: handleClearSelection,
            onBlur: props.onBlur,
            selection: selectedRows,
            selectedRowsCount,
            placeholder: getPlaceholder(),
            getName: (i: any) => getName(i),
            entityName: getEntityName(selectedRowsCount),
            pickerMode: isSingleSelect() ? 'single' : 'multi',
            searchPosition,
            onKeyDown: (e) => handlePickerInputKeyboard(rows, e),
            disableSearch: searchPosition !== 'input',
            disableClear: disableClear,
            toggleDropdownOpening,
            closePickerBody: closePickerBody,
            rawProps: props.rawProps?.input,
            value: searchValue,
            cx: inputCx,
        };
    };

    const getTargetRef = (props: IDropdownToggler & PickerTogglerProps<TItem, TId>) => {
        return {
            ref: (node: HTMLElement) => {
                (togglerRef as React.MutableRefObject<HTMLElement>).current = node;
                (props.ref as React.RefCallback<HTMLElement>)(node);
            },
        };
    };

    return {
        context,
        dataSourceState,
        getPlaceholder,
        getName,
        getRows,
        getTargetRef,
        getTogglerProps,
        getFooterProps,
        returnFocusToInput,
        shouldShowBody,
        toggleBodyOpening,
        isSingleSelect,
        popperModifiers,
        getPickerBodyProps,
        getListProps,
        handleTogglerSearchChange,
        handleDataSourceValueChange,
        handleSelectionValueChange,
    };
}
