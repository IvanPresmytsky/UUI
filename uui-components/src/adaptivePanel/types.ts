import { IHasCX, IHasRawProps } from '@epam/uui-core';

export type AdaptiveItemProps<T = unknown> = T & {
    /** Render callback of the item. It renders items inside the panel and measures their width.
     * Pay attention that we can't measure margins. If you need to have margins, please make a wrapper and add margins inside
     * */
    render: (item: AdaptiveItemProps<T>, hiddenItems?: AdaptiveItemProps<T>[], displayedItems?: AdaptiveItemProps<T>[]) => any;
    /** Item collapsed priority. An item with lower priority will be hidden first, and so on. If several items have the same priority, all of them will be hidden; */
    priority: number;
    /** If true, this item will be shown when some other items was hidden; for example, you can use it to render dropdowns with hidden items.
     * You can provide more than one collapsedContainer item, but will be shown only those which has minimal priority, but this priority can't be less than the last hidden item’s priority. */
    collapsedContainer?: boolean;
    /** Unique ID of item */
    id: string;
};

export interface AdaptivePanelProps extends IHasCX, IHasRawProps<React.HTMLAttributes<HTMLDivElement>> {
    /** Array of items to be rendered in AdaptivePanel */
    items: AdaptiveItemProps[];
}
