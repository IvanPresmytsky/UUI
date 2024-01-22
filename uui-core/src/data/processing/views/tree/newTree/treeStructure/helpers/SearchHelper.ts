import { TreeStructure } from '../TreeStructure';
import { getSearchFilter } from '../../../../../../querying';
import sortBy from 'lodash.sortby';
import { ApplySearchToTreeSnapshotOptions, SearchOptions } from './types';

export class SearchHelper {
    public static search<TItem, TId, TFilter>(options: SearchOptions<TItem, TId, TFilter>): TreeStructure<TItem, TId> {
        const search = this.buildSearchFilter(options);
        return this.applySearchToTree({ treeStructure: options.treeStructure, search, sortSearchByRelevance: options.sortSearchByRelevance });
    }

    private static buildSearchFilter<TItem, TId, TFilter>({ search, getSearchFields }: SearchOptions<TItem, TId, TFilter>) {
        if (!search) return null;

        if (!getSearchFields) {
            console.warn('[Tree] Search value is set, but options.getSearchField is not specified. Nothing to search on.');
            return null;
        }
        const searchFilter = getSearchFilter(search);
        return (i: TItem) => searchFilter(getSearchFields(i));
    }

    private static applySearchToTree<TItem, TId>({ treeStructure, search, sortSearchByRelevance }: ApplySearchToTreeSnapshotOptions<TItem, TId>) {
        if (!search) return treeStructure;

        const matchedItems: TItem[] = [];
        const ranks: Map<TId, number> = new Map();
        const applySearchRec = (items: TItem[]) => {
            let isSomeMatching: number | boolean = false;
            items.forEach((item) => {
                const isItemMatching = search(item);
                const isSomeChildMatching = applySearchRec(treeStructure.getChildren(item));
                const isMatching = isItemMatching || isSomeChildMatching;
                if (isMatching !== false) {
                    matchedItems.push(item);
                    if (typeof isMatching !== 'boolean') {
                        const id = treeStructure.params.getId(item);
                        const rank = ranks.has(id) ? Math.max(ranks.get(id), isMatching) : isMatching;
                        ranks.set(treeStructure.params.getId(item), rank);
                    }
                }

                if (!isSomeMatching) {
                    isSomeMatching = isMatching;
                } else if (typeof isMatching === 'number') {
                    isSomeMatching = typeof isSomeMatching === 'number'
                        ? Math.max(isMatching, isSomeMatching)
                        : isMatching;
                }
            });

            return isSomeMatching;
        };

        applySearchRec(treeStructure.getRootItems());

        const searchItems = sortSearchByRelevance ? this.sortByRanks(matchedItems, ranks, treeStructure.params.getId) : matchedItems;

        return TreeStructure.createFromItems({
            itemsAccessor: treeStructure.itemsAccessor,
            params: treeStructure.params,
            items: searchItems,
        });
    }

    private static sortByRanks<TItem, TId>(items: TItem[], ranks: Map<TId, number>, getId: (item: TItem) => TId) {
        if (ranks.size === 0) {
            return items;
        }
        const itemsToSort = [...items];

        return sortBy(itemsToSort, (item) => {
            const id = getId(item);
            if (!ranks.has(id)) {
                return 0;
            }
            return ranks.get(id) * -1;
        });
    }
}
