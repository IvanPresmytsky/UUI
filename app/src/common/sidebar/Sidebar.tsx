import * as React from 'react';
import cx from 'classnames';
import css from './Sidebar.module.scss';
import { ScrollBars, SearchInput } from '@epam/promo';
import { Tree, TreeListItem } from '@epam/uui-components';
import { SidebarButton } from './SidebarButton';
import { DataRowProps, DataSourceState, Link, useUuiContext } from '@epam/uui-core';
import { analyticsEvents } from '../../analyticsEvents';

export interface SidebarProps<TItem extends TreeListItem = TreeListItem> {
    value: string;
    onValueChange: (newVal: DataRowProps<TItem, string>) => void;
    getItemLink?: (item: DataRowProps<TItem, string>) => Link;
    items: TItem[];
    renderSearch?: () => React.ReactNode;
    getSearchFields?(item: TItem): string[];
}

export function Sidebar<TItem extends TreeListItem>(props: SidebarProps<TItem>) {
    const { uuiAnalytics } = useUuiContext();
    const [value, setValue] = React.useState<DataSourceState>({ search: '', folded: {} });

    React.useEffect(() => {
        if (props.items) {
            const { parentId } = props.items.find((i) => i.id === props.value);
            if (parentId != null) {
                setValue((stateValue) => ({ ...stateValue, folded: { ...stateValue.folded, [parentId]: false } }));
            }
        }
    }, [props.value, props.items]);

    const handleClick = React.useCallback((row: DataRowProps<TItem, string>) => {
        row.isFoldable && row.onFold(row);
        const type = row.isFoldable ? 'folder' : 'document';
        uuiAnalytics.sendEvent(analyticsEvents.document.clickDocument(type, row.value.name, row.parentId));
    }, []);

    return (
        <aside className={ cx(css.root, 'uui-theme-promo') }>
            <SearchInput
                cx={ css.search }
                value={ value.search }
                onValueChange={ (search) => setValue((v) => ({ ...v, search })) }
                autoFocus
                placeholder="Search"
                getValueChangeAnalyticsEvent={ (val) => analyticsEvents.document.search(val) }
            />
            <div className={ css.tree } role="tablist">
                <ScrollBars>
                    <Tree<TItem>
                        items={ props.items }
                        value={ value }
                        onValueChange={ setValue }
                        getSearchFields={ props.getSearchFields }
                        renderRow={ (row) => (
                            <SidebarButton
                                key={ row.key }
                                link={ props.getItemLink(row) }
                                indent={ (row.indent - 1) * 12 }
                                isOpen={ !row.isFolded }
                                isDropdown={ row.isFoldable }
                                isActive={ row.id === props.value }
                                caption={ row.value.name }
                                onClick={ () => handleClick(row) }
                            />
                        ) }
                    />
                </ScrollBars>
            </div>
        </aside>
    );
}
