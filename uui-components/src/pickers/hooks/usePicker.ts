import { useCallback, useContext } from 'react';
import isEqual from 'lodash.isequal';
import {
    DataSourceListProps, DataSourceState, PickerBaseProps, PickerFooterProps, UuiContext,
} from '@epam/uui-core';
import { applyValueToDataSourceState, dataSourceStateToValue } from '../bindingHelpers';
import { PickerState } from './types';

export function usePicker<TItem, TId, TProps extends PickerBaseProps<TItem, TId>>(
    props: TProps,
    pickerState: PickerState,
) {
    const context = useContext(UuiContext);
    const { showSelected, setShowSelected, dataSourceState, setDataSourceState } = pickerState;
    const {
        dataSource,
        emptyValue,
        value,
        onValueChange,
        getValueChangeAnalyticsEvent,
        entityName,
        entityPluralName,
        selectionMode,
        getSearchFields,
        isFoldedByDefault,
        sortBy,
        cascadeSelection,
    } = props;

    const handleDataSourceValueChange = (newDataSourceState: React.SetStateAction<DataSourceState<any, TId>>) => {
        let dsState: DataSourceState;
        if (typeof newDataSourceState === 'function') {
            dsState = newDataSourceState(dataSourceState);
        } else {
            dsState = newDataSourceState;
        }

        if (showSelected && (!dsState.checked?.length || dsState.search)) {
            setShowSelected(false);
        }

        if (dsState.search !== dataSourceState.search) {
            dsState.focusedIndex = 0;
        }

        setDataSourceState(dsState);
        const newValue = dataSourceStateToValue(props, dsState, dataSource);
        if (!isEqual(value, newValue)) {
            handleSelectionValueChange(newValue);
        }
    };

    const handleSelectionValueChange = useCallback((newValue: any) => {
        onValueChange(newValue);

        if (getValueChangeAnalyticsEvent) {
            const event = getValueChangeAnalyticsEvent(newValue, value);
            context.uuiAnalytics.sendEvent(event);
        }
    }, [onValueChange, getValueChangeAnalyticsEvent]);

    const getName = (i: (TItem & { name?: string }) | void) => {
        const unknownStr = 'Unknown';
        if (props.getName) {
            try {
                return props.getName(i as TItem);
            } catch (e) {
                return unknownStr;
            }
        }
        return i ? i.name : unknownStr;
    };

    const getPluralName = () => {
        if (!entityName) return;
        if (entityName.endsWith('s')) return entityName.concat('es');
        if (entityName.endsWith('y')) return entityName.concat('(s)');
        return entityName.concat('s');
    };

    const getEntityName = (countSelected?: number) => {
        if ((!entityName && !entityPluralName) || (!entityName && countSelected === 1)) return '';
        if ((countSelected <= 1 && entityName) || selectionMode === 'single') return entityName;
        return entityPluralName || getPluralName();
    };

    const isSingleSelect = () => selectionMode === 'single';

    const getSelectedIdsArray = (selected: TId | TId[] | null | undefined): TId[] => {
        if (selected) {
            if (isSingleSelect()) {
                return [selected as TId];
            } else {
                return selected as TId[];
            }
        }
        return [];
    };

    const getDataSourceState = () => applyValueToDataSourceState(props, dataSourceState, props.value, props.dataSource);

    const getRowOptions = () => {
        if (isSingleSelect()) {
            return { isSelectable: true };
        }

        return { checkbox: { isVisible: true } };
    };

    const clearSelection = () => {
        view.clearAllChecked();

        handleDataSourceValueChange({
            ...dataSourceState,
            selectedId: emptyValue as undefined,
        });
    };

    const hasSelection = () => {
        if (Array.isArray(value)) {
            return value.length !== 0;
        } else {
            return value !== undefined && value !== null;
        }
    };

    const view = dataSource.useView(getDataSourceState(), handleDataSourceValueChange, {
        rowOptions: getRowOptions(),
        getSearchFields: getSearchFields || ((item: TItem) => [getName(item)]),
        isFoldedByDefault,
        ...(sortBy ? { sortBy } : {}),
        ...(cascadeSelection ? { cascadeSelection } : {}),
        ...(props.getRowOptions ? { getRowOptions: props.getRowOptions } : {}),
        backgroundReload: true,
    }, [dataSource]);

    const getSelectedRows = (visibleCount?: number) => {
        if (hasSelection()) {
            return view.getSelectedRows({ visibleCount });
        }
        return [];
    };

    const getListProps = (): DataSourceListProps => {
        const listProps = view.getListProps();
        if (showSelected) {
            const checked = getDataSourceState().checked;
            const checkedCount = checked ? checked.length : 0;
            return {
                ...listProps,
                rowsCount: checkedCount,
                knownRowsCount: checkedCount,
                exactRowsCount: checkedCount,
            };
        } else {
            return listProps;
        }
    };

    const getFooterProps = (): PickerFooterProps<TItem, TId> => ({
        view,
        showSelected: {
            value: showSelected,
            onValueChange: setShowSelected,
        },
        clearSelection,
        selectionMode,
    });

    return {
        context,
        dataSourceState,
        getName,
        getPluralName,
        getEntityName,
        isSingleSelect,
        getSelectedIdsArray,
        getDataSourceState,
        getRowOptions,
        clearSelection,
        hasSelection,
        getSelectedRows,
        view,
        getListProps,
        getFooterProps,
        handleDataSourceValueChange,
        handleSelectionValueChange,
    };
}
