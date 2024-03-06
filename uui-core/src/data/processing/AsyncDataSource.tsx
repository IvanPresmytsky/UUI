import { useEffect, useMemo, useState } from 'react';
import { ArrayDataSource, ArrayDataSourceProps } from './ArrayDataSource';
import { DataSourceState, IDataSourceView } from '../../types';
import { useCascadeSelectionService, useDataRows, useTree } from './views';
import { ItemsStorage } from './views/tree/ItemsStorage';
import { AsyncListViewProps } from './views/types';
import { newMap } from './views/tree/newTree';

export interface AsyncDataSourceProps<TItem, TId, TFilter> extends AsyncListViewProps<TItem, TId, TFilter> {}

export class AsyncDataSource<TItem = any, TId = any, TFilter = any> extends ArrayDataSource<TItem, TId> {
    api: () => Promise<TItem[]> = null;
    constructor(props: AsyncDataSourceProps<TItem, TId, TFilter>) {
        super({
            ...props,
            items: [],
        });
        this.api = props.api;
    }

    public setProps(newProps: ArrayDataSourceProps<TItem, TId, TFilter>) {
        const props = { ...newProps };
        // We'll receive items=null on updates (because we inherit ArrayDataSource, but nobody would actually pass items there - they are expected to come from API)
        // so this tweak is required to not reset items on any update
        props.items = newProps.items || this.props.items;

        super.setProps(props);
        if (newProps.items && newProps.items !== this.props.items) {
            this.itemsStorage.setItems(newProps.items, { reset: true });
        }
    }

    reload() {
        this.setProps({ ...this.props, items: [] });
        const params = { getId: this.getId, complexIds: this.props.complexIds };
        this.itemsStorage = new ItemsStorage({ items: [], params });
        this.itemsStatusMap = newMap(params);
        super.reload();
    }

    useView(
        value: DataSourceState<TFilter, TId>,
        onValueChange: React.Dispatch<React.SetStateAction<DataSourceState<any, TId>>>,
        options?: Partial<AsyncListViewProps<TItem, TId, TFilter>>,
        deps: any[] = [],
    ): IDataSourceView<TItem, TId, TFilter> {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [itemsMap, setItemsMap] = useState(this.itemsStorage.getItemsMap());
        
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { tree, reload, selectionTree, totalCount, ...restProps } = useTree({
            type: 'async',
            ...this.props,
            api: this.api,
            ...options,
            itemsMap,
            setItems: this.itemsStorage.setItems,
            itemsStatusMap: this.itemsStatusMap,
            getId: this.getId,
            getParentId: options?.getParentId ?? this.props.getParentId ?? this.defaultGetParentId,
            dataSourceState: value,
            setDataSourceState: onValueChange,
        }, [...deps, this]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const unsubscribe = this.itemsStorage.subscribe((newItemsMap) => {
                if (itemsMap !== newItemsMap) {
                    setItemsMap(newItemsMap);
                }
            });
            
            return () => {
                unsubscribe();
            };
        }, [this.itemsStorage]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            this.trees.set(tree, reload);
            return () => { 
                this.trees.delete(tree);
            };
        }, [tree, reload]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const cascadeSelectionService = useCascadeSelectionService({
            tree: selectionTree,
            cascadeSelection: restProps.cascadeSelection,
            getRowOptions: restProps.getRowOptions,
            rowOptions: restProps.rowOptions,
            getItemStatus: restProps.getItemStatus,
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { rows, listProps, selectAll, getById, getSelectedRowsCount, clearAllChecked } = useDataRows({
            tree,
            ...restProps,
            ...cascadeSelectionService,
        });
    
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useMemo(() => ({
            getRows: () => rows,
            getListProps: () => ({ ...listProps, totalCount }),
            selectAll,
            getConfig: () => restProps,
            reload,
            getById,
            getSelectedRowsCount,
            clearAllChecked,
        }), [
            rows,
            listProps,
            selectAll,
            restProps,
            totalCount,
            reload,
            getById,
            getSelectedRowsCount,
            clearAllChecked,
        ]);
    }
}
