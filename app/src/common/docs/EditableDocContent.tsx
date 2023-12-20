import React, { createRef, RefObject } from 'react';
import { IEditableDebouncer } from '@epam/uui-core';
import { Blocker } from '@epam/uui';
import { SlateEditor, basePlugins, toDoListPlugin, attachmentPlugin, imagePlugin, videoPlugin, linkPlugin, iframePlugin,
    notePlugin, separatorPlugin, headerPlugin, colorPlugin, superscriptPlugin, listPlugin, quotePlugin, tablePlugin,
    codeBlockPlugin, EditorValue,
} from '@epam/uui-editor';
import { svc } from '../../services';
import css from './EditableDocContent.module.scss';
import { typeRefRTEPlugin } from '../apiReference/typeRefRTEPlugin';
import { FlexRow, IconButton } from '@epam/uui';
import { ReactComponent as AnchorIcon } from '@epam/assets/icons/common/action-external_link-18.svg';

export interface EditableDocContentProps {
    fileName: string;
    title?: string;
}

interface EditableDocContentState {
    content: EditorValue;
    isLoading: boolean;
}

export class EditableDocContent extends React.Component<EditableDocContentProps, EditableDocContentState> {
    titleRef: RefObject<HTMLDivElement> = createRef();
    abortController: AbortController;

    state: EditableDocContentState = {
        content: null,
        isLoading: true,
    };

    uploadFile = (file: File, onProgress: (progress: number) => any): any => {
        return svc.uuiApi.uploadFile('/upload/uploadFileMock', file, {
            onProgress,
        });
    };

    plugins = [
        ...basePlugins,
        headerPlugin(),
        colorPlugin(),
        superscriptPlugin(),
        listPlugin(),
        toDoListPlugin(),
        linkPlugin(),
        quotePlugin(),
        attachmentPlugin(),
        imagePlugin(),
        videoPlugin(),
        iframePlugin(),
        notePlugin(),
        separatorPlugin(),
        tablePlugin(),
        codeBlockPlugin(),
        typeRefRTEPlugin(),
    ];

    private scrollToView() {
        if (this.titleRef?.current && window.location?.hash?.includes(this.titleRef.current.id)) {
            this.titleRef.current.scrollIntoView(true);
        }
    }

    componentDidMount() {
        this.abortController = new AbortController();
        svc.uuiApi.processRequest(
            '/api/get-doc-content',
            'POST',
            { name: this.props.fileName },
            { fetchOptions: { signal: this.abortController.signal } },
        )
            .then((res) => {
                this.setState((prevState) => ({
                    content: res.content,
                    isLoading: !prevState.isLoading,
                }));
                this.scrollToView();
            }).catch(() => {});
    }

    componentWillUnmount(): void {
        if (!this.abortController.signal.aborted) {
            this.abortController.abort();
        }
    }

    saveDocContent = (content: any) => {
        this.setState({ content: content });
        svc.uuiApi.processRequest('/api/save-doc-content', 'POST', {
            name: this.props.fileName,
            content: content,
        });
    };

    render() {
        const { isLoading } = this.state;
        return (
            <div className={ css.wrapper }>
                {this.props.title && (
                    <FlexRow spacing="6" cx={ css.titleRow }>
                        <div id={ this.props.title.split(' ').join('_').toLowerCase() } className={ css.title } ref={ this.titleRef }>
                            {this.props.title}
                        </div>
                        <IconButton cx={ css.anchor } icon={ AnchorIcon } color="info" href={ `#${this.props.title.split(' ').join('_').toLowerCase()}` } />
                    </FlexRow>
                )}
                <IEditableDebouncer
                    value={ this.state.content }
                    onValueChange={ this.saveDocContent }
                    render={ (props) => (
                        <SlateEditor
                            placeholder="Please type"
                            plugins={ this.plugins }
                            cx={ css.container }
                            mode="inline"
                            isReadonly={ !window.location.host.includes('localhost') }
                            minHeight={ 36 }
                            fontSize="16"
                            toolbarOnFocus={ true }
                            { ...props }
                        />
                    ) }
                />
                <Blocker isEnabled={ isLoading } />
            </div>
        );
    }
}
