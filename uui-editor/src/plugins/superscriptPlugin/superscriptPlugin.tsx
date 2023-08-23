import { createSuperscriptPlugin, MARK_SUPERSCRIPT } from '@udecode/plate-basic-marks';
import { isMarkActive, PlateEditor } from '@udecode/plate-common';
import React from 'react';
import { isPluginActive } from '../../helpers';
import { ReactComponent as SuperScriptIcon } from '../../icons/super-script.svg';
import { ToolbarButton } from '../../implementation/ToolbarButton';
import { handleMarkButtonClick } from '../../utils/handleMarkButtonClick';

const SUPERSCRIPT_TYPE = 'uui-richTextEditor-superscript';

export const superscriptPlugin = () => createSuperscriptPlugin({
    type: SUPERSCRIPT_TYPE,
});

interface IToolbarButton {
    editor: PlateEditor;
}

export function SuperscriptButton({ editor }: IToolbarButton) {
    if (!isPluginActive(MARK_SUPERSCRIPT)) return null;
    return (
        <ToolbarButton
            onClick={ handleMarkButtonClick(editor, SUPERSCRIPT_TYPE) }
            icon={ SuperScriptIcon }
            isActive={ !!editor?.selection && isMarkActive(editor, SUPERSCRIPT_TYPE) }
        />
    );
}
