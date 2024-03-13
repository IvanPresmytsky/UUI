import { CascadeSelection, DataSourceState, SortingOption } from '../../../../../../types';
import { LazyListViewProps } from '../../../types';
import { ItemsMap } from '../../ItemsMap';
import { TreeStructure } from '../treeStructure';

export interface LoadTreeOptions<TItem, TId, TFilter>
    extends Pick<LazyListViewProps<TItem, TId, TFilter>, 'api' | 'getChildCount' | 'filter' | 'fetchStrategy' | 'flattenSearchResults'> {
    loadAllChildren?(id: TId): boolean;
    isLoadStrict?: boolean;
    isFolded?: (item: TItem) => boolean;
}

export type TreeStructureId = 'full' | 'visible';
export interface LoadOptions<TItem, TId, TFilter> {
    using?: TreeStructureId;
    options: LoadTreeOptions<TItem, TId, TFilter>,
    dataSourceState: Readonly<DataSourceState<TFilter, TId>>,
    withNestedChildren: boolean,
}

export interface LoadAllOptions<TItem, TId, TFilter> {
    using?: TreeStructureId;
    options: LoadTreeOptions<TItem, TId, TFilter>,
    dataSourceState: Readonly<DataSourceState>,
}

export interface UpdateTreeStructuresOptions<TItem, TId> {
    using?: TreeStructureId;
    treeStructure: TreeStructure<TItem, TId>;
    itemsMap: ItemsMap<TId, TItem>;
}
export interface ApplyFilterOptions<TItem, TId, TFilter> {
    filter: DataSourceState<TFilter, TId>['filter'];
    getFilter?: (filter: TFilter) => (item: TItem) => boolean;
}

export interface ApplySearchOptions<TItem, TId, TFilter> {
    search: DataSourceState<TFilter, TId>['search'];
    getSearchFields?: (item: TItem) => string[];
    sortSearchByRelevance?: boolean;
}

export interface ApplySortOptions<TItem, TId, TFilter> {
    sorting: DataSourceState<TFilter, TId>['sorting'];
    sortBy?(item: TItem, sorting: SortingOption): any;
}

export type ItemsComparator<TItem> = (newItem: TItem, existingItem: TItem) => number;

export interface FilterOptions<TItem, TId, TFilter = any> extends ApplyFilterOptions<TItem, TId, TFilter> {}
export interface SortOptions<TItem, TId, TFilter> extends ApplySortOptions<TItem, TId, TFilter> {}
export interface SearchOptions<TItem, TId, TFilter> extends ApplySearchOptions<TItem, TId, TFilter> {}

export interface CascadeSelectionOptions<TItem, TId> {
    using?: TreeStructureId;
    currentCheckedIds: TId[];
    checkedId: TId;
    isChecked: boolean;
    isCheckable?: (item: TItem) => boolean;
    cascadeSelectionType?: CascadeSelection;
}

export interface PatchOptions<TItem> {
    using?: TreeStructureId;
    items: TItem[];
    isDeleted?: () => boolean;
    comparator?: ItemsComparator<TItem>;
}
