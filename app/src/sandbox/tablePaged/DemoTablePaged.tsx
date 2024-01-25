import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { Person } from '@epam/uui-docs';
import { FlexCell } from '@epam/uui-components';
import { DataRowOptions, LazyDataSourceApi, useTableState, useTree, useDataRows, useCascadeSelectionService } from '@epam/uui-core';
import { DataTable, FlexRow, Paginator, FlexSpacer, Button } from '@epam/promo';
import { svc } from '../../services';
import { getFilters } from './filters';
import { personColumns } from './columns';
import css from './DemoTablePaged.module.scss';
import { InfoSidebarPanel } from './InfoSidebarPanel';

export function DemoTablePaged() {
    const filters = useMemo(getFilters, []);
    const [isInfoPanelOpened, setIsInfoPanelOpened] = useState(false);
    const closeInfoPanel = useCallback(() => setIsInfoPanelOpened(false), []);

    const { tableState, setTableState } = useTableState<Person>({
        columns: personColumns,
    });

    useEffect(() => {
        setTableState({ ...tableState, page: 1, pageSize: 100 });
    }, []);

    const api: LazyDataSourceApi<Person, number, Person> = useCallback(async (request) => {
        const result = await svc.api.demo.personsPaged({
            filter: request.filter,
            page: request.page,
            pageSize: request.pageSize,
        });

        result.count = result.items.length;
        result.totalCount = result.items.length;
        result.from = 0;
        return result;
    }, []);

    const applyFilter = useCallback(() => {
        setTableState((state) => ({ ...state, scrollTo: { index: 0 } }));
    }, [setTableState]);

    // applying filter after parsing initial filter data from url
    useEffect(() => {
        applyFilter();
    }, [applyFilter]);

    const rowOptions: DataRowOptions<Person, number> = {
        checkbox: { isVisible: true },
        isSelectable: true,
        onClick(rowProps) {
            rowProps.onSelect(rowProps);
            setIsInfoPanelOpened(true);
        },
    };

    const { tree, reload, selectionTree, loadMissingRecordsOnCheck, ...restProps } = useTree(
        {
            type: 'lazy',
            dataSourceState: tableState,
            setDataSourceState: setTableState,
            api,
            rowOptions,
            getId: ({ id }) => id,
            isFoldedByDefault: () => true,
            backgroundReload: true,
        },
        [],
    );

    const cascadeSelectionService = useCascadeSelectionService({
        tree: selectionTree,
        cascadeSelection: restProps.cascadeSelection,
        getRowOptions: restProps.getRowOptions,
        rowOptions: restProps.rowOptions,
        loadMissingRecordsOnCheck,
    });

    const { rows, listProps, getById } = useDataRows({
        tree, ...restProps, ...cascadeSelectionService,
    });

    const panelInfo = tableState.selectedId && (getById(tableState.selectedId, 0).value);

    return (
        <div className={ cx(css.container, css.uuiThemePromo) }>
            <div className={ cx(css.wrapper) }>
                <DataTable
                    headerTextCase="upper"
                    rows={ rows }
                    columns={ personColumns }
                    filters={ filters }
                    showColumnsConfig
                    value={ tableState }
                    onValueChange={ setTableState }
                    allowColumnsResizing
                    { ...listProps }
                />
                <FlexRow size="36" padding="12" background="gray5">
                    <FlexCell width="auto">
                        <Button caption="Apply filter" onClick={ applyFilter } cx={ css.apply } />
                    </FlexCell>
                    <FlexSpacer />
                    <Paginator
                        value={ tableState.page }
                        onValueChange={ (page: number) => setTableState({ ...tableState, page, scrollTo: { index: 0 } }) }
                        totalPages={ Math.ceil(listProps.totalCount / tableState.pageSize) }
                        size="30"
                    />
                    <FlexSpacer />
                </FlexRow>
            </div>
            <InfoSidebarPanel
                data={ panelInfo }
                isVisible={ isInfoPanelOpened }
                onClose={ closeInfoPanel }
                onSave={ async () => { reload(); } }
            />
        </div>
    );
}
