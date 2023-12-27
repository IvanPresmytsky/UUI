import isEqual from 'lodash.isequal';
import { DataSourceState } from '../../../../../../../types';

export const searchWasChanged = <TFilter, TId>(
    prevValue?: DataSourceState<TFilter, TId>, newValue?: DataSourceState<TFilter, TId>,
) => newValue?.search !== prevValue?.search;

export const sortingWasChanged = <TFilter, TId>(
    prevValue?: DataSourceState<TFilter, TId>, newValue?: DataSourceState<TFilter, TId>,
) => !isEqual(newValue?.sorting, prevValue?.sorting);

export const filterWasChanged = <TFilter, TId>(
    prevValue: DataSourceState<TFilter, TId>, newValue?: DataSourceState<TFilter, TId>,
) => !isEqual(newValue?.filter, prevValue?.filter);

export const isQueryChanged = <TFilter, TId>(prevValue: DataSourceState<TFilter, TId>, newValue: DataSourceState<TFilter, TId>) =>
    searchWasChanged(prevValue, newValue)
    || sortingWasChanged(prevValue, newValue)
    || filterWasChanged(prevValue, newValue)
    || newValue?.page !== prevValue?.page
    || newValue?.pageSize !== prevValue?.pageSize;

export const onlySearchWasUnset = <TFilter, TId>(prevValue: DataSourceState<TFilter, TId>, newValue: DataSourceState<TFilter, TId>) =>
    searchWasChanged(prevValue, newValue) && !newValue.search
    && !(
        sortingWasChanged(prevValue, newValue)
        || filterWasChanged(prevValue, newValue)
        || newValue?.page !== prevValue?.page
        || newValue?.pageSize !== prevValue?.pageSize);
