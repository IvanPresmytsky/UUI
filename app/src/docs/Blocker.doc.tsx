import * as React from 'react';
import { EditableDocContent, DocExample, BaseDocsBlock, UUI3, UUI4 } from '../common';

export class BlockerDoc extends BaseDocsBlock {
    title = 'Blocker';

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docProps/loveship/components/layout/docs/blocker.doc.ts',
            [UUI4]: './app/src/docProps/epam-promo/components/layout/docs/blocker.doc.ts',
        };
    }

    renderContent() {
        return (
            <>
                <EditableDocContent fileName='blocker-descriptions' />
                { this.renderSectionTitle('Examples') }
                <DocExample
                    title='Basic'
                    path='./examples/blocker/Basic.example.tsx'
                />

                <DocExample
                    title='Advanced'
                    path='./examples/blocker/Advanced.example.tsx'
                />
            </>
        );
    }
}
