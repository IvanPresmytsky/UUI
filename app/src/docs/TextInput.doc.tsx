import * as React from 'react';
import * as uui from '@epam/uui';
import * as loveship from '@epam/loveship';
import * as promo from '@epam/promo';
import * as electric from '@epam/electric';
import {
    DocBuilder,
    DocPreviewBuilder,
    TDocConfig,
    TDocContext,
    TPreviewCellSize, TPreviewMatrix,
    TSkin,
} from '@epam/uui-docs';
import { BaseDocsBlock, DocExample, EditableDocContent } from '../common';
import { TTextInputPreview } from './_types/previewIds';

export class TextInputDoc extends BaseDocsBlock {
    title = 'Text Input';

    static override config: TDocConfig = {
        name: 'TextInput',
        contexts: [TDocContext.Default, TDocContext.Resizable, TDocContext.Form, TDocContext.Table],
        bySkin: {
            [TSkin.UUI]: { type: '@epam/uui:TextInputProps', component: uui.TextInput },
            [TSkin.Loveship]: { type: '@epam/uui:TextInputProps', component: loveship.TextInput },
            [TSkin.Promo]: { type: '@epam/uui:TextInputProps', component: promo.TextInput },
            [TSkin.Electric]: { type: '@epam/uui:TextInputProps', component: electric.TextInput },
        },
        doc: (doc: DocBuilder<uui.TextInputProps>) => {
            doc.merge('type', { defaultValue: 'text' });
            doc.merge('mode', { defaultValue: 'form' });
            doc.merge('iconPosition', { defaultValue: 'left' });
            doc.merge('maxLength', { examples: [10, 20, 30] });
        },
        preview: (docPreview: DocPreviewBuilder<uui.TextInputProps>) => {
            const TEST_DATA = {
                value: 'Test',
                icon: 'action-account-fill.svg',
                placeholder: 'Test placeholder',
            };
            type TMatrixLocal = TPreviewMatrix<uui.TextInputProps>;
            const statesBaseMatrix: TMatrixLocal = {
                size: { values: ['30'] },
                isInvalid: { values: [false, true] },
                isDisabled: { values: [false, true], condition: (props) => !props.isInvalid },
                isReadonly: { values: [false, true], condition: (props) => !props.isInvalid && !props.isDisabled },
            };
            const baseMatrix: TMatrixLocal = {
                size: { examples: '*' },
                icon: { examples: [undefined, TEST_DATA.icon] },
                iconPosition: { examples: '*', condition: (pp) => !!pp.icon },
                isDropdown: { values: [false, true] },
                onAccept: { examples: ['callback'] },
                onCancel: { examples: ['callback'] },
                value: { values: [undefined, TEST_DATA.value] },
            };
            const w180_h80: TPreviewCellSize = '180-80';
            const w180_h50: TPreviewCellSize = '180-50';
            const formBaseMatrix: TMatrixLocal = { mode: { examples: ['form'] }, ...baseMatrix };
            docPreview.add(TTextInputPreview['Form'], formBaseMatrix, w180_h80);
            docPreview.add(TTextInputPreview['Form States'], { ...formBaseMatrix, ...statesBaseMatrix }, w180_h50);
            const inlineBaseMatrix: TMatrixLocal = { mode: { examples: ['inline'] }, ...baseMatrix };
            docPreview.add(TTextInputPreview['Inline'], inlineBaseMatrix, w180_h80);
            docPreview.add(TTextInputPreview['Inline States'], { ...inlineBaseMatrix, ...statesBaseMatrix }, w180_h50);
        },
    };

    renderContent() {
        return (
            <>
                <EditableDocContent fileName="textInput-descriptions" />
                {this.renderSectionTitle('Examples')}
                <DocExample title="Basic" path="./_examples/textInput/Basic.example.tsx" />
                <DocExample title="Size" path="./_examples/textInput/Size.example.tsx" />
                <DocExample title="Action" path="./_examples/textInput/Action.example.tsx" />
            </>
        );
    }
}
