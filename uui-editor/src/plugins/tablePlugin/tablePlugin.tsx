import React from 'react';

import { Dropdown } from '@epam/uui-components';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import { isPluginActive, isTextSelected } from '../../helpers';
import { ReactComponent as TableIcon } from '../../icons/table-add.svg';

import { PositionedToolbar } from '../../implementation/PositionedToolbar';
import { ToolbarButton } from '../../implementation/ToolbarButton';

import { PlateEditor, PlatePlugin, Value, getPluginType, insertNodes, someNode, usePlateEditorState, withoutNormalizing } from '@udecode/plate-common';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR, TablePlugin, createTablePlugin } from '@udecode/plate-table';
import { MergeToolbarContent } from './MergeToolbarContent';
import { TableToolbarContent } from './ToolbarContent';
import { createInitialTable, selectFirstCell } from './utils';
import { TableRowElement } from './TableRowElement';
import { TableCellElement } from './TableCellElement';
import { TableElement } from './TableElement';
import { withSelectionTable } from './withSelectionTable';
import { useSelectedCells } from './useSelectedCells';
import { getTableGridAbove } from './getTableGridAbove';

const noop = () => {};

function TableRenderer(props: any) {
    const editor = usePlateEditorState();
    const isReadonly = useReadOnly();
    const isFocused = useFocused();
    const isSelected = useSelected();

    const cellEntries = getTableGridAbove(editor, { format: 'cell' });
    const hasEntries = !!cellEntries?.length;
    const showToolbar = !isReadonly && isSelected && isFocused && hasEntries;

    return (
        <Dropdown
            renderTarget={ (innerProps: any) => (
                <div ref={ innerProps.ref }>
                    <TableElement { ...props } />
                </div>
            ) }
            renderBody={ () => (
                <PositionedToolbar
                    placement="bottom"
                    children={
                        cellEntries.length > 1
                            ? <MergeToolbarContent cellEntries={ cellEntries } />
                            : <TableToolbarContent cellEntries={ cellEntries } />
                    }
                    editor={ editor }
                    isTable
                />
            ) }
            onValueChange={ noop }
            value={ showToolbar }
            placement="top"
        />
    );
}

export function TableButton({ editor }: { editor: PlateEditor; }) {
    if (!isPluginActive(ELEMENT_TABLE)) return null;

    const onCreateTable = async () => {
        if (!editor) return;

        withoutNormalizing(editor, () => {
            const isCurrentTableSelection = !!someNode(editor, {
                match: { type: getPluginType(editor, ELEMENT_TABLE) },
            });

            if (!isCurrentTableSelection) {
                insertNodes(editor, createInitialTable(editor));
                selectFirstCell(editor);
            }
        });
    };

    return (
        <ToolbarButton
            isDisabled={ isTextSelected(editor, true) }
            onClick={ onCreateTable }
            icon={ TableIcon }
        />
    );
}

type CreateTablePlugin = () => PlatePlugin<TablePlugin<Value>, Value, PlateEditor<Value>>;

export const tablePlugin: CreateTablePlugin = () => createTablePlugin({
    overrideByKey: {
        [ELEMENT_TABLE]: {
            type: 'table',
            component: TableRenderer,
            withOverrides: withSelectionTable,
        },
        [ELEMENT_TR]: {
            type: 'table_row',
            component: TableRowElement,
        },
        [ELEMENT_TD]: {
            type: 'table_cell',
            component: TableCellElement,
        },
        [ELEMENT_TH]: {
            type: 'table_header_cell',
            component: TableCellElement,
        },
    },
});
