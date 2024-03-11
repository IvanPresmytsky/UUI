import fs from 'fs';
import path from 'path';
import { createSerializer } from '../serialization';
import {
    baseMarksPlugin,
    headerPlugin,
    colorPlugin,
    superscriptPlugin,
    listPlugin,
    toDoListPlugin,
    quotePlugin,
    linkPlugin,
    notePlugin,
    uploadFilePlugin,
    attachmentPlugin,
    imagePlugin,
    videoPlugin,
    iframePlugin,
    separatorPlugin,
    tablePlugin,
    codeBlockPlugin,
} from '../plugins';
import { defaultPlugins } from '../defaultPlugins';
import { createPlateEditor } from '@udecode/plate-core';
import { editorValueMock } from './data/md-serialization-content';
import { createTempEditor } from '../helpers';

export const readTestFile = (filepath: string): string => {
    const absoluteFilepath = path.resolve(__dirname, filepath);
    return fs.readFileSync(absoluteFilepath, 'utf8');
};

export const createClipboardData = (html: string, rtf?: string): DataTransfer =>
    ({
        getData: (format: string) => (format === 'text/html' ? html : rtf),
    } as any);

const plugins = [
    ...defaultPlugins,
    baseMarksPlugin(),
    headerPlugin(),
    colorPlugin(),
    superscriptPlugin(),
    listPlugin(),
    toDoListPlugin(),
    quotePlugin(),
    linkPlugin(),
    notePlugin(),
    uploadFilePlugin({}),
    attachmentPlugin(),
    imagePlugin(),
    videoPlugin(),
    iframePlugin(),
    separatorPlugin(),
    tablePlugin(),
    codeBlockPlugin(),
];

const initEditor = () => {
    const editor = createTempEditor(plugins);
    editor.children = [
        {
            data: {},
            type: 'paragraph',
            children: [
                {
                    text: '',
                },
            ],
        },
    ];
    return createPlateEditor({
        editor,
        plugins,
    });
};

describe('serialization', () => {
    it('should paste data with tables', async () => {
        const editor = initEditor();

        const data = createClipboardData(readTestFile('./data/html-tables-serialization.html'));
        editor.insertData(data);

        expect(editor.children).toMatchSnapshot();
    });

    it('should serialize markdown', async () => {
        const serializeMd = createSerializer('md');
        const serializedMd = serializeMd(editorValueMock);
        expect(serializedMd).toMatchSnapshot();
    });
});
