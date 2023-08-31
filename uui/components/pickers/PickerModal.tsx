import React from 'react';
import { IconContainer, PickerModalArrayProps, PickerModalOptions, PickerModalScalarProps, handleDataSourceKeyboard, usePickerModal } from '@epam/uui-components';
import { DataRowProps, IHasCaption, PickerBaseOptions } from '@epam/uui-core';
import { DataPickerRow } from './DataPickerRow';
import { Text, TextPlaceholder } from '../typography';
import { i18n } from '../../i18n';
import { FlexRow, FlexCell, FlexSpacer } from '../layout';
import {
    ModalBlocker, ModalWindow, ModalHeader, ModalFooter,
} from '../overlays';
import { LinkButton, Button } from '../buttons';
import { ReactComponent as SearchIcon } from '../../icons/search-with-background.svg';

import css from './PickerModal.module.scss';
import { SearchInput, Switch } from '../inputs';
import { DataPickerBody } from './DataPickerBody';

export type PickerModalProps<TItem, TId> = PickerBaseOptions<TItem, TId> &
IHasCaption &
(PickerModalScalarProps<TId, TItem> | PickerModalArrayProps<TId, TItem>) &
PickerModalOptions<TItem, TId>;

export function PickerModal<TItem, TId>(props: PickerModalProps<TItem, TId>) {
    const {
        view,
        selection,
        dataSourceStateLens,
        showSelectedLens,
        dataSourceState,
        getDataSourceState,
        getName,
        clearSelection,
        getRows,
        getListProps,
        getFooterProps,
        isSingleSelect,
        handleDataSourceValueChange,
    } = usePickerModal<TItem, TId>(props);
    
    const renderRow = (rowProps: DataRowProps<TItem, TId>) => {
        return props.renderRow ? (
            props.renderRow(rowProps, dataSourceState)
        ) : (
            <DataPickerRow
                { ...rowProps }
                key={ rowProps.rowKey }
                borderBottom="none"
                padding="24"
                size="36"
                renderItem={ (i: TItem & { name?: string }) => <Text size="36">{rowProps.isLoading ? <TextPlaceholder wordsCount={ 2 } /> : getName(i)}</Text> }
            />
        );
    };

    const renderFooter = () => {
        const hasSelection = view.getSelectedRowsCount() > 0;
        return (
            <>
                {view.selectAll && (
                    <LinkButton
                        caption={ hasSelection ? i18n.pickerModal.clearAllButton : i18n.pickerModal.selectAllButton }
                        onClick={ hasSelection ? () => clearSelection() : () => view.selectAll.onValueChange(true) }
                    />
                )}
                <FlexSpacer />
                <Button mode="outline" color="secondary" caption={ i18n.pickerModal.cancelButton } onClick={ () => props.abort() } />
                <Button color="accent" caption={ i18n.pickerModal.selectButton } onClick={ () => props.success(selection as any) } />
            </>
        );
    };
    
    const renderNotFound = () => {
        return props.renderNotFound ? (
            props.renderNotFound({ search: dataSourceState.search, onClose: () => props.success(null) })
        ) : (
            <div className={ css.noFoundModalContainer }>
                <IconContainer cx={ css.noFoundModalContainerIcon } icon={ SearchIcon } />
                <Text cx={ css.noFoundModalContainerText } font="semibold" fontSize="16" lineHeight="24" color="primary" size="36">
                    {i18n.dataPickerBody.noRecordsMessage}
                </Text>
                <Text cx={ css.noFoundModalContainerText } fontSize="12" lineHeight="18" font="regular" color="primary" size="36">
                    {i18n.dataPickerBody.noRecordsSubTitle}
                </Text>
            </div>
        );
    };

    const dataRows = getRows();
    const rows = dataRows.map((row) => renderRow(row));

    return (
        <ModalBlocker { ...props }>
            <ModalWindow width={ 600 } height={ 700 }>
                <ModalHeader title={ props.caption || i18n.pickerModal.headerTitle } onClose={ () => props.abort() } />
                <FlexCell cx={ css.subHeaderWrapper }>
                    <FlexRow vPadding="24">
                        <SearchInput
                            { ...dataSourceStateLens.prop('search').toProps() }
                            onKeyDown={ (e) =>
                                handleDataSourceKeyboard(
                                    {
                                        value: getDataSourceState(),
                                        onValueChange: handleDataSourceValueChange,
                                        listView: view,
                                        rows: dataRows,
                                        editMode: 'modal',
                                    },
                                    e,
                                ) }
                            autoFocus={ true }
                            placeholder={ i18n.pickerModal.searchPlaceholder }
                        />
                    </FlexRow>
                    {!isSingleSelect() && (
                        <Switch
                            cx={ css.switch }
                            size="18"
                            { ...showSelectedLens.toProps() }
                            isDisabled={ view.getSelectedRowsCount() < 1 }
                            label="Show only selected"
                        />
                    )}
                    {props.renderFilter && <FlexCell grow={ 2 }>{props.renderFilter(dataSourceStateLens.prop('filter').toProps())}</FlexCell>}
                </FlexCell>
                <DataPickerBody
                    { ...getListProps() }
                    value={ getDataSourceState() }
                    onValueChange={ handleDataSourceValueChange }
                    search={ dataSourceStateLens.prop('search').toProps() }
                    showSearch={ false }
                    rows={ rows }
                    renderNotFound={ renderNotFound }
                    editMode="modal"
                />
                <ModalFooter padding="24" vPadding="24">
                    {props.renderFooter ? props.renderFooter(getFooterProps()) : renderFooter()}
                </ModalFooter>
            </ModalWindow>
        </ModalBlocker>
    );
}
