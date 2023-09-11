import { useEffect, useMemo } from 'react';
import { IDataSourceView, DataSourceState } from '../../types/dataSources';
import { BaseDataSource } from './BaseDataSource';
import { ArrayListView, ArrayListViewProps } from './views';
import { ITree, NOT_FOUND_RECORD, Tree } from './views/tree';

export interface ArrayDataSourceProps<TItem, TId, TFilter> extends ArrayListViewProps<TItem, TId, TFilter> {}

export class ArrayDataSource<TItem = any, TId = any, TFilter = any> extends BaseDataSource<TItem, TId, TFilter> {
    props: ArrayDataSourceProps<TItem, TId, TFilter>;
    tree: ITree<TItem, TId>;
    constructor(props: ArrayDataSourceProps<TItem, TId, TFilter>) {
        super(props);
        this.setProps(props);
    }

    public setProps(props: ArrayDataSourceProps<TItem, TId, TFilter>) {
        this.props = props;
        if (this.props.items instanceof Tree) {
            this.tree = this.props.items;
        } else {
            this.tree = Tree.create(
                {
                    ...this.props,
                    // These defaults are added for compatibility reasons.
                    // We'll require getId and getParentId callbacks in other APIs, including the views.
                    getId: this.getId,
                    getParentId: props?.getParentId ?? this.defaultGetParentId,
                },
                this.props.items,
            );
        }
    }

    public getById = (id: TId): TItem | void => {
        const item = this.tree.getById(id);
        if (item === NOT_FOUND_RECORD) {
            return;
        }
        return item;
    };

    protected defaultGetParentId = (item: TItem) => {
        return (item as any)['parentId'];
    };

    setItem(item: TItem): void {
        const id = this.getId(item);
        const prevItem = this.getById(id);
        if (!prevItem) {
            const items = Array.isArray(this.props.items)
                ? [...this.props.items, item]
                : this.props.items.patch([item]);
            this.setProps({ ...this.props, items });
        }
    }

    getView(
        value: DataSourceState<TFilter, TId>,
        onValueChange: (val: DataSourceState<TFilter, TId>) => void,
        options?: Partial<ArrayListViewProps<TItem, TId, TFilter>>,
    ): IDataSourceView<TItem, TId, TFilter> {
        const view = this.views.get(onValueChange) as ArrayListView<TItem, TId, TFilter>;
        const viewProps: ArrayListViewProps<TItem, TId, TFilter> = {
            ...this.props,
            items: this.tree,
            ...options,
            // These defaults are added for compatibility reasons.
            // We'll require getId and getParentId callbacks in other APIs, including the views.
            getId: this.getId,
            getParentId: options?.getParentId ?? this.props.getParentId ?? this.defaultGetParentId,
        };

        if (view) {
            view.update({ value, onValueChange }, viewProps);
            return view;
        } else {
            const newView = new ArrayListView({ value, onValueChange }, viewProps);
            this.views.set(onValueChange, newView);
            return newView;
        }
    }

    useView(
        value: DataSourceState<TFilter, TId>,
        onValueChange: (val: DataSourceState<TFilter, TId>) => void,
        options?: Partial<ArrayListViewProps<TItem, TId, TFilter>>,
        deps: any[] = [],
    ): IDataSourceView<TItem, TId, TFilter> {
        const viewProps: ArrayListViewProps<TItem, TId, TFilter> = {
            ...this.props,
            items: this.tree,
            ...options,
            // These defaults are added for compatibility reasons.
            // We'll require getId and getParentId callbacks in other APIs, including the views.
            getId: this.getId,
            getParentId: options?.getParentId ?? this.props.getParentId ?? this.defaultGetParentId,
        };
         
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const view = useMemo(
            () => new ArrayListView({ value, onValueChange }, viewProps),
            deps,
        );
         
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const unsubscribe = this.subscribe(view);
            return () => {
                unsubscribe();
            };
        }, [view]);

        view.update({ value, onValueChange }, viewProps);
        return view;
    }
}
