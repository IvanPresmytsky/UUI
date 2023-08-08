import { PlateEditor, createPluginFactory, getBlockAbove, getEndPoint, getPluginType, insertEmptyElement, selectEditor } from '@udecode/plate-common';
import React from 'react';

import { UploadFileToggler } from '@epam/uui-components';

import { isPluginActive, isTextSelected } from '../../helpers';
import { ReactComponent as PdfIcon } from '../../icons/pdf.svg';
import { ToolbarButton } from '../../implementation/ToolbarButton';
import { getBlockAboveByType } from '../../utils/getAboveBlock';
import { PARAGRAPH_TYPE } from '../paragraphPlugin/paragraphPlugin';
import { useFilesUploader } from '../uploadFilePlugin/file_uploader';
import { IframeBlock } from './IframeBlock';

export const IFRAME_PLUGIN_KEY = 'iframe';
export const IFRAME_PLUGIN_TYPE = 'iframe';

export const iframePlugin = () => {
    const createIframePlugin = createPluginFactory({
        key: IFRAME_PLUGIN_KEY,
        type: IFRAME_PLUGIN_TYPE,
        isElement: true,
        isVoid: true,
        component: IframeBlock,
        // paste iframe from clipboard
        then: (editor, { type }) => ({
            deserializeHtml: {
                rules: [{ validNodeName: 'IFRAME' }],
                getNode: (el: HTMLElement) => {
                    const url = el.getAttribute('src');
                    if (url) {
                        return { type, url, src: url, data: { src: url } };
                    }
                },
            },
        }),
        handlers: {
            // move selection to the end of iframe for further new line render on Enter click
            onLoad: (editor) => () => {
                if (!getBlockAboveByType(editor, ['iframe'])) return;

                const videoEntry = getBlockAbove(editor, {
                    match: { type: getPluginType(editor, 'iframe') },
                });
                if (!videoEntry) return;

                const endPoint = getEndPoint(editor, videoEntry[1]);
                selectEditor(editor, { at: endPoint.path, focus: true });
            },
            onKeyDown: (editor) => (event) => {
                if (!getBlockAboveByType(editor, ['iframe'])) return;

                if (event.key === 'Enter') {
                    return insertEmptyElement(editor, PARAGRAPH_TYPE);
                }
            },
        },
    });

    return createIframePlugin();
};

interface IIframeButton {
    editor: PlateEditor;
}

export function IframeButton({ editor }: IIframeButton) {
    if (!isPluginActive(IFRAME_PLUGIN_KEY)) return null;

    const onFilesAdded = useFilesUploader(editor);

    return (
        <UploadFileToggler
            render={ (props) => (
                <ToolbarButton
                    { ...props }
                    icon={ PdfIcon }
                    isDisabled={ isTextSelected(editor, true) }
                />
            ) }
            onFilesAdded={ onFilesAdded }
            accept=".pdf"
        />
    );
}
