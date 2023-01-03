import * as React from 'react';
import { EditableDocContent, DocExample, BaseDocsBlock, UUI3, UUI4 } from '../common';

export class TagDoc extends BaseDocsBlock {
    title = 'Tag';

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docProps/loveship/components/widgets/docs/tag.doc.ts',
            [UUI4]: './app/src/docProps/epam-promo/components/widgets/tag.doc.tsx',
        };
    }

    renderContent() {
        return (
            <>
                <EditableDocContent fileName='tag-descriptions' />
                { this.renderSectionTitle('Examples') }
                <DocExample
                    title='Basic'
                    path='./examples/tag/Basic.example.tsx'
                />
                <DocExample
                    title='Size'
                    path='./examples/tag/Size.example.tsx'
                />
            </>
        );
    }
}
