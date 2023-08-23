import React, { useMemo, useState } from 'react';
import { DataTable, Panel, FlexRow, Text, Badge, EpamAdditionalColor } from '@epam/promo';
import {
    DataColumnProps, getSeparatedValue, LazyDataSource, TableFiltersConfig, useLazyDataSource,
    useTableState, useUuiContext,
} from '@epam/uui-core';
import { Person } from '@epam/uui-docs';
import dayjs from 'dayjs';

const personColumns: DataColumnProps<Person, number>[] = [
    {
        key: 'name',
        caption: 'Name',
        render: (p) => <Text>{p.name}</Text>,
        width: 180,
        isSortable: true,
        isAlwaysVisible: true,
    }, {
        key: 'profileStatus',
        caption: 'Profile status',
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

export default function FiltersPanelExample() {
    const svc = useUuiContext();
    const [value, onValueChange] = useState({});

    const filtersConfig = useMemo<TableFiltersConfig<Person>[]>(
        () => [
            {
                field: 'profileStatusId',
                columnKey: 'profileStatus',
                title: 'Profile status',
                type: 'multiPicker',
                dataSource: new LazyDataSource({ api: svc.api.demo.statuses }),
            }, {
                field: 'jobTitleId',
                columnKey: 'jobTitle',
                title: 'Title',
                type: 'multiPicker',
                dataSource: new LazyDataSource({ api: svc.api.demo.jobTitles }),
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
        [svc.api.demo.jobTitles, svc.api.demo.statuses],
    );

    const tableStateApi = useTableState({
        value,
        onValueChange,
        columns: personColumns,
        filters: filtersConfig,
    });
    const { tableState, setTableState } = tableStateApi;

    const dataSource = useLazyDataSource<Person, number, Person>(
        {
            api: svc.api.demo.persons,
        },
        [],
    );

    const view = dataSource.useView(tableState, setTableState);

    return (
        <Panel style={ { height: '400px' } }>
            <DataTable
                getRows={ view.getVisibleRows }
                columns={ personColumns }
                value={ tableState }
                onValueChange={ setTableState }
                filters={ filtersConfig }
                { ...view.getListProps() }
            />
        </Panel>
    );
}
