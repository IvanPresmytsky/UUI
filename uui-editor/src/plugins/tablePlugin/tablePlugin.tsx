import React from 'react';

import { Dropdown } from '@epam/uui-components';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import { isPluginActive, isTextSelected } from '../../helpers';
import { ReactComponent as TableIcon } from '../../icons/table-add.svg';

import { FloatingToolbar } from '../../implementation/PositionedToolbar';
import { ToolbarButton } from '../../implementation/ToolbarButton';

import { DeserializeHtml, PlateEditor, getPluginType, insertNodes, someNode, useEditorRef, withoutNormalizing } from '@udecode/plate-common';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR, TablePlugin, createTablePlugin, getTableGridAbove, useTableMergeState } from '@udecode/plate-table';
import { MergeToolbarContent } from './MergeToolbarContent';
import { TableToolbarContent } from './ToolbarContent';
import { createInitialTable, selectFirstCell } from './utils';
import { TableRowElement } from './TableRowElement';
import { TableCellElement } from './TableCellElement';
import { TableElement } from './TableElement';
import { WithToolbarButton } from '../../implementation/Toolbars';

const noop = () => {};

function TableRenderer(props: any) {
    const editor = useEditorRef();
    const isReadonly = useReadOnly();
    const isFocused = useFocused();
    const isSelected = useSelected();

    const cellEntries = getTableGridAbove(editor, { format: 'cell' });
    const hasEntries = !!cellEntries?.length;
    const showToolbar = !isReadonly && isSelected && isFocused && hasEntries;
    const { canMerge, canUnmerge } = useTableMergeState();

    return (
        <Dropdown
            renderTarget={ (innerProps: any) => (
                <div ref={ innerProps.ref }>
                    <TableElement { ...props } />
                </div>
            ) }
            renderBody={ () => (
                <FloatingToolbar
                    placement="bottom"
                    children={
                        canMerge
                            ? <MergeToolbarContent />
                            : <TableToolbarContent canUnmerge={ canUnmerge } />
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

// TODO: move to plate
const createGetNodeFunc = (type: string) => {
    const getNode: DeserializeHtml['getNode'] = (element) => {
        const background = element.style.background || element.style.backgroundColor;
        if (background) {
            return {
                type,
                background,
            };
        }

        return { type };
    };
    return getNode;
};

export const tablePlugin = () => createTablePlugin<WithToolbarButton & TablePlugin>({
    overrideByKey: {
        [ELEMENT_TABLE]: {
            type: 'table',
            component: TableRenderer,
        },
        [ELEMENT_TR]: {
            type: 'table_row',
            component: TableRowElement,
        },
        [ELEMENT_TD]: {
            type: 'table_cell',
            component: TableCellElement,
            deserializeHtml: {
                getNode: createGetNodeFunc('table_cell'),
            },
        },
        [ELEMENT_TH]: {
            type: 'table_header_cell',
            component: TableCellElement,
            deserializeHtml: {
                getNode: createGetNodeFunc('table_header_cell'),
            },
        },
    },
    options: {
        enableMerging: true,
        bottomBarButton: TableButton,
    },
});

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
