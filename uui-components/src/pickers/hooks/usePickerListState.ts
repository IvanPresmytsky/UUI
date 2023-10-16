import { useEffect, useRef, useState } from 'react';
import { usePickerState } from './usePickerState';
import { PickerListState, UsePickerListStateProps } from './types';
import isEqual from 'lodash.isequal';

export function usePickerListState<TId>(props: UsePickerListStateProps<TId>): PickerListState<TId> {
    const pickerState = usePickerState(props);
    const prevProps = useRef(props);

    const [visibleIds, setVisibleIds] = useState<TId[]>(props.visibleIds ?? []);

    useEffect(() => {
        if (
            !isEqual(prevProps.current?.dataSourceState, props.dataSourceState)
            && !isEqual(props.dataSourceState, pickerState.dataSourceState)
        ) {
            pickerState.setDataSourceState({
                ...pickerState.dataSourceState,
                ...props.dataSourceState,
            });
        }

        if (!isEqual(prevProps.current?.visibleIds, props.visibleIds) && !isEqual(props.visibleIds, visibleIds)) {
            setVisibleIds(props.visibleIds);
        }
    }, [props]);

    useEffect(() => {
        prevProps.current = props;
    }, [props]);

    return {
        ...pickerState,
        visibleIds,
        setVisibleIds,
    };
}
