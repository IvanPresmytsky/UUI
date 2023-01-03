import * as React from 'react';
import { BaseDocsBlock, DocExample, EditableDocContent, UUI3, UUI4 } from '../common';

export class AvatarDoc extends BaseDocsBlock {
    title = 'Avatar';

    getPropsDocPath() {
        return {
            [UUI3]: './app/src/docProps/loveship/components/widgets/avatar.doc.tsx',
            [UUI4]: './app/src/docProps/epam-promo/components/widgets/avatar.doc.tsx',
        };
    }

    renderContent() {
        return (
            <>
                <EditableDocContent fileName='avatar-descriptions' />
                { this.renderSectionTitle('Examples') }
                <DocExample
                    title='Basic'
                    path='./examples/avatar/Basic.example.tsx'
                />
            </>
        );
    }
}
