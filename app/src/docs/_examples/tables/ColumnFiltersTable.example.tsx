import React, { useMemo, useState } from 'react';
import { DataColumnProps, useLazyDataSource, useUuiContext, TableFiltersConfig, LazyDataSource, useTableState, DataTableState, getSeparatedValue } from '@epam/uui-core';
import { Text, DataTable, Panel, FlexRow, Badge, EpamAdditionalColor } from '@epam/promo';
import { Person } from '@epam/uui-docs';
import css from './TablesExamples.module.scss';
import dayjs from 'dayjs';

const personColumns: DataColumnProps<Person, number>[] = [
    {
        key: 'name',
        caption: 'Name',
        render: (p) => <Text>{p.name}</Text>,
        width: 180,
        isSortable: true,
    }, {
        key: 'profileStatus',
        caption: 'Profile status',
        info: 'This person profile status information',
        render: (p) =>
            p.profileStatus && (
                <FlexRow>
                    <Badge fill="transparent" color={ p.profileStatus.toLowerCase() as EpamAdditionalColor } caption={ p.profileStatus } />
                </FlexRow>
            ),
        width: 140,
        isSortable: true,
        isFilterActive: (f) => !!f.profileStatusId,
    }, {
        key: 'salary',
        caption: 'Salary',
        render: (p) => (
            <Text>
                {getSeparatedValue(+p.salary, {
                    style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 2,
                }, 'en-US')}
            </Text>
        ),
        width: 150,
        textAlign: 'right',
        isSortable: true,
    }, {
        key: 'jobTitle',
        caption: 'Title',
        render: (r) => <Text>{r.jobTitle}</Text>,
        width: 200,
        isFilterActive: (f) => !!f.jobTitleId,
    }, {
        key: 'birthDate',
        caption: 'Birth date',
        render: (p) => p?.birthDate && <Text>{dayjs(p.birthDate).format('MMM D, YYYY')}</Text>,
        width: 120,
        isSortable: true,
    }, {
        key: 'hireDate',
        caption: 'Hire date',
        render: (p) => p?.hireDate && <Text>{dayjs(p.hireDate).format('MMM D, YYYY')}</Text>,
        width: 120,
        isSortable: true,
    },
];

export default function ColumnsConfigurationDataTableExample() {
    const { api } = useUuiContext();

    const filtersConfig = useMemo<TableFiltersConfig<Person>[]>(
        () => [
            {
                field: 'profileStatusId',
                columnKey: 'profileStatus',
                title: 'Profile status',
                type: 'multiPicker',
                dataSource: new LazyDataSource({ api: api.demo.statuses }),
                showSearch: false,
            }, {
                field: 'jobTitleId',
                columnKey: 'jobTitle',
                title: 'Title',
                type: 'multiPicker',
                dataSource: new LazyDataSource({ api: api.demo.jobTitles }),
            }, {
                field: 'salary',
                columnKey: 'salary',
                title: 'Salary',
                type: 'numeric',
            }, {
                field: 'birthDate',
                columnKey: 'birthDate',
                title: 'Birth date',
                type: 'datePicker',
            }, {
                field: 'hireDate',
                columnKey: 'hireDate',
                title: 'Hire date',
                type: 'rangeDatePicker',
            },
        ],
        [api.demo.jobTitles, api.demo.statuses],
    );
    const [value, onValueChange] = useState<DataTableState>({});

    const { tableState, setTableState } = useTableState({
        columns: personColumns,
        filters: filtersConfig,
        value: value,
        onValueChange: onValueChange,
    });

    const dataSource = useLazyDataSource<Person, number, Person>(
        {
            api: api.demo.persons,
        },
        [],
    );

    const view = dataSource.useView(tableState, setTableState);

    return (
        <Panel shadow cx={ css.container }>
            <DataTable
                getRows={ view.getVisibleRows }
                columns={ personColumns }
                value={ value }
                onValueChange={ onValueChange }
                headerTextCase="upper"
                allowColumnsReordering={ true }
                allowColumnsResizing={ true }
                filters={ filtersConfig }
                { ...view.getListProps() }
            />
        </Panel>
    );
}
