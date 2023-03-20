import { DataSourceState, SortingOption, DataRowPathItem, IMap } from "../../../../types";
import { LazyListViewProps } from "../LazyListView";
import { Subtotals, SubtotalsRecord } from "../subtotals";
import { CompositeKeysMap } from "./CompositeKeysMap";

export interface ApplyFilterOptions<TItem, TId, TFilter> {
    filter: DataSourceState<TFilter, TId>['filter'];
    getFilter?: (filter: TFilter) => (item: TItem) => boolean;
}

export interface ApplySearchOptions<TItem, TId, TFilter> {
    search: DataSourceState<TFilter, TId>['search'];
    getSearchFields?: (item: TItem) => string[];
}

export interface ApplySortOptions<TItem, TId, TFilter> {
    sorting: DataSourceState<TFilter, TId>['sorting'];
    sortBy?(item: TItem, sorting: SortingOption): any;
}

export interface TreeNodeInfo {
    count?: number;
}

export interface LoadTreeOptions<TItem, TId, TFilter> extends
    Pick<
        LazyListViewProps<TItem, TId, TFilter>,
        'api' | 'getChildCount' | 'filter' | 'fetchStrategy' | 'flattenSearchResults'
    > {
    loadAllChildren?(id: TId): boolean;
    isFolded?: (item: TItem) => boolean;
}

export interface TreeParams<TItem, TId> {
    getId?(item: TItem): TId;
    getParentId?(item: TItem): TId | undefined;
    complexIds?: boolean;
}

export type ItemsComparator<TItem> = (existingItem: TItem, newItem: TItem, cacheIsAbsent?: boolean) => number;

export interface ITree<TItem, TId, TSubtotals = void> {
    readonly byId: IMap<TId, TItem>;
    clearStructure(): ITree<TItem, TId, TSubtotals>;
    getRootIds(): TId[];
    getRootItems(): TItem[];
    getById(id: TId): TItem;
    getChildren(item: TItem): TItem[];
    getChildrenByParentId(parentId: TId): TItem[];
    getChildrenIdsByParentId(parentId: TId): TId[];
    getParentIdsRecursive(id: TId): TId[];
    getParents(id: TId): TItem[];
    getPathById(id: TId): DataRowPathItem<TId, TItem>[];
    getPathItem(item: TItem): DataRowPathItem<TId, TItem>;
    getNodeInfo(id: TId): TreeNodeInfo;
    isFlatList(): boolean;
    setSubtotals(subtotals?: IMap<TId, SubtotalsRecord<TSubtotals, TId>>): ITree<TItem, TId, TSubtotals>;
    getSubtotalRecordByParentId(parentId?: TId): SubtotalsRecord<TSubtotals, TId>;

    patch(
        items: TItem[],
        isDeletedProp?: keyof TItem,
        comparator?: ItemsComparator<TItem>,
    ): ITree<TItem, TId, TSubtotals>;
    cascadeSelection(
        currentSelection: TId[],
        selectedId: TId,
        isSelected: boolean,
        options: {
            isSelectable: (item: TItem) => boolean,
            cascade: boolean,
        },
    ): TId[];

    load<TFilter>(
        options: LoadTreeOptions<TItem, TId, TFilter>,
        value: Readonly<DataSourceState>,
    ): Promise<ITree<TItem, TId, TSubtotals>>;

    loadMissing<TFilter>(
        options: LoadTreeOptions<TItem, TId, TFilter>,
        value: Readonly<DataSourceState>,
    ): Promise<ITree<TItem, TId, TSubtotals>>;

    loadMissingIdsAndParents<TFilter>(
        options: LoadTreeOptions<TItem, TId, TFilter>,
        idsToLoad: TId[],
    ): Promise<ITree<TItem, TId, TSubtotals>>;

    getTotalRecursiveCount(): number;
    forEach(
        action: (item: TItem, id: TId, parentId: TId) => void,
        options?: {
            direction?: 'bottom-up' | 'top-down',
            parentId?: TId,
            includeParent?: boolean,
        },
    ): void;
    computeSubtotals(
        get: (item: TItem, hasChildren: boolean) => TSubtotals[keyof TSubtotals],
        add: (a: TSubtotals[keyof TSubtotals], b: TSubtotals[keyof TSubtotals]) => TSubtotals[keyof TSubtotals],
    ): CompositeKeysMap<TId, TSubtotals[keyof TSubtotals]> | Map<TId, TSubtotals[keyof TSubtotals]>;

    filter<TFilter>(options: ApplyFilterOptions<TItem, TId, TFilter>): ITree<TItem, TId, TSubtotals>;
    search<TFilter>(options: ApplySearchOptions<TItem, TId, TFilter>): ITree<TItem, TId, TSubtotals>;
    sort<TFilter>(options: ApplySortOptions<TItem, TId, TFilter>): ITree<TItem, TId, TSubtotals>;
}
