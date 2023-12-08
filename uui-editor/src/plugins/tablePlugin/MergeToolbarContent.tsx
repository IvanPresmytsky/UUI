import React from 'react';

import { ReactComponent as TableMerge } from '../../icons/table-merge.svg';
import { ToolbarButton } from '../../implementation/ToolbarButton';
import { useEditorState } from '@udecode/plate-common';
import { mergeTableCells } from '@udecode/plate-table';

export function MergeToolbarContent() {
    const editor = useEditorState();

    return (
        <ToolbarButton
            onClick={ () => mergeTableCells(editor) }
            icon={ TableMerge }
        />
    );
}
