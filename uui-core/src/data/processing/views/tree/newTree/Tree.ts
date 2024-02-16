import isEqual from 'lodash.isequal';
import { CascadeSelection, CascadeSelectionTypes, DataRowPathItem, DataSourceState, IMap, LazyDataSourceApi } from '../../../../../types';
import { ITree } from './ITree';
import { FULLY_LOADED, NOT_FOUND_RECORD } from '../constants';
import { FetchingHelper } from './treeStructure';
import { TreeNodeInfo } from './exposed';

export interface LoadOptions<TItem, TId, TFilter = any> {
    tree: ITree<TItem, TId>;
    api: LazyDataSourceApi<TItem, TId, TFilter>;
    getChildCount?(item: TItem): number;
    isFolded?: (item: TItem) => boolean;
    dataSourceState: DataSourceState<TFilter, TId>;
    filter?: TFilter;
    withNestedChildren?: boolean;
}

export interface LoadMissingOnCheckOptions<TItem, TId, TFilter = any> extends Omit<LoadOptions<TItem, TId, TFilter>, 'withNestedChildren'> {
    cascadeSelection?: CascadeSelection;
    checkedId?: TId;
    isRoot: boolean;
    isChecked: boolean;
}

export interface TreeLoadResult<TItem, TId> {
    loadedItems: TItem[];
    byParentId: IMap<TId, TId[]>;
    nodeInfoById: IMap<TId, TreeNodeInfo>;
}

export class Tree {
    public static getParents<TItem, TId>(id: TId, tree: ITree<TItem, TId>) {
        const parentIds: TId[] = [];
        let parentId = id;
        while (true) {
            const item = tree.getById(parentId);
            if (item === NOT_FOUND_RECORD) {
                break;
            }
            parentId = tree.getParams().getParentId?.(item);
            if (parentId === undefined) {
                break;
            }
            parentIds.unshift(parentId);
        }
        return parentIds;
    }

    public static getPathById<TItem, TId>(id: TId, tree: ITree<TItem, TId>): DataRowPathItem<TId, TItem>[] {
        const foundParents = this.getParents(id, tree);
        const path: DataRowPathItem<TId, TItem>[] = [];
        foundParents.forEach((parentId) => {
            const parent = tree.getById(parentId);
            if (parent === NOT_FOUND_RECORD) {
                return;
            }
            const pathItem: DataRowPathItem<TId, TItem> = this.getPathItem(parent, tree);
            path.push(pathItem);
        });
        return path;
    }

    public static getPathItem<TItem, TId>(item: TItem, tree: ITree<TItem, TId>): DataRowPathItem<TId, TItem> {
        const parentId = tree.getParams().getParentId?.(item);
        const id = tree.getParams().getId(item);

        const { ids, count, status } = tree.getItems(parentId);
        const lastId = ids[ids.length - 1];

        const isLastChild = lastId !== undefined
            && lastId === id
            && status === FULLY_LOADED
            && count === ids.length;

        return {
            id: tree.getParams().getId(item),
            value: item,
            isLastChild,
        };
    }

    public static forEach<TItem, TId>(
        tree: ITree<TItem, TId>,
        action: (item: TItem, id: TId, parentId: TId, stop: () => void) => void,
        options?: {
            direction?: 'bottom-up' | 'top-down';
            parentId?: TId;
            includeParent?: boolean;
        },
    ) {
        let shouldStop = false;
        const stop = () => {
            shouldStop = true;
        };

        options = { direction: 'top-down', parentId: undefined, ...options };
        if (options.includeParent == null) {
            options.includeParent = options.parentId != null;
        }

        const iterateNodes = (ids: TId[]) => {
            if (shouldStop) return;
            ids.forEach((id) => {
                if (shouldStop) return;
                const item = tree.getById(id);
                const parentId = item !== NOT_FOUND_RECORD ? tree.getParams().getParentId?.(item) : undefined;
                walkChildrenRec(item === NOT_FOUND_RECORD ? undefined : item, id, parentId);
            });
        };

        const walkChildrenRec = (item: TItem, id: TId, parentId: TId) => {
            if (options.direction === 'top-down') {
                action(item, id, parentId, stop);
            }
            const { ids: childrenIds } = tree.getItems(id);
            childrenIds && iterateNodes(childrenIds);
            if (options.direction === 'bottom-up') {
                action(item, id, parentId, stop);
            }
        };

        if (options.includeParent) {
            iterateNodes([options.parentId]);
        } else {
            iterateNodes(tree.getItems(options.parentId).ids);
        }
    }

    public static forEachChildren<TItem, TId>(
        tree: ITree<TItem, TId>,
        action: (id: TId) => void,
        isSelectable: (id: TId, item: TItem | typeof NOT_FOUND_RECORD) => boolean,
        parentId?: TId,
        includeParent: boolean = true,
    ) {
        this.forEach(
            tree,
            (item, id) => {
                if (item && isSelectable(id, item)) {
                    action(id);
                }
            },
            { parentId: parentId, includeParent },
        );
    }

    public static async load<TItem, TId, TFilter = any>({
        tree,
        dataSourceState,
        api,
        getChildCount,
        isFolded,
        filter,
        withNestedChildren = true,
    }: LoadOptions<TItem, TId, TFilter>): Promise<TreeLoadResult<TItem, TId>> {
        return await FetchingHelper.load<TItem, TId, TFilter>({
            tree,
            options: {
                api,
                getChildCount,
                isFolded,
                filter: { ...dataSourceState?.filter, ...filter },
            },
            dataSourceState,
            withNestedChildren,
        });
    }

    public static async loadMissingOnCheck<TItem, TId, TFilter = any>({
        tree,
        dataSourceState,
        api,
        getChildCount,
        isFolded,
        filter,
        cascadeSelection,
        isRoot,
        isChecked,
        checkedId,
    }: LoadMissingOnCheckOptions<TItem, TId, TFilter>): Promise<ITree<TItem, TId> | TreeLoadResult<TItem, TId>> {
        const isImplicitMode = cascadeSelection === CascadeSelectionTypes.IMPLICIT;

        if (!cascadeSelection && !isRoot) {
            return tree;
        }

        const loadNestedLayersChildren = !isImplicitMode;
        const parents = this.getParents(checkedId, tree);
        return await FetchingHelper.load<TItem, TId, TFilter>({
            tree,
            options: {
                api,
                getChildCount,
                isFolded,
                filter: { ...dataSourceState?.filter, ...filter },
                loadAllChildren: (itemId) => {
                    if (!cascadeSelection) {
                        return isChecked && isRoot;
                    }

                    if (isImplicitMode) {
                        return itemId === undefined || parents.some((parent) => isEqual(parent, itemId));
                    }

                    // `isEqual` is used, because complex ids can be recreated after fetching of parents.
                    // So, they should be compared not by reference, but by value.
                    return isRoot || isEqual(itemId, checkedId) || (dataSourceState.search && parents.some((parent) => isEqual(parent, itemId)));
                },
                isLoadStrict: true,
            },
            dataSourceState: { ...dataSourceState, search: null },
            withNestedChildren: loadNestedLayersChildren,
        });
    }
}
