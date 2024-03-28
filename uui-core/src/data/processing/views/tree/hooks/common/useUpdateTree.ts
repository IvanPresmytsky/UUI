import { useMemo, useRef } from 'react';
import { TreeState } from '../../newTree';
import { useSimplePrevious } from '../../../../../../hooks';
import { useDepsChanged } from './useDepsChanged';

export interface UseUpdateTreeProps<TItem, TId> {
    tree: TreeState<TItem, TId>;
    shouldUpdate: () => boolean;
    update: (tree: TreeState<TItem, TId>) => TreeState<TItem, TId>;
}

export function useUpdateTree<TItem, TId>(
    {
        tree,
        shouldUpdate,
        update,
    }: UseUpdateTreeProps<TItem, TId>,
    deps: any[],
) {
    const treeRef = useRef<TreeState<TItem, TId>>(null);
    const prevTree = useSimplePrevious(tree);
    const depsChanged = useDepsChanged(deps);

    const updatedTree = useMemo(() => {
        if (treeRef.current === null || prevTree !== tree || shouldUpdate() || depsChanged) {
            treeRef.current = update(tree);
        }
        return treeRef.current;
    }, [tree, depsChanged, ...deps]);

    return updatedTree;
}
