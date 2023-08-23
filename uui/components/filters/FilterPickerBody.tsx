import * as React from 'react';
import {
    DataRowProps, DataSourceListProps, DropdownBodyProps, isMobile, uuiMarkers,
} from '@epam/uui-core';
import { PickerBodyBaseProps, PickerInputBase } from '@epam/uui-components';
import { Panel } from '../layout';
import {
    DataPickerRow, PickerItem, DataPickerBody, DataPickerFooter,
} from '../pickers';

const pickerHeight = 300;
const pickerWidth = 360;

interface FilterPickerBodyProps extends DropdownBodyProps {
    showSearch?: boolean;
}

export class FilterPickerBody<TItem, TId> extends PickerInputBase<TItem, TId, FilterPickerBodyProps> {
    shouldShowBody(): boolean {
        return this.props.isOpen;
    }

    toggleModalOpening() {}
    renderItem = (item: TItem, rowProps: DataRowProps<TItem, TId>) => {
        return <PickerItem title={ this.getName(item) } size="36" { ...rowProps } />;
    };

    onSelect = (row: DataRowProps<TItem, TId>) => {
        this.props.onClose();
        this.handleDataSourceValueChange({ ...this.state.dataSourceState, search: '', selectedId: row.id });
    };

    renderRow = (rowProps: DataRowProps<TItem, TId>) => {
        if (rowProps.isSelectable && this.isSingleSelect() && this.props.editMode !== 'modal') {
            rowProps.onSelect = this.onSelect;
        }

        return this.props.renderRow ? (
            this.props.renderRow(rowProps, this.state.dataSourceState)
        ) : (
            <DataPickerRow { ...rowProps } key={ rowProps.rowKey } borderBottom="none" size="36" padding="12" renderItem={ this.renderItem } />
        );
    };

    renderFooter = () => {
        return <DataPickerFooter { ...this.getFooterProps() } size="36" />;
    };

    renderTarget() {
        return <div></div>;
    }

    renderBody(props: DataSourceListProps & Omit<PickerBodyBaseProps, 'rows'>, rows: DataRowProps<TItem, TId>[]) {
        const renderedDataRows = rows.map((props) => this.renderRow(props));
        const maxHeight = isMobile() ? document.documentElement.clientHeight : this.props.dropdownHeight || pickerHeight;
        const minBodyWidth = isMobile() ? document.documentElement.clientWidth : this.props.minBodyWidth || pickerWidth;

        return (
            <Panel style={ { width: minBodyWidth } } rawProps={ { tabIndex: -1 } } cx={ [uuiMarkers.lockFocus] }>
                <DataPickerBody
                    { ...props }
                    selectionMode={ this.props.selectionMode }
                    rows={ renderedDataRows }
                    maxHeight={ maxHeight }
                    searchSize="36"
                    editMode="dropdown"
                />
                {this.renderFooter()}
            </Panel>
        );
    }

    render(): JSX.Element {
        const rows = this.getRows();

        return this.renderBody({
            ...this.getPickerBodyProps(rows),
            ...this.getListProps(),
            showSearch: this.props.showSearch ?? true,
        }, rows);
    }
}
