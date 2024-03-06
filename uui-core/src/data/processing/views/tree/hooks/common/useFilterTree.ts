import { useSimplePrevious } from '../../../../../../hooks';
import { DataSourceState } from '../../../../../../types';
import { TreeState } from '../../newTree';
import { useUpdateTree } from './useUpdateTree';

export type UseFilterTreeProps<TItem, TId, TFilter = any> = {
    getFilter?: (filter: TFilter) => (item: TItem) => boolean;
    tree: TreeState<TItem, TId>;
    dataSourceState: DataSourceState<TFilter, TId>;
    isLoading?: boolean;
};

export function useFilterTree<TItem, TId, TFilter = any>(
    { tree, dataSourceState: { filter }, getFilter, isLoading }: UseFilterTreeProps<TItem, TId, TFilter>,
    deps: any[],
) {
    const prevFilter = useSimplePrevious(filter);
    const filteredTree = useUpdateTree({
        tree,
        shouldUpdate: () => filter !== prevFilter,
        update: (currentTree) => currentTree.filter({ filter, getFilter }),
    }, [filter, ...deps]);

    if (isLoading || filteredTree === null) {
        return tree;
    }

    return filteredTree;
}
