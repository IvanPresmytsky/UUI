import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable, Panel, Button, FlexCell, FlexRow, FlexSpacer, IconButton, useForm, SearchInput, Tooltip } from '@epam/uui';
import { AcceptDropParams, DataTableState, DropParams, DropPosition, Metadata, useList } from '@epam/uui-core';
import { useDataTableFocusManager } from '@epam/uui-components';
import { ReactComponent as undoIcon } from '@epam/assets/icons/common/content-edit_undo-18.svg';
import { ReactComponent as redoIcon } from '@epam/assets/icons/common/content-edit_redo-18.svg';
import { ReactComponent as insertAfter } from '@epam/assets/icons/common/table-row_plus_after-24.svg';
import { ReactComponent as insertBefore } from '@epam/assets/icons/common/table-row_plus_before-24.svg';
import { ReactComponent as deleteLast } from '@epam/assets/icons/common/table-row_remove-24.svg';
import { ReactComponent as add } from '@epam/assets/icons/common/action-add-12.svg';

import { Task } from './types';
import { getDemoTasks } from './demoData';
import { getColumns } from './columns';
import { deleteTaskWithChildren, getInsertionOrder } from './helpers';

import css from './ProjectTableDemo.module.scss';

interface FormState {
    items: Record<number, Task>;
}

const metadata: Metadata<FormState> = {
    props: {
        items: {
            all: {
                props: {
                    name: { isRequired: true },
                },
            },
        },
    },
};

let lastId = -1;

let savedValue: FormState = { items: getDemoTasks() };

export function ProjectTableDemo() {
    const {
        lens, value, save, isChanged, revert, undo, canUndo, redo, canRedo, setValue,
    } = useForm<FormState>({
        value: savedValue,
        onSave: async (data) => {
            // At this point you usually call api.saveSomething(value) to actually send changed data to server
            savedValue = data;
        },
        getMetadata: () => metadata,
    });

    const [tableState, setTableState] = useState<DataTableState>({ sorting: [{ field: 'order' }], visibleCount: 1000 });
    const dataTableFocusManager = useDataTableFocusManager<Task['id']>({}, []);

    // Insert new/exiting top/bottom or above/below relative to other task
    const insertTask = useCallback((position: DropPosition, relativeTask: Task | null = null, existingTask: Task | null = null) => {
        let tempRelativeTask = relativeTask;
        const task: Task = existingTask ? { ...existingTask } : { id: lastId--, name: '' };
        if (position === 'inside') {
            task.parentId = relativeTask.id;
            tempRelativeTask = null; // just insert as the first child
        }

        if (tempRelativeTask) {
            task.parentId = tempRelativeTask.parentId;
        }

        setValue((currentValue) => {
            task.order = getInsertionOrder(
                Object.values(currentValue.items)
                    .filter((i) => i.parentId === task.parentId)
                    .map((i) => i.order),
                position === 'bottom' || position === 'inside' ? 'after' : 'before', // 'inside' drop should also insert at the top of the list, so it's ok to default to 'before'
                tempRelativeTask?.order,
            );

            return { ...currentValue, items: { ...currentValue.items, [task.id]: task } };
        });

        setTableState((currentTableState) => {
            return {
                ...currentTableState,
                folded: position === 'inside'
                    ? { ...currentTableState.folded, [`${task.parentId}`]: false }
                    : currentTableState.folded,
                selectedId: task.id,
            };
        });
        
        dataTableFocusManager?.focusRow(task.id);
    }, [setValue, setTableState, dataTableFocusManager]);

    const deleteTask = useCallback((task: Task) => {
        setValue((currentValue) => ({
            ...currentValue, items: deleteTaskWithChildren(currentValue.items, task),
        }));
    }, [setValue]);

    const handleCanAcceptDrop = useCallback((params: AcceptDropParams<Task & { isTask: boolean }, Task>) => {
        if (!params.srcData.isTask || params.srcData.id === params.dstData.id) {
            return null;
        } else {
            return { bottom: true, top: true, inside: true };
        }
    }, []);

    const handleDrop = useCallback(
        (params: DropParams<Task, Task>) => insertTask(params.position, params.dstData, params.srcData),
        [insertTask],
    );

    const searchHandler = useCallback(
        (val: string | undefined) => setTableState((currentTableState) => ({
            ...currentTableState,
            search: val,
        })),
        [],
    );

    const { rows, listProps } = useList(
        {
            type: 'array',
            listState: tableState,
            setListState: setTableState,
            items: Object.values(value.items),
            getSearchFields: (item) => [item.name],
            getId: (i) => i.id,
            getParentId: (i) => i.parentId,
            getRowOptions: (task) => ({
                ...lens.prop('items').prop(task.id).toProps(), // pass IEditable to each row to allow editing
                // checkbox: { isVisible: true },
                isSelectable: true,
                dnd: {
                    srcData: { ...task, isTask: true },
                    dstData: { ...task, isTask: true },
                    canAcceptDrop: handleCanAcceptDrop,
                    onDrop: handleDrop,
                },
            }),
        },
        [],
    );

    const columns = useMemo(
        () => getColumns({ insertTask, deleteTask }),
        [insertTask, deleteTask],
    );

    const selectedItem = useMemo(() => {
        if (tableState.selectedId !== undefined) {
            return value.items[tableState.selectedId];
        }
        return undefined;
    }, [tableState.selectedId, value.items]);

    const deleteSelectedItem = useCallback(() => {
        if (selectedItem === undefined) return;
        
        const prevRows = [...rows];
        deleteTask(selectedItem);
        const index = prevRows.findIndex((task) => task.id === selectedItem.id);
        const newSelectedIndex = index === prevRows.length - 1
            ? (prevRows.length - 2)
            : (index + 1);

        setTableState((state) => ({
            ...state,
            selectedId: newSelectedIndex >= 0 ? prevRows[newSelectedIndex].id : undefined,
        }));
    }, [deleteTask, rows, selectedItem, setTableState]);

    const keydownHandler = useCallback((event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Enter') {
            event.preventDefault();
            insertTask('top', selectedItem);
            return;
        }

        if ((event.metaKey || event.ctrlKey) && event.code === 'Enter') {
            event.preventDefault();
            insertTask('bottom', selectedItem);
            return;
        }

        if ((event.metaKey || event.ctrlKey) && event.code === 'Backspace') {
            event.preventDefault();
            deleteSelectedItem();
            return;
        }
    }, [insertTask, selectedItem, deleteSelectedItem]);

    useEffect(() => {
        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        };
    }, [keydownHandler]);

    const getKeybindingWithControl = (tooltip: string, keybindingWithoutControl: string) => {
        const controlKey = navigator.platform.indexOf('Mac') === 0 ? '⌘' : 'Ctrl';
        return (
            <>
                { tooltip } 
                {' '}
                <br />
                { `(${controlKey} + ${keybindingWithoutControl})` }
            </>
        );
    };

    return (
        <Panel cx={ css.container }>
            <FlexRow spacing="18" padding="24" vPadding="18" borderBottom={ true } background="surface-main">
                <FlexCell width="auto">
                    <Tooltip content={ getKeybindingWithControl('Add new task', 'Enter') } placement="bottom">
                        <Button size="30" icon={ add } caption="Add Task" onClick={ () => insertTask('bottom') } />
                    </Tooltip>
                </FlexCell>
                <FlexCell width="auto">
                    <Tooltip content={ getKeybindingWithControl('Add new task below', 'Enter') } placement="bottom">
                        <IconButton icon={ insertAfter } onClick={ () => insertTask('bottom', selectedItem) } />
                    </Tooltip>
                </FlexCell>
                <FlexCell width="auto">
                    <Tooltip content={ getKeybindingWithControl('Add new task above', 'Shift + Enter') } placement="bottom">
                        <IconButton icon={ insertBefore } onClick={ () => insertTask('top', selectedItem) } />
                    </Tooltip>
                </FlexCell>
                <FlexCell width="auto">
                    <Tooltip content={ getKeybindingWithControl('Delete task', 'Backspace') } placement="bottom">
                        <IconButton icon={ deleteLast } onClick={ () => deleteSelectedItem() } isDisabled={ selectedItem === undefined } />
                    </Tooltip>
                </FlexCell>
                <FlexSpacer />
                <FlexCell cx={ css.search } width={ 295 }>
                    <SearchInput value={ tableState.search } onValueChange={ searchHandler } placeholder="Search" debounceDelay={ 1000 } />
                </FlexCell>
                <div className={ css.divider } />
                <FlexCell width="auto">
                    <IconButton icon={ undoIcon } onClick={ undo } isDisabled={ !canUndo } />
                </FlexCell>
                <FlexCell width="auto">
                    <IconButton icon={ redoIcon } onClick={ redo } isDisabled={ !canRedo } />
                </FlexCell>
                <FlexCell width="auto">
                    <Button size="30" caption="Cancel" onClick={ revert } isDisabled={ !isChanged } />
                </FlexCell>
                <FlexCell width="auto">
                    <Button size="30" color="accent" caption="Save" onClick={ save } isDisabled={ !isChanged } />
                </FlexCell>
            </FlexRow>
            <DataTable
                headerTextCase="upper"
                getRows={ () => rows }
                columns={ columns }
                value={ tableState }
                onValueChange={ setTableState }
                dataTableFocusManager={ dataTableFocusManager }
                showColumnsConfig
                allowColumnsResizing
                allowColumnsReordering
                { ...listProps }
            />
        </Panel>
    );
}
