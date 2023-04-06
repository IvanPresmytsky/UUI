import {
    PlateEditor,
    Value,
    createInsertDataPlugin,
    findEventRange,
    select,
} from "@udecode/plate";
import { isEqual } from "lodash";
import {
    UploadFileOptions,
    UploadType,
    createFileUploader,
} from "./file_uploader";

interface UploadFilePluginOptions {
    uploadFiles: (
        editor: PlateEditor,
        files: File[],
        overriddenAction?: UploadType
    ) => Promise<void>;
}

const isFilesUploadEvent = (types: readonly string[], files: FileList) => {
    if (!isEqual(types, ["Files"])) return false;
    if (files.length === 0) return false;

    return true;
};

export const uploadFilePlugin = (uploadOptions?: UploadFileOptions) =>
    createInsertDataPlugin<UploadFilePluginOptions, Value, PlateEditor<Value>>({
        options: { uploadFiles: createFileUploader(uploadOptions) },
        handlers: {
            onDrop: (editor, plugin) => {
                return (event) => {
                    const types = event.dataTransfer.types;
                    const { files } = event.dataTransfer;
                    if (!isFilesUploadEvent(types, files)) return false;

                    event.preventDefault();
                    event.stopPropagation();

                    // update drop location depending on cursor
                    const at = findEventRange(editor, event);
                    if (!at) return false;
                    select(editor, at);

                    plugin.options.uploadFiles(editor, Array.from(files));
                    return true;
                };
            },
            onPaste: (editor, plugin) => {
                return (event) => {
                    const types = event.clipboardData.types;
                    const { files } = event.clipboardData;
                    if (!isFilesUploadEvent(types, files)) return false;

                    event.preventDefault();
                    event.stopPropagation();
                    plugin.options.uploadFiles(editor, Array.from(files));
                    return true;
                };
            },
        },
    });
