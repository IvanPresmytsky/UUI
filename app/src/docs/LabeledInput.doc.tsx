import * as React from 'react';
import { EditableDocContent, DocExample, BaseDocsBlock, UUI3, UUI4 } from '../common';

export class LabeledInputDoc extends BaseDocsBlock {
    title = 'Labeled Input';

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docProps/loveship/components/layout/labeledInput.doc.tsx',
            [UUI4]: './app/src/docProps/epam-promo/components/layout/labeledInput.doc.tsx',
        };
    }


    renderContent() {
        return (
            <>
                <EditableDocContent fileName='labeledInput-descriptions' />
                { this.renderSectionTitle('Examples') }
                <DocExample
                    title='Basic'
                    path='./examples/labeledInput/Basic.example.tsx'
                />
            </>
        );
    }
}
